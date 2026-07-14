"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductionKPIs from "../components/ProductionKPIs";
import ProductionQueueFilters from "../components/ProductionQueueFilters";
import ProductionCardGrid from "../components/ProductionCardGrid";
import styles from "../components/ProductionComponents.module.css";

interface ProductionDashboardPageProps {
  categoryName: string;
}

export default function ProductionDashboardPage({ categoryName }: ProductionDashboardPageProps) {
  return (
    <div className={styles.subPageContainer}>
      <div>
        <Link href="/production" passHref legacyBehavior>
          <a className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Categories
          </a>
        </Link>
        <h1 className={styles.title}>Daily Production Queue ({categoryName})</h1>
        <p className={styles.subtitle}>Manage your upcoming and active production jobs for {categoryName}.</p>
      </div>

      <ProductionKPIs />
      <ProductionQueueFilters />
      <ProductionCardGrid />
    </div>
  );
}