"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from "date-fns";
import { th } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Info, MapPin, ClipboardList, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [today] = useState<Date>(new Date());

  const db = useFirestore();
  const { user } = useUser();
  
  const bookingsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "bookings");
  }, [db, user]);

  const { data: bookings, isLoading } = useCollection(bookingsRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getBookingsForDay = (day: Date) => {
    if (!bookings) return [];
    return bookings.filter(b => 
      b.startDateTime &&
      isSameDay(new Date(b.startDateTime), day) &&
      b.status !== 'Rejected' && b.status !== 'Cancelled'
    );
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  if (!mounted) return null;

  const weekDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2 ml-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-blue-900">Fleet Calendar | ปฏิทินรายเดือน</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex border-blue-200 text-blue-700">
              วันนี้ | Today
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="text-blue-900">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-lg font-bold min-w-[150px] text-center text-blue-950">
                {format(currentMonth, 'MMMM yyyy', { locale: th })}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="text-blue-900">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Card className="shadow-2xl border-none overflow-hidden bg-white rounded-3xl">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">กำลังโหลดข้อมูลปฏิทิน...</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-7 border-b bg-blue-50/50">
                    {weekDays.map((day, index) => (
                      <div 
                        key={day} 
                        className={`py-4 text-center text-xs font-black uppercase tracking-widest ${
                          index === 0 ? 'text-red-500' : index === 6 ? 'text-primary' : 'text-blue-900/60'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 auto-rows-[160px] md:auto-rows-[200px]">
                    {calendarDays.map((day) => {
                      const dayBookings = getBookingsForDay(day);
                      const isCurrentMonth = isSameMonth(day, monthStart);
                      const isToday = isSameDay(day, today);

                      return (
                        <div 
                          key={day.toString()} 
                          className={`border-r border-b p-2 transition-colors ${
                            !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'
                          } ${isToday ? 'bg-blue-50/30' : ''} hover:bg-slate-50/80 relative group`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                              !isCurrentMonth ? 'text-slate-300' : 
                              isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-700'
                            }`}>
                              {format(day, 'd')}
                            </span>
                            {dayBookings.length > 0 && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-blue-100 text-blue-700 border-none">
                                {dayBookings.length} คัน
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-35px)] custom-scrollbar pr-1">
                            {dayBookings.map((b) => (
                              <TooltipProvider key={b.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-1.5 rounded-lg bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-default text-[10px] leading-tight space-y-0.5">
                                      <div className="font-bold text-blue-900 truncate">{b.vehicleName}</div>
                                      
                                      <div className="flex items-center gap-1 text-emerald-600 font-bold font-mono text-[9px]">
                                        <Clock className="w-2.5 h-2.5 shrink-0" />
                                        <span>
                                          {b.startDateTime && b.endDateTime ? 
                                            `${format(new Date(b.startDateTime), 'HH:mm')} - ${format(new Date(b.endDateTime), 'HH:mm')}` : 
                                            'N/A'}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1 text-primary font-medium truncate">
                                        <MapPin className="w-2 h-2 shrink-0" />
                                        <span className="truncate">{b.destination}</span>
                                      </div>

                                      <div className="flex items-center justify-between text-slate-400 italic truncate gap-1">
                                        <div className="flex items-center gap-1 truncate">
                                          <ClipboardList className="w-2 h-2 shrink-0" />
                                          <span className="truncate">{b.purpose}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-3 w-64 bg-white shadow-xl border-blue-100">
                                    <div className="space-y-2">
                                      <p className="font-bold text-blue-900 flex items-center gap-2">
                                        <Info className="w-4 h-4" /> รายละเอียดการจอง
                                      </p>
                                      <div className="text-xs grid gap-1 text-slate-600">
                                        <p><b>รถ:</b> {b.vehicleName}</p>
                                        <p><b>ผู้จอง:</b> {b.employeeName} ({b.department})</p>
                                        <p><b>จุดหมาย:</b> {b.destination}</p>
                                        <p><b>วัตถุประสงค์:</b> {b.purpose}</p>
                                        <p className="text-emerald-600 font-bold">
                                          <b>เวลา:</b> {format(new Date(b.startDateTime), 'HH:mm')} - {format(new Date(b.endDateTime), 'HH:mm')}
                                        </p>
                                        <p><b>สถานะ:</b> <span className="text-primary font-bold">{b.status}</span></p>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
