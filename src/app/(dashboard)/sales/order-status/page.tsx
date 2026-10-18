import { Suspense } from "react";
import { SalesOrderStatusOrdersPage } from "@/modules/sales";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <SalesOrderStatusOrdersPage />
    </Suspense>
  );
}
