import { useState, useEffect, useCallback } from "react";
import { Product, products as defaultProducts, categories as defaultCategories } from "@/data/products";

const STORAGE_KEY = "adedas_products";

function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [...defaultProducts];
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const id = crypto.randomUUID();
    setProducts((prev) => [...prev, { ...product, id }]);
    return id;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, "id">>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))).sort(),
  ];

  return { products, categories, addProduct, updateProduct, deleteProduct };
}
