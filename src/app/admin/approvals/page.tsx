
"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ShieldCheck, Check, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminApprovalsPage() {
  const { toast } = useToast();

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    toast({
      title: action === 'approve' ? "Approved | อนุมัติแล้ว" : "Rejected | ปฏิเสธแล้ว",
      description: `Booking ${id} has been ${action}d. (รายการ ${id} ได้รับการ${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}เรียบร้อยแล้ว)`,
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-blue-900">Pending Approvals | รายการรออนุมัติ</h2>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-blue-950">Reservation Requests | คำขอใช้รถยนต์</h1>
          </div>

          <div className="grid gap-6">
            {MOCK_BOOKINGS.filter(b => b.status === 'Pending').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending requests. (ไม่มีรายการที่รอการอนุมัติ)
              </div>
            ) : (
              MOCK_BOOKINGS.filter(b => b.status === 'Pending').map((booking) => (
                <Card key={booking.id} className="shadow-lg border-l-4 border-l-yellow-400">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl text-blue-900">{booking.vehicleName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="w-3 h-3" /> {booking.employeeName} ({booking.department})
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending | รออนุมัติ</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-accent/10 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold text-blue-900">Destination | จุดหมาย</p>
                        <p>{booking.destination}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Time | เวลา</p>
                        <p>{format(new Date(booking.startDateTime), 'dd MMM yyyy, HH:mm')} - {format(new Date(booking.endDateTime), 'HH:mm')}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-semibold text-blue-900">Purpose | วัตถุประสงค์</p>
                        <p className="italic">"{booking.purpose}"</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleAction(booking.id, 'reject')}>
                        <X className="w-4 h-4 mr-2" /> Reject | ปฏิเสธ
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(booking.id, 'approve')}>
                        <Check className="w-4 h-4 mr-2" /> Approve | อนุมัติ
                      </Button>
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
