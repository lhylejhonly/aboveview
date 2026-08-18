'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import {
  fetchProducts, insertProduct, upsertProduct, removeProduct,
  fetchCategories, insertCategory, upsertCategory, removeCategory,
} from '@/lib/db';

export interface CategoryMeta {
  id: string;
  label: string;
}

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  categories: CategoryMeta[];
  addCategory: (cat: CategoryMeta) => Promise<void>;
  updateCategory: (cat: CategoryMeta) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  // Start consistently on server and client, then restore the session in the browser.
  // Reading sessionStorage during the initial render can cause an admin-page
  // hydration mismatch and leave client-only routes blank.
  const [isAdmin, setIsAdmin] = useState(false);
  // Admin data must come from Supabase; do not seed the management UI with
  // storefront demo products when the database is empty or unavailable.
  const [products, setProducts] = useState<Product[]>([]);
  // Categories must come from Supabase; do not display demo categories.
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dbProducts, dbCategories] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(dbProducts);
      setCategories(dbCategories);
    } catch {
      setError('Unable to load products and categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/session').then(response => response.json()).then(data => setIsAdmin(data.authenticated === true)).catch(() => setIsAdmin(false));
    (async () => {
      try {
        const [dbProducts, dbCategories] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(dbProducts);
        setCategories(dbCategories);
      } catch {
        setError('Unable to load products and categories.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (password: string) => {
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const ok = response.ok;
    if (ok) setIsAdmin(true);
    return ok;
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
  };

  const addProduct = async (product: Product) => {
    await insertProduct(product);
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = async (product: Product) => {
    await upsertProduct(product);
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = async (id: string) => {
    await removeProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = async (cat: CategoryMeta) => {
    await insertCategory(cat);
    setCategories(prev => [...prev, cat]);
  };

  const updateCategory = async (cat: CategoryMeta) => {
    await upsertCategory(cat);
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const deleteCategory = async (id: string) => {
    await removeCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AdminContext.Provider value={{
      isAdmin, login, logout, loading, error, refresh,
      products, addProduct, updateProduct, deleteProduct,
      categories, addCategory, updateCategory, deleteCategory,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
