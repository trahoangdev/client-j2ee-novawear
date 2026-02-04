import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { products as initialProducts } from '@/data/mock-data';
import type { Product } from '@/types';

type AdminProductsContextValue = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  getProductById: (id: string) => Product | undefined;
};

const AdminProductsContext = createContext<AdminProductsContextValue | null>(null);

export function AdminProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  return (
    <AdminProductsContext.Provider value={{ products, setProducts, getProductById }}>
      {children}
    </AdminProductsContext.Provider>
  );
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductsContext);
  if (!ctx) throw new Error('useAdminProducts must be used within AdminProductsProvider');
  return ctx;
}
