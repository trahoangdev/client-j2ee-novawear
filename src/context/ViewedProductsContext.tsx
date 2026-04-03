import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { viewedProductsApi } from '@/lib/customerApi';
import { productDtoToDisplay, type ProductDisplay } from '@/lib/productUtils';
import type { ViewedProductDto } from '@/types/api';

const STORAGE_KEY = 'novawear_viewed';
const MAX_VIEWED = 20;

export interface ViewedProductData {
  product: ProductDisplay;
  viewedAt: number; // unix ms timestamp
}

interface ViewedProductsContextValue {
  items: ViewedProductData[];
  loading: boolean;
  addViewed: (product: ProductDisplay) => void;
  clearAll: () => void;
  removeViewed: (productId: string) => void;
  count: number;
}

const ViewedProductsContext = createContext<ViewedProductsContextValue | undefined>(undefined);

function loadFromLocal(): ViewedProductData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToLocal(items: ViewedProductData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function viewedProductDtoToData(dto: ViewedProductDto): ViewedProductData {
  return {
    product: productDtoToDisplay(dto.product),
    viewedAt: new Date(dto.viewedAt).getTime(),
  };
}

export function ViewedProductsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<ViewedProductData[]>(() => loadFromLocal());
  const [loading, setLoading] = useState(false);

  // Sync localStorage whenever items change
  useEffect(() => {
    saveToLocal(items);
  }, [items]);

  // On login: merge DB data into localStorage (DB wins for duplicates)
  const mergeDbWithLocal = useCallback((dbItems: ViewedProductData[]) => {
    setItems((localItems) => {
      const localMap = new Map(localItems.map((i) => [i.product.id, i]));
      dbItems.forEach((dbItem) => localMap.set(dbItem.product.id, dbItem));
      const merged = Array.from(localMap.values())
        .sort((a, b) => b.viewedAt - a.viewedAt)
        .slice(0, MAX_VIEWED);
      return merged;
    });
  }, []);

  // Load from DB when user logs in
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    viewedProductsApi
      .list()
      .then(({ data }) => {
        const dbItems = data.map(viewedProductDtoToData);
        mergeDbWithLocal(dbItems);
      })
      .catch(() => {
        // ignore – fall back to localStorage
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addViewed = useCallback(
    (product: ProductDisplay) => {
      const newItem: ViewedProductData = { product, viewedAt: Date.now() };
      setItems((prev) => {
        const without = prev.filter((x) => x.product.id !== product.id);
        return [newItem, ...without].slice(0, MAX_VIEWED);
      });
      if (isAuthenticated) {
        viewedProductsApi.record(Number(product.id)).catch(() => {
          // ignore – localStorage already updated
        });
      }
    },
    [isAuthenticated]
  );

  const removeViewed = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((x) => x.product.id !== productId));
      if (isAuthenticated) {
        viewedProductsApi.remove(Number(productId)).catch(() => {
          // ignore
        });
      }
    },
    [isAuthenticated]
  );

  const clearAll = useCallback(() => {
    setItems([]);
    if (isAuthenticated) {
      viewedProductsApi.clearAll().catch(() => {
        // ignore
      });
    }
  }, [isAuthenticated]);

  const value: ViewedProductsContextValue = {
    items,
    loading,
    addViewed,
    clearAll,
    removeViewed,
    count: items.length,
  };

  return <ViewedProductsContext.Provider value={value}>{children}</ViewedProductsContext.Provider>;
}

export function useViewedProducts() {
  const context = useContext(ViewedProductsContext);
  if (context === undefined) {
    throw new Error('useViewedProducts must be used within a ViewedProductsProvider');
  }
  return context;
}
