"use client";

import { useState, useEffect } from "react";
import { Product } from "../types/product";
import { getProducts } from "../services/product.service";

export function useProducts(initialPage: number = 1) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts(page, 5);
      setProducts(data.items || []);
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page]);

  return { products, isLoading, page, setPage, totalPages, refetch: fetchList };
}