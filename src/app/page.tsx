
"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { VehicleAvailability } from "@/components/dashboard/vehicle-availability";
import { AnomalyDetectionWidget } from "@/components/admin/anomaly-detection-widget";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function DashboardPage() {
  const db = useFirestore();
  const bookingsRef = useMemoFirebase(() => collection(db, "bookings"), [db]);
  const { data: bookings } = useCollection(bookingsRef);

  const exportToExcel = () => {
    if (!bookings || bookings.length === 0) return;

    const headers = ["Booking ID", "Vehicle", "Employee", "Department", "Destination", "Start", "End", "Status"];
    const csvContent = [
      headers.join(","),
      ...bookings.map(b => [
        b.bookingId,
        b.vehicleName,
        b.employeeName,
        b.department,
        b.destination,
        b.startDateTime,
        b.endDateTime,
        b.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fleet_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-blue-900">Operational Dashboard | แผงการดำเนินงาน</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="hidden sm:flex border-green-600 text-green-700 hover:bg-green-50">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel | ส่งออกไฟล์
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-md">
              <Link href="/bookings">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Booking | จองรถใหม่
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-blue-950">Fleet Overview | ภาพรวมฟลีทรถ</h1>
            <p className="text-muted-foreground">Monitor real-time vehicle status and upcoming reservations. (ติดตามสถานะรถแบบเรียลไทม์และการจองที่กำลังจะถึง)</p>
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
