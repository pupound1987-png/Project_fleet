
"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { History, MapPin, Clock } from "lucide-react";

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            {MOCK_BOOKINGS.map((booking) => (
              <Card key={booking.id} className="shadow-sm border-none hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-accent/30 text-blue-900">{booking.id}</Badge>
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
                            {mounted ? `${format(new Date(booking.startDateTime), 'dd MMM yyyy, HH:mm')} - ${format(new Date(booking.endDateTime), 'HH:mm')}` : '...'}
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
                        booking.status === 'Pending' ? 'bg-yellow-500 text-yellow-950' : 'bg-gray-500'
                      }>
                        {booking.status === 'Approved' ? 'อนุมัติแล้ว' : 
                         booking.status === 'Pending' ? 'รออนุมัติ' : booking.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Created: {mounted ? format(new Date(booking.createdAt), 'dd MMM, HH:mm') : '...'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
