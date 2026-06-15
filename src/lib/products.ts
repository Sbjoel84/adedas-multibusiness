import type { Product } from '@/data/products'
import { apiGet, apiPost, apiPut, apiDelete } from './api'

export async function listProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/api/products')
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  return apiPost<Product>('/api/products', product)
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product> {
  return apiPut<Product>(`/api/products/${id}`, updates)
}

export async function deleteProduct(id: string): Promise<void> {
  await apiDelete(`/api/products/${id}`)
}
