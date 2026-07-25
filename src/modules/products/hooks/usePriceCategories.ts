"use client";

import { useState, useEffect } from "react";
import { PriceCategory } from "../types/category";
import { getPriceCategories } from "../services/category.service";

export function usePriceCategories() {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPriceCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getPriceCategories();
      setPriceCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceCategories();
  }, []);

  return { priceCategories, isLoading, refetch: fetchPriceCategories };
}