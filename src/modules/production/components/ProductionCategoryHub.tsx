"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Frame, Cog } from "lucide-react";
import { getPMSubDepartments } from "@/modules/project-manager/services/managerOrder.service";
import { useProductionStore, SubDepartment } from "@/store/productionStore";
import styles from "./ProductionComponents.module.css";

export default function ProductionCategoryHub() {
  const router = useRouter();
  const setSelectedSubDept = useProductionStore((state) => state.setSelectedSubDept);

  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 API വഴി Production Sub-Departments ഫെച്ച് ചെയ്യുന്നു (department_id = 3)
  useEffect(() => {
    const fetchSubDepts = async () => {
      try {
        const data = await getPMSubDepartments(3); // 3 = Production Department
        setSubDepartments(data || []);
      } catch (error) {
        console.error("Failed to load production sub-departments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubDepts();
  }, []);

  const getSubDeptMeta = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("laser")) {
      return {
        icon: Scissors,
        path: "/production/laser-cutting",
        themeClass: styles.laserTheme,
      };
    }
    if (lowerName.includes("frame") || lowerName.includes("photo")) {
      return {
        icon: Frame,
        path: "/production/photo-frame",
        themeClass: styles.frameTheme,
      };
    }
    return {
      icon: Cog,
      path: "/production/tasks",
      themeClass: styles.laserTheme,
    };
  };

  const handleSelectSubDept = (subDept: SubDepartment) => {
    setSelectedSubDept(subDept); // Zustand-ൽ സ്റ്റോർ ചെയ്യുന്നു 🌟
    const meta = getSubDeptMeta(subDept.sub_department_name);
    router.push(meta.path);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-xs font-semibold text-slate-500">Loading production units...</div>;
  }

  return (
    <div className={styles.categoryGrid}>
      {subDepartments.map((subDept) => {
        const meta = getSubDeptMeta(subDept.sub_department_name);
        const Icon = meta.icon;

        return (
          <div
            key={subDept.id}
            className={styles.categoryCard}
            onClick={() => handleSelectSubDept(subDept)}
          >
            <div className={`${styles.categoryIcon} ${meta.themeClass}`}>
              <Icon size={28} />
            </div>
            <h3 className={styles.catTitle}>{subDept.sub_department_name}</h3>
            <p className={styles.catDesc}>{subDept.description || "Active production unit"}</p>
            <span className={styles.catBadge}>Select Production Unit</span>
          </div>
        );
      })}
    </div>
  );
}