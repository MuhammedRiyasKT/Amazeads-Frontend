"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar/Navbar";
import { useSidebarStore } from "@/store/sidebarStore";

import PostLoginCheckInModal from "@/modules/profile/components/PostLoginCheckInModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  // കാറ്റഗറി ഹബ്ബ് പേജുകൾ (ഇവയിൽ സൈഡ്ബാറും നാവ്ബാറും ഉണ്ടാവില്ല)
  const isFullPageHub = pathname === "/printing" || pathname === "/production";

  // Sidebar width: 64px collapsed, 260px expanded
  const sidebarWidth = isCollapsed ? "64px" : "260px";

  return (
    <div className="flex min-h-screen">
      {/* ലോഗിൻ ചെയ്ത ശേഷം non-admin യൂസർമാർ ചെക്ക് ഇൻ ചെയ്തിട്ടില്ലെങ്കിൽ കാണിക്കുന്ന മോഡൽ 🌟 */}
      <PostLoginCheckInModal />

      {/* ഹബ്ബ് പേജ് അല്ലെങ്കിൽ മാത്രം സൈഡ്ബാർ കാണിക്കുന്നു */}
      {!isFullPageHub && <Sidebar />}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ഹബ്ബ് പേജ് അല്ലെങ്കിൽ മാത്രം നാവ്ബാർ കാണിക്കുന്നു */}
        {!isFullPageHub && <Navbar />}

        <main
          className="bg-slate-100 box-border overflow-x-hidden"
          style={
            isFullPageHub
              ? { width: "100%", minHeight: "100vh" }
              : {
                marginLeft: sidebarWidth,
                marginTop: "70px",
                width: `calc(100% - ${sidebarWidth})`,
                minHeight: "calc(100vh - 70px)",
                transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}