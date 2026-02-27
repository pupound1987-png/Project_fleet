"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ShieldCheck, Check, X, User as UserIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, useUser } from "@/firebase";
import { collection, query, where, doc, getDoc } from "firebase/firestore";
import { sendTelegramNotification } from "@/app/actions/telegram-notify";

export default function AdminApprovalsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "bookings"), where("status", "==", "Pending"));
  }, [db, user]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAction = async (booking: any, action: 'Approved' | 'Rejected') => {
    const docRef = doc(db, "bookings", booking.id);
    updateDocumentNonBlocking(docRef, { status: action });
    
    toast({
      title: action === 'Approved' ? "Approved | อนุมัติแล้ว" : "Rejected | ปฏิเสธแล้ว",
      description: `Booking ID ${booking.bookingId} has been ${action.toLowerCase()}.`,
    });

    // Notify Telegram when approved or rejected
    try {
      const configSnap = await getDoc(doc(db, "settings", "telegram-config"));
      const config = configSnap.data();
      
      if (config?.enabled) {
        const startTimeStr = booking.startDateTime ? format(new Date(booking.startDateTime), 'dd MMM, HH:mm') : 'N/A';
        const endTimeStr = booking.endDateTime ? format(new Date(booking.endDateTime), 'HH:mm') : 'N/A';

        const statusLabel = action === 'Approved' ? '✅ ได้รับการอนุมัติแล้ว!' : '❌ ถูกปฏิเสธ';
        const message = [
          `<b>${statusLabel}</b>`,
          `<b>ผู้จอง:</b> ${booking.employeeName} (${booking.department})`,
          `<b>รถ:</b> ${booking.vehicleName}`,
          `<b>จุดหมาย:</b> ${booking.destination}`,
          `<b>เวลา:</b> ${startTimeStr} - ${endTimeStr}`,
          `<b>ผลลัพธ์:</b> <pre>${action === 'Approved' ? 'อนุมัติเรียบร้อย' : 'คำขอถูกปฏิเสธ'}</pre>`
        ].join('\n');

        if (config.isSimulated) {
          console.log("Simulation Mode: " + message);
        } else if (config.botToken && config.chatId) {
          await sendTelegramNotification(config.botToken, config.chatId, message);
        }
      }
    } catch (err) {
      console.error("Action notification error:", err);
    }
  };

  if (!mounted) return null;

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
            <h1 className="text-2xl font-black text-blue-950">Reservation Requests | คำขอใช้รถยนต์</h1>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-bold">Loading requests...</p>
              </div>
            ) : (!bookings || bookings.length === 0) ? (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No pending requests. (ไม่มีรายการที่รอการอนุมัติ)</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="shadow-lg border-l-8 border-l-yellow-400 rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform">
                  <CardHeader className="pb-2 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge variant="outline" className="font-mono text-[10px] mb-1">{booking.bookingId}</Badge>
                        <CardTitle className="text-xl font-black text-blue-900">{booking.vehicleName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 font-bold text-blue-700/70">
                          <UserIcon className="w-4 h-4" /> {booking.employeeName} ({booking.department})
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-none px-4 py-1 animate-pulse">Pending | รออนุมัติ</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                      <div>
                        <p className="font-bold text-blue-900 uppercase text-[10px] tracking-widest mb-1">Destination | จุดหมาย</p>
                        <p className="font-medium text-slate-700">{booking.destination}</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-900 uppercase text-[10px] tracking-widest mb-1">Time | เวลา</p>
                        <p className="font-medium text-slate-700">
                          {booking.startDateTime ? `${format(new Date(booking.startDateTime), 'dd MMM yyyy, HH:mm')} - ${format(new Date(booking.endDateTime), 'HH:mm')}` : '...'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-bold text-blue-900 uppercase text-[10px] tracking-widest mb-1">Purpose | วัตถุประสงค์</p>
                        <p className="italic text-slate-600 font-medium">"{booking.purpose}"</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl" onClick={() => handleAction(booking, 'Rejected')}>
                        <X className="w-4 h-4 mr-2" /> Reject | ปฏิเสธ
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-green-200" onClick={() => handleAction(booking, 'Approved')}>
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