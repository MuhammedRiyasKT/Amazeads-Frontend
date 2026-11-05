import { Metadata } from "next";
import { AdminSettingsPage } from "@/modules/admin";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Enterprise System and Storage Settings",
};

export default function Page() {
  return <AdminSettingsPage />;
}
