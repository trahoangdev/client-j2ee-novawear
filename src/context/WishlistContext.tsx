import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'novawear_wishlist';

interface WishlistContextValue {
  itemIds: string[];
  has: (productId: string) => boolean;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [itemIds, setItemIds] = useState<string[]>(() => loadIds());

  useEffect(() => {
    saveIds(itemIds);
  }, [itemIds]);

  const has = useCallback((productId: string) => itemIds.includes(String(productId)), [itemIds]);
  const add = useCallback((productId: string) => {
    const id = String(productId);
    setItemIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);
  const remove = useCallback((productId: string) => {
    setItemIds((prev) => prev.filter((id) => id !== String(productId)));
  }, []);
  const toggle = useCallback((productId: string) => {
    const id = String(productId);
    setItemIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const value: WishlistContextValue = {
    itemIds,
    has,
    add,
    remove,
    toggle,
    count: itemIds.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
