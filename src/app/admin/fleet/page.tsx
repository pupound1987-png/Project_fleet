
"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import VehiclesPage from "@/app/vehicles/page";

// We reuse the VehiclesPage component for Fleet Management but could extend it here
export default function AdminFleetPage() {
  return <VehiclesPage />;
}
