"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Scissors, Frame } from "lucide-react";
import styles from "./ProductionComponents.module.css";

export default function ProductionCategoryHub() {
  const router = useRouter();

  const categories = [
    {
      id: "laser",
      name: "Laser Cutting" as const,
      path: "/production/laser-cutting",
      desc: "Sleek CO2 laser cutting, marking, and precise engraving on custom substrates.",
      icon: Scissors,
      themeClass: styles.laserTheme,
      activeJobs: "8 Active Jobs",
    },
    {
      id: "frame",
      name: "Photo Frame" as const,
      path: "/production/photo-frame",
      desc: "Premium wood, acrylic, and composite photo framing with flawless border alignments.",
      icon: Frame,
      themeClass: styles.frameTheme,
      activeJobs: "6 Active Jobs",
    },
  ];

  return (
    <div className={styles.categoryGrid}>
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <div
            key={cat.id}
            className={styles.categoryCard}
            onClick={() => router.push(cat.path)}
          >
            <div className={`${styles.categoryIcon} ${cat.themeClass}`}>
              <Icon size={28} />
            </div>
            <h3 className={styles.catTitle}>{cat.name}</h3>
            <p className={styles.catDesc}>{cat.desc}</p>
            <span className={styles.catBadge}>{cat.activeJobs}</span>
          </div>
        );
      })}
    </div>
  );
}