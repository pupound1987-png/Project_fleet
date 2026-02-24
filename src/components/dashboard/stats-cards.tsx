
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { MOCK_VEHICLES, MOCK_BOOKINGS } from "@/lib/mock-data";

export function StatsCards() {
  const totalVehicles = MOCK_VEHICLES.length;
  const inUse = MOCK_VEHICLES.filter(v => v.status === 'In Use').length;
  const pending = MOCK_BOOKINGS.filter(b => b.status === 'Pending').length;
  const maintenance = MOCK_VEHICLES.filter(v => v.status === 'Maintenance').length;

  const stats = [
    { title: "Total Vehicles", titleTh: "ยานพาหนะทั้งหมด", value: totalVehicles, icon: Car, color: "text-blue-500" },
    { title: "Currently In Use", titleTh: "กำลังใช้งาน", value: inUse, icon: CheckCircle2, color: "text-green-500" },
    { title: "Pending Requests", titleTh: "รออนุมัติ", value: pending, icon: Clock, color: "text-yellow-500" },
    { title: "In Maintenance", titleTh: "กำลังซ่อมบำรุง", value: maintenance, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm border-none bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-xs text-muted-foreground uppercase">{stat.title}</CardTitle>
              <span className="text-sm font-semibold text-blue-900">{stat.titleTh}</span>
            </div>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
