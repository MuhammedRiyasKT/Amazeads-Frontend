"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintingKPIs from "../components/PrintingKPIs";
import QueueFilters from "../components/QueueFilters";
import QueueCardGrid from "../components/QueueCardGrid";
import styles from "../components/PrintingComponents.module.css";

interface PrintingDashboardPageProps {
  categoryName: string;
}

export default function PrintingDashboardPage({ categoryName }: PrintingDashboardPageProps) {
  return (
    // സബ് പേജുകളിൽ സൈഡ്ബാറും നാവ്ബാറും ഉള്ളതിനാൽ 'subPageContainer' ക്ലാസ് ഉപയോഗിക്കുന്നു
    <div className={styles.subPageContainer}>
      <div>
        {/* കാറ്റഗറി ഹബ്ബിലേക്ക് തിരികെ പോകാനുള്ള ലിങ്ക് ബട്ടൺ */}
        <Link href="/printing" passHref legacyBehavior>
          <a className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Categories
          </a>
        </Link>
        <h1 className={styles.title}>Daily Printing Queue ({categoryName})</h1>
        <p className={styles.subtitle}>Manage your upcoming and active print jobs for {categoryName}.</p>
      </div>

      <PrintingKPIs />
      <QueueFilters />
      <QueueCardGrid />
    </div>
  );
}