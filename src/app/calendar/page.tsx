
"use client";

import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_BOOKINGS, MOCK_VEHICLES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  const startDate = startOfWeek(viewDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getBookingsForDayAndVehicle = (day: Date, vehicleId: string) => {
    return MOCK_BOOKINGS.filter(b => 
      b.vehicleId === vehicleId && 
      isSameDay(new Date(b.startDateTime), day)
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-blue-900">Fleet Calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setViewDate(addDays(viewDate, -7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
              {mounted ? `${format(startDate, 'MMM dd')} - ${format(days[6], 'MMM dd, yyyy')}` : 'Loading...'}
            </span>
            <Button variant="outline" size="icon" onClick={() => setViewDate(addDays(viewDate, 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Card className="shadow-lg border-none overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-accent/30">
                    <th className="p-4 text-left font-bold text-blue-900 border-b min-w-[180px]">Vehicle</th>
                    {days.map(day => (
                      <th key={day.toString()} className="p-4 text-center border-b min-w-[120px]">
                        <div className="text-xs uppercase text-muted-foreground">{format(day, 'EEE')}</div>
                        <div className={`text-lg font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                          {format(day, 'dd')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_VEHICLES.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 border-b">
                        <div className="font-semibold text-blue-900">{vehicle.name}</div>
                        <div className="text-xs text-muted-foreground">{vehicle.licensePlate}</div>
                      </td>
                      {days.map(day => {
                        const dayBookings = getBookingsForDayAndVehicle(day, vehicle.id);
                        return (
                          <td key={day.toString()} className="p-2 border-b border-l border-blue-50/50 align-top">
                            <div className="space-y-1">
                              {dayBookings.map(b => (
                                <div key={b.id} className="p-1.5 bg-primary/20 rounded border border-primary/30 text-[10px] leading-tight">
                                  <div className="font-bold text-blue-900">{b.employeeName}</div>
                                  <div className="truncate text-muted-foreground">{b.destination}</div>
                                  <div className="mt-1 text-[9px] font-mono">
                                    {mounted ? `${format(new Date(b.startDateTime), 'HH:mm')} - ${format(new Date(b.endDateTime), 'HH:mm')}` : '...'}
                                  </div>
                                </div>
                              ))}
                              {dayBookings.length === 0 && vehicle.status === 'Maintenance' && (
                                <div className="p-1.5 bg-red-100/50 rounded border border-red-200 text-[10px] text-red-600 text-center italic">
                                  Maintenance
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
