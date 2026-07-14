// // src/app/(dashboard)/layout.tsx
// import Sidebar from "@/components/sidebar/Sidebar";
// import Navbar from "@/components/navbar/Navbar"; // (ഇതുപോലെ നാവ്ബാറും ക്രിയേറ്റ് ചെയ്യാം)

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
//       {/* Shared Sidebar */}
//       <Sidebar />
      
//       <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
//         {/* Shared Navbar */}
//         <Navbar />
        
//         {/* Dynamic Page Content */}
//         <main style={{ padding: "24px", flex: 1 }}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // കാറ്റഗറി ഹബ്ബ് പേജുകൾ (ഇവയിൽ സൈഡ്ബാറും നാവ്ബാറും ഉണ്ടാവില്ല)
  const isFullPageHub = pathname === "/printing" || pathname === "/production";

  return (
    <div className="flex min-h-screen">
      {/* ഹബ്ബ് പേജ് അല്ലെങ്കിൽ മാത്രം സൈഡ്ബാർ കാണിക്കുന്നു */}
      {!isFullPageHub && <Sidebar />}
      
      <div className="flex-1 flex flex-col">
        {/* ഹബ്ബ് പേജ് അല്ലെങ്കിൽ മാത്രം നാവ്ബാർ കാണിക്കുന്നു */}
        {!isFullPageHub && <Navbar />}
        
        {/* അഡ്മിൻ, സെയിൽസ്, മാനേജർ അടക്കം എല്ലാ പേജുകളുടെയും മാർജിനുകൾ ഇവിടെ സെൻട്രലൈസ് ചെയ്യുന്നു (പ്രധാന മാറ്റം!) */}
        <main 
          style={{ 
            marginLeft: isFullPageHub ? "0px" : "260px", 
            marginTop: isFullPageHub ? "0px" : "70px", 
            width: isFullPageHub ? "100%" : "auto", 
            transition: "margin 0.2s ease"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}