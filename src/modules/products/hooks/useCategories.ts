"use client";

import { useState, useEffect } from "react";
import { Category } from "../types/category";
import { getCategories } from "../services/category.service";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, isLoading, refetch: fetchCategories };
}