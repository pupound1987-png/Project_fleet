
"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Info, Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function VehiclesPage() {
  const getVehicleImage = (type: string) => {
    switch (type) {
      case 'Van': return "https://picsum.photos/seed/fleet1/400/300";
      case 'Sedan': return "https://picsum.photos/seed/fleet2/400/300";
      case 'Pickup': return "https://picsum.photos/seed/fleet3/400/300";
      default: return "https://picsum.photos/seed/fleet4/400/300";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-blue-900">Our Fleet</h2>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_VEHICLES.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden shadow-sm border-none group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={getVehicleImage(vehicle.type)} 
                    alt={vehicle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint={vehicle.type.toLowerCase() + " car"}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={
                      vehicle.status === 'Available' ? 'bg-green-500' : 
                      vehicle.status === 'Maintenance' ? 'bg-red-500' : 'bg-blue-500'
                    }>
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-blue-900">{vehicle.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{vehicle.licensePlate}</p>
                    </div>
                    <Badge variant="outline" className="text-xs uppercase tracking-tighter bg-accent/30">{vehicle.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{vehicle.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-primary" />
                      <span>Standard Package</span>
                    </div>
                  </div>
                  {vehicle.remark && (
                    <p className="text-xs text-muted-foreground bg-blue-50/50 p-2 rounded italic">
                      Note: {vehicle.remark}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="bg-blue-50/30 p-4 border-t border-blue-100">
                  <Button asChild disabled={vehicle.status !== 'Available'} className="w-full bg-primary text-blue-900 hover:bg-primary/90">
                    <Link href="/bookings">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Book Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
