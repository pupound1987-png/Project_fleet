
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
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, MapPin, ClipboardList, Phone, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call and Line notification
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Booking Requested | ส่งคำขอจองแล้ว",
        description: "Your vehicle request has been sent to admin and Line notification triggered. (คำขอของคุณส่งไปแล้วและแจ้งเตือนผ่าน Line เรียบร้อย)",
      });
      router.push("/");
    }, 1500);
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
          <Card className="shadow-lg border-none">
            <CardHeader className="bg-primary/10 rounded-t-lg pb-6">
              <CardTitle className="text-2xl font-bold text-blue-900">Vehicle Request Form | แบบฟอร์มขอใช้รถ</CardTitle>
              <CardDescription>Please provide accurate details for your journey. (กรุณากรอกข้อมูลการเดินทางให้ครบถ้วน)</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" /> Select Vehicle | เลือกยานพาหนะ
                    </Label>
                    <Select required>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Choose an available car | เลือกรถที่ว่าง" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_VEHICLES.filter(v => v.status === 'Available').map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} ({v.licensePlate}) - {v.capacity} Seats
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Contact Phone | เบอร์โทรศัพท์ติดต่อ
                    </Label>
                    <Input placeholder="08x-xxx-xxxx" required className="bg-white" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Start Date & Time | วันที่และเวลาเริ่มต้น
                    </Label>
                    <Input type="datetime-local" required className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-3 h-3" /> End Date & Time | วันที่และเวลาสิ้นสุด
                    </Label>
                    <Input type="datetime-local" required className="bg-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Destination | สถานที่จุดหมาย
                  </Label>
                  <Input placeholder="Where are you going? | คุณกำลังจะไปที่ไหน?" required className="bg-white" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" /> Purpose of Trip | วัตถุประสงค์การเดินทาง
                  </Label>
                  <Textarea placeholder="Describe the reason for this booking | ระบุเหตุผลในการจองรถ" required className="bg-white min-h-[100px]" />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" type="button" onClick={() => router.back()}>Cancel | ยกเลิก</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-blue-900 px-8" disabled={loading}>
                    {loading ? "Processing... | กำลังดำเนินการ..." : "Submit Booking | ยืนยันจองรถ"}
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
