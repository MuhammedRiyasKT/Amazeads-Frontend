// src/app/(dashboard)/layout.tsx
import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/navbar/Navbar"; // (ഇതുപോലെ നാവ്ബാറും ക്രിയേറ്റ് ചെയ്യാം)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Shared Sidebar */}
      <Sidebar />
      
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Shared Navbar */}
        <Navbar />
        
        {/* Dynamic Page Content */}
        <main style={{ padding: "24px", flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}