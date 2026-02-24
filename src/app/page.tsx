"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { VehicleAvailability } from "@/components/dashboard/vehicle-availability";
import { AnomalyDetectionWidget } from "@/components/admin/anomaly-detection-widget";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileSpreadsheet, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // Fetch user profile to determine role
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  
  const isAdmin = profile?.role === 'Admin';
  
  const bookingsRef = useMemoFirebase(() => {
    // Wait for user and profile to be ready to avoid permission errors
    if (!db || !user || isProfileLoading) return null;
    
    // If Admin, see all. If Employee, only see own for the main list (though rules allow more)
    if (isAdmin) {
      return collection(db, "bookings");
    } else {
      return query(collection(db, "bookings"), where("employeeId", "==", user.uid));
    }
  }, [db, user, isAdmin, isProfileLoading]);
  
  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsRef);

  const exportToExcel = () => {
    if (!bookings || bookings.length === 0) {
      toast({
        title: "No Data | ไม่มีข้อมูล",
        description: "There are no bookings to export. (ไม่พบรายการจองที่จะส่งออก)",
      });
      return;
    }

    try {
      const headers = ["Booking ID", "Vehicle", "Employee", "Department", "Destination", "Start", "End", "Status"];
      
      const escapeCSV = (val: string) => {
        const stringVal = val ? String(val) : "";
        return `"${stringVal.replace(/"/g, '""')}"`;
      };

      const rows = bookings.map(b => [
        escapeCSV(b.bookingId),
        escapeCSV(b.vehicleName),
        escapeCSV(b.employeeName),
        escapeCSV(b.department),
        escapeCSV(b.destination),
        escapeCSV(b.startDateTime),
        escapeCSV(b.endDateTime),
        escapeCSV(b.status)
      ].join(","));

      const csvContent = [headers.join(","), ...rows].join("\n");
      
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `fleet_bookings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Success | ส่งออกสำเร็จ",
        description: "Your report has been downloaded. (ดาวน์โหลดรายงานเรียบร้อยแล้ว)",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed | ส่งออกไม่สำเร็จ",
        description: "An error occurred during export. (เกิดข้อผิดพลาดในการส่งออก)",
      });
    }
  };

  if (isUserLoading) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b glass-morphism px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-800">Operational Dashboard | แผงควบคุม</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportToExcel} 
              disabled={isBookingsLoading || !bookings || bookings.length === 0}
              className="hidden sm:flex border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              {isBookingsLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Export | ส่งออก
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">
              <Link href="/bookings">
                <PlusCircle className="mr-2 h-4 w-4" />
                จองรถใหม่
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Fleet Overview | ภาพรวมฟลีทรถ</h1>
            <p className="text-slate-500">Monitor real-time vehicle status and upcoming reservations.</p>
          </div>

          <StatsCards />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4 animate-in fade-in slide-in-from-left-4 duration-700">
              <VehicleAvailability />
            </div>
            <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
              <RecentBookings />
              {isAdmin && <AnomalyDetectionWidget />}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
