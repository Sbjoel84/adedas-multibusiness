import { useState, useEffect, useCallback } from "react";
import { type Product, defaultProducts } from "@/data/products";
import {
  listProducts,
  createProduct,
  updateProduct as updateProductDb,
  deleteProduct as deleteProductDb,
} from "@/lib/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listProducts();
      setProducts(rows);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      console.warn("useProducts: API unavailable, using local defaults.", err);
      setError(msg);
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProduct = useCallback(async (product: Omit<Product, "id">): Promise<string> => {
    const created = await createProduct(product);
    setProducts((prev) => [...prev, created]);
    return created.id;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, "id">>) => {
    const updated = await updateProductDb(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await deleteProductDb(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))).sort(),
  ];

  return { products, categories, loading, error, addProduct, updateProduct, deleteProduct };
}
