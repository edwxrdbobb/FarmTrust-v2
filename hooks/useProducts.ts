"use client"

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  category: string;
  featured: boolean;
  status: string;
  organic: boolean;
  location: string;
  harvestDate?: string;
  created_at: string;
  updated_at: string;
  vendor?: {
    _id: string;
    first_name: string;
    last_name: string;
    business_name?: string;
  };
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useVendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchProducts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products?vendor=current&page=${page}&limit=${limit}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove the deleted product from the list
      setProducts(prev => prev.filter(product => product._id !== productId));
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete product' 
      };
    }
  };

  const updateProductStatus = async (productId: string, status: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      // Update the product in the list
      setProducts(prev => prev.map(product => 
        product._id === productId ? { ...product, status } : product
      ));
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update product status' 
      };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    deleteProduct,
    updateProductStatus,
  };
}

export function useBuyerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const fetchProducts = async (page = 1, limit = 12, filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    organic?: boolean;
    featured?: boolean;
    sortBy?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.organic && { organic: 'true' }),
        ...(filters?.featured && { featured: 'true' }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
      });

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
  };
}
