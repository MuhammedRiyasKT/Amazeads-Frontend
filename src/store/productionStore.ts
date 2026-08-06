import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubDepartment {
  id: number;
  department_id: number;
  sub_department_name: string;
  description: string;
  status: boolean;
}

interface ProductionState {
  selectedSubDept: SubDepartment | null;
  setSelectedSubDept: (subDept: SubDepartment) => void;
}

export const useProductionStore = create<ProductionState>()(
  persist(
    (set) => ({
      selectedSubDept: null,
      setSelectedSubDept: (subDept) => set({ selectedSubDept: subDept }),
    }),
    {
      name: "production-sub-dept-storage",
    }
  )
);