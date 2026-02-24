"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertTriangle, Car as CarIcon, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export function StatsCards() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  // Fetch user profile to determine role
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  const isAdmin = profile?.role === 'Admin';

  const vehiclesRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "vehicles");
  }, [db, user]);

  const bookingsRef = useMemoFirebase(() => {
    // Wait for user and profile to be ready to avoid permission errors
    if (!db || !user || isProfileLoading) return null;
    
    // If Admin, see all. If Employee, only see own for stats context
    if (isAdmin) {
      return collection(db, "bookings");
    } else {
      return query(collection(db, "bookings"), where("employeeId", "==", user.uid));
    }
  }, [db, user, isAdmin, isProfileLoading]);
  
  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection(vehiclesRef);
  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsRef);

  if (isUserLoading || isVehiclesLoading || isBookingsLoading || isProfileLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-32 flex items-center justify-center bg-white/50 border-none shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
          </Card>
        ))}
      </div>
    );
  }

  const totalVehicles = vehicles?.length || 0;
  const inUse = vehicles?.filter(v => v.status === 'In Use').length || 0;
  const pendingCount = bookings?.filter(b => b.status === 'Pending').length || 0;
  const maintenance = vehicles?.filter(v => v.status === 'Maintenance').length || 0;

  const stats = [
    { 
      title: "Total Vehicles", 
      titleTh: "ยานพาหนะทั้งหมด", 
      value: totalVehicles, 
      icon: CarIcon, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      delay: "duration-300"
    },
    { 
      title: "Currently In Use", 
      titleTh: "กำลังใช้งาน", 
      value: inUse, 
      icon: CheckCircle2, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      delay: "duration-500"
    },
    { 
      title: isAdmin ? "Total Pending" : "My Pending", 
      titleTh: isAdmin ? "รายการรออนุมัติทั้งหมด" : "รายการจองของฉันที่รออนุมัติ", 
      value: pendingCount, 
      icon: Clock, 
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      delay: "duration-700"
    },
    { 
      title: "In Maintenance", 
      titleTh: "กำลังซ่อมบำรุง", 
      value: maintenance, 
      icon: AlertTriangle, 
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      delay: "duration-1000"
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={cn(
          "shadow-sm border-none bg-white hover-card-effect animate-in fade-in slide-in-from-bottom-4",
          stat.delay
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">{stat.titleTh}</span>
              <CardTitle className="text-[10px] text-slate-400 uppercase tracking-widest">{stat.title}</CardTitle>
            </div>
            <div className={cn("p-2 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 tabular-nums">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}