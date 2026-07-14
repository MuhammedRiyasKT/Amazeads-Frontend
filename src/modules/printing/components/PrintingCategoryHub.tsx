"use client";

import React from "react";
import { useRouter } from "next/navigation"; // നാവിഗേഷൻ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { Sparkles, Camera, Flame } from "lucide-react";
import styles from "./PrintingComponents.module.css";

export default function PrintingCategoryHub() {
  const router = useRouter();

  const categories = [
    {
      id: "uv",
      name: "UV Print",
      path: "/printing/uvprint", // സബ് റൂട്ട് പാത്ത്
      desc: "Flatbed printing on acrylic, wood, glass & rigid substrates with UV LED curing.",
      icon: Sparkles,
      themeClass: styles.uvTheme,
      activeJobs: "8 Active Jobs",
    },
    {
      id: "photo",
      name: "Photo Print",
      path: "/printing/photo-print", // സബ് റൂട്ട് പാത്ത്
      desc: "High-color accuracy printing on satin, gloss, matte papers and premium canvas.",
      icon: Camera,
      themeClass: styles.photoTheme,
      activeJobs: "6 Active Jobs",
    },
    {
      id: "laser",
      name: "Laser Print",
      path: "/printing/laser-print", // സബ് റൂട്ട് പാത്ത്
      desc: "Sleek CO2 laser cutting and precise engraving on wood, MDF, and custom acrylics.",
      icon: Flame,
      themeClass: styles.laserTheme,
      activeJobs: "4 Active Jobs",
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
            onClick={() => router.push(cat.path)} // ക്ലിക്ക് ചെയ്യുമ്പോൾ സബ്-റൂട്ടിലേക്ക് കൊണ്ടുപോകുന്നു
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