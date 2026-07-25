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
        
        {/* 
          പ്രധാന മാറ്റം: 
          1. ഇതിലേക്ക് 'bg-slate-100' എന്ന ബാക്ക്ഗ്രൗണ്ട് ക്ലാസ്സ് നൽകുക.
          2. 'minHeight: "calc(100vh - 70px)"' എന്ന് ഇൻലൈൻ സ്റ്റൈലിൽ ചേർക്കുക.
        */}
        <main 
          className="bg-slate-100" /* ഡാർക്ക് കളർ ക്ലാസ്സ് */
          style={{ 
            marginLeft: isFullPageHub ? "0px" : "260px", 
            marginTop: isFullPageHub ? "0px" : "70px", 
            width: isFullPageHub ? "100%" : "auto", 
            minHeight: isFullPageHub ? "100vh" : "calc(100vh - 70px)",
            transition: "margin 0.2s ease"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}