"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Camera, Flame, Printer } from "lucide-react";
import { getPMSubDepartments } from "@/modules/project-manager/services/managerOrder.service";
import { usePrintingStore, SubDepartment } from "@/store/printingStore";
import styles from "./PrintingComponents.module.css";

export default function PrintingCategoryHub() {
  const router = useRouter();
  const setSelectedSubDept = usePrintingStore((state) => state.setSelectedSubDept);

  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 1. API വഴി Printing Sub-Departments ഫെച്ച് ചെയ്യുന്നു (department_id = 2)
  useEffect(() => {
    const fetchSubDepts = async () => {
      try {
        const data = await getPMSubDepartments(2); // 2 = Printing Department
        setSubDepartments(data || []);
      } catch (error) {
        console.error("Failed to load sub-departments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubDepts();
  }, []);

  // 🌟 2. സബ്-ഡിപ്പാർട്ട്മെന്റിന് അനുയോജ്യമായ ഐക്കണും റൂട്ട് പാത്തും നൽകുന്ന ഹെൽപ്പർ
  const getSubDeptMeta = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("uv")) {
      return {
        icon: Sparkles,
        path: "/printing/uvprint",
        themeClass: styles.uvTheme,
      };
    }
    if (lowerName.includes("photo")) {
      return {
        icon: Camera,
        path: "/printing/photo-print",
        themeClass: styles.photoTheme,
      };
    }
    if (lowerName.includes("laser")) {
      return {
        icon: Flame,
        path: "/printing/laser-print",
        themeClass: styles.laserTheme,
      };
    }
    return {
      icon: Printer,
      path: "/printing/tasks",
      themeClass: styles.uvTheme,
    };
  };

  // 🌟 3. കാർഡിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ Zustand-ൽ സ്റ്റോർ ചെയ്ത് റൂട്ട് ചെയ്യുന്നു
  const handleSelectSubDept = (subDept: SubDepartment) => {
    // A. Zustand സ്റ്റോറിലേക്ക് സ്റ്റോർ ചെയ്യുന്നു
    setSelectedSubDept(subDept);

    // B. അനുയോജ്യമായ റൂട്ടിലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു
    const meta = getSubDeptMeta(subDept.sub_department_name);
    router.push(meta.path);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-xs font-semibold text-slate-500">Loading printing units...</div>;
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