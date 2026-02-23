
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
    { title: "Total Vehicles", value: totalVehicles, icon: Car, color: "text-blue-500" },
    { title: "Currently In Use", value: inUse, icon: CheckCircle2, color: "text-green-500" },
    { title: "Pending Requests", value: pending, icon: Clock, color: "text-yellow-500" },
    { title: "In Maintenance", value: maintenance, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm border-none bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
