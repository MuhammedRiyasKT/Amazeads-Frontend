import { create } from "zustand";
import { persist } from "zustand/middleware"; // പേജ് റിഫ്രഷ് ചെയ്താലും സ്റ്റേറ്റ് നഷ്ടപ്പെടാതിരിക്കാൻ persist ഉപയോഗിക്കാം

export interface SubDepartment {
  id: number;
  department_id: number;
  sub_department_name: string;
  description: string;
  status: boolean;
}

interface PrintingState {
  selectedSubDept: SubDepartment | null;
  setSelectedSubDept: (subDept: SubDepartment) => void;
  clearSelectedSubDept: () => void;
}

export const usePrintingStore = create<PrintingState>()(
  persist(
    (set) => ({
      selectedSubDept: null,
      setSelectedSubDept: (subDept) => set({ selectedSubDept: subDept }),
      clearSelectedSubDept: () => set({ selectedSubDept: null }),
    }),
    {
      name: "printing-sub-dept-storage", // localStorage Key Name
    }
  )
);