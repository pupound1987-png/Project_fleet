
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { VehicleAvailability } from "@/components/dashboard/vehicle-availability";
import { AnomalyDetectionWidget } from "@/components/admin/anomaly-detection-widget";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-blue-900">Operational Dashboard</h2>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-md">
            <Link href="/bookings">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          </Button>
        </header>

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-blue-950">Fleet Overview</h1>
            <p className="text-muted-foreground">Monitor real-time vehicle status and upcoming reservations.</p>
          </div>

          <StatsCards />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <VehicleAvailability />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <RecentBookings />
              <AnomalyDetectionWidget />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
