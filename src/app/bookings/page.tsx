"use client";

import { useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, MapPin, ClipboardList, Phone, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, useUser } from "@/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { sendTelegramNotification } from "@/app/actions/telegram-notify";
import { format } from "date-fns";

export default function BookingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const vehiclesRef = useMemoFirebase(() => collection(db, "vehicles"), [db]);
  const bookingsRef = useMemoFirebase(() => collection(db, "bookings"), [db]);
  const { data: vehicles } = useCollection(vehiclesRef);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    phone: '',
    startDateTime: '',
    endDateTime: '',
    destination: '',
    purpose: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please log in." });
      return;
    }

    setLoading(true);
    
    const selectedVehicle = vehicles?.find(v => v.id === formData.vehicleId);
    const bookingId = `B${Date.now()}`;

    const bookingData = {
      bookingId,
      vehicleId: formData.vehicleId,
      vehicleName: selectedVehicle?.vehicleName || 'Unknown',
      employeeEmail: user.email,
      employeeName: user.displayName || 'Anonymous User',
      employeeId: user.uid,
      department: 'General',
      phone: formData.phone,
      destination: formData.destination,
      startDateTime: formData.startDateTime,
      endDateTime: formData.endDateTime,
      purpose: formData.purpose,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    addDocumentNonBlocking(bookingsRef, bookingData);

    // Trigger Telegram Notification for New Booking
    try {
      const configSnap = await getDoc(doc(db, "settings", "telegram-config"));
      const config = configSnap.data();
      
      if (config?.enabled) {
        const startTimeStr = formData.startDateTime ? format(new Date(formData.startDateTime), 'dd MMM, HH:mm') : 'N/A';
        const endTimeStr = formData.endDateTime ? format(new Date(formData.endDateTime), 'HH:mm') : 'N/A';

        const message = [
          `<b>🚗 มีการจองใหม่! (รออนุมัติ)</b>`,
          `<b>ผู้จอง:</b> ${bookingData.employeeName}`,
          `<b>รถ:</b> ${bookingData.vehicleName}`,
          `<b>จุดหมาย:</b> ${bookingData.destination}`,
          `<b>เวลา:</b> ${startTimeStr} - ${endTimeStr}`,
          `<b>วัตถุประสงค์:</b> ${bookingData.purpose}`
        ].join('\n');

        if (config.isSimulated) {
          toast({
            title: "Simulation Mode: [จองใหม่]",
            description: "ข้อมูลบันทึกแล้ว (ไม่ได้ส่ง Telegram จริง)",
          });
        } else if (config.botToken && config.chatId) {
          await sendTelegramNotification(config.botToken, config.chatId, message);
        }
      }
    } catch (err) {
      console.error("New booking notification error:", err);
    }

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Booking Requested | ส่งคำขอจองแล้ว",
        description: "Your request is pending approval.",
      });
      router.push("/");
    }, 800);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-blue-900">New Reservation | การจองใหม่</h2>
        </header>

        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-primary/10 pb-6">
              <CardTitle className="text-2xl font-bold text-blue-900">Vehicle Request Form | แบบฟอร์มขอใช้รถ</CardTitle>
              <CardDescription>กรุณากรอกข้อมูลการเดินทางให้ครบถ้วน</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" /> Select Vehicle | เลือกยานพาหนะ
                    </Label>
                    <Select required onValueChange={(val) => setFormData({...formData, vehicleId: val})}>
                      <SelectTrigger className="bg-white h-12 rounded-xl">
                        <SelectValue placeholder="Choose a car" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.filter(v => v.status === 'Available').map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.vehicleName} ({v.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Contact Phone | เบอร์โทรศัพท์
                    </Label>
                    <Input 
                      placeholder="08x-xxx-xxxx" 
                      required 
                      className="bg-white h-12 rounded-xl"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> Start Date & Time
                    </Label>
                    <Input 
                      type="datetime-local" 
                      required 
                      className="bg-white h-12 rounded-xl" 
                      onChange={(e) => setFormData({...formData, startDateTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> End Date & Time
                    </Label>
                    <Input 
                      type="datetime-local" 
                      required 
                      className="bg-white h-12 rounded-xl"
                      onChange={(e) => setFormData({...formData, endDateTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Destination | จุดหมาย
                  </Label>
                  <Input 
                    placeholder="Where are you going?" 
                    required 
                    className="bg-white h-12 rounded-xl"
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" /> Purpose | วัตถุประสงค์
                  </Label>
                  <Textarea 
                    placeholder="Reason for this booking" 
                    required 
                    className="bg-white min-h-[120px] rounded-xl"
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" className="rounded-xl px-8" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Submit Booking | ยืนยันจองรถ"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}