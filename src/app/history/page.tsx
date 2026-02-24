
"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { History, MapPin, Clock, Loader2, Inbox } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "bookings"),
      where("employeeId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: bookings, isLoading } = useCollection(historyQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-blue-900">My Booking History | ประวัติการจองของฉัน</h2>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-blue-950">Past Reservations | รายการจองที่ผ่านมา</h1>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading your history...</p>
              </div>
            ) : (!bookings || bookings.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 bg-white rounded-3xl border-2 border-dashed">
                <Inbox className="w-12 h-12 opacity-20" />
                <p>No bookings found. (ไม่พบประวัติการจอง)</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm border-none hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-accent/30 text-blue-900">{booking.bookingId}</Badge>
                          <h3 className="text-lg font-bold text-blue-900">{booking.vehicleName}</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{booking.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>
                              {booking.startDateTime ? format(new Date(booking.startDateTime), 'dd MMM yyyy, HH:mm') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm bg-blue-50/50 p-2 rounded italic">
                          <span className="font-semibold text-blue-800">Purpose:</span> {booking.purpose}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-2">
                        <Badge className={
                          booking.status === 'Approved' ? 'bg-green-500' : 
                          booking.status === 'Pending' ? 'bg-yellow-500 text-yellow-950' : 
                          booking.status === 'Rejected' ? 'bg-red-500' : 'bg-gray-500'
                        }>
                          {booking.status === 'Approved' ? 'อนุมัติแล้ว' : 
                           booking.status === 'Pending' ? 'รออนุมัติ' : 
                           booking.status === 'Rejected' ? 'ปฏิเสธ' : booking.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Created: {booking.createdAt ? format(new Date(booking.createdAt), 'dd MMM, HH:mm') : ''}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
