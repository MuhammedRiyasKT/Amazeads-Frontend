"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Camera, Flame, Printer, LogOut } from "lucide-react";
import { getPMSubDepartments } from "@/modules/project-manager/services/managerOrder.service";
import { usePrintingStore, SubDepartment } from "@/store/printingStore";
import { useAuthStore } from "@/store/authStore";
import styles from "./PrintingComponents.module.css";

export default function PrintingCategoryHub() {
  const router = useRouter();
  const setSelectedSubDept = usePrintingStore((state) => state.setSelectedSubDept);
  const logout = useAuthStore((state) => state.logout);

  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSelectSubDept = (subDept: SubDepartment) => {
    setSelectedSubDept(subDept);
    router.push("/printing/overview");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      if (typeof logout === "function") {
        logout();
      } else {
        sessionStorage.clear();
      }
      router.push("/login");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] flex flex-col justify-between p-4 sm:p-8 box-border">
      {/* 🌟 1. Top Right Logout Button Only */}
      <div className="w-full flex justify-end pt-2 pr-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer shadow-2xs"
          title="Logout of ERP"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>

      {/* 🌟 2. Centered Content Block (Headings placed exactly in the marked red box portion above cards) */}
      <div className="w-full max-w-5xl mx-auto my-auto flex flex-col items-center gap-8 py-6">
        {/* Centered Headings */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Choose Printing Category
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Select a department to view and manage active production jobs.
          </p>
        </div>

        {/* Category Cards Grid */}
        {isLoading ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-500">
            Loading printing units...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
            {subDepartments.map((subDept) => {
              const meta = getSubDeptMeta(subDept.sub_department_name);
              const Icon = meta.icon;

              return (
                <div
                  key={subDept.id}
                  className="bg-white border-1.5 border-slate-300 hover:border-indigo-600 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 shadow-2xs hover:shadow-lg group"
                  onClick={() => handleSelectSubDept(subDept)}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${meta.themeClass}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                    {subDept.sub_department_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                    {subDept.description || "Active production unit"}
                  </p>
                  <span className="text-[11px] font-bold bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-700 text-slate-600 px-3 py-1 rounded-full border border-slate-200/80 transition-colors">
                    Select Production Unit
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div />
    </div>
  );
}