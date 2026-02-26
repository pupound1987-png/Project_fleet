"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Car, 
  Calendar as CalendarIcon, 
  History, 
  ShieldCheck, 
  Settings,
  LogOut,
  PlusCircle,
  BellRing,
  ChevronRight
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

const AnimatedCarIcon = () => (
  <div className="relative w-14 h-8 animate-drive-vibration">
    {/* Car Body (Red) */}
    <svg viewBox="0 0 120 60" className="w-14 h-auto drop-shadow-sm">
      <path 
        d="M5,45 L115,45 L115,35 C115,30 110,25 100,25 L90,25 L80,10 L30,10 L20,25 L10,25 C5,25 5,30 5,35 Z" 
        fill="#ef4444" 
      />
      {/* Windows */}
      <path d="M33,14 L77,14 L85,25 L27,25 Z" fill="#1e293b" fillOpacity="0.6" />
      {/* Headlight */}
      <circle cx="110" cy="35" r="3" fill="#fbbf24" className="animate-pulse" />
    </svg>

    {/* Spinning Wheels (White) - วางตำแหน่งให้มีทั้งล้อหน้าและล้อหลัง */}
    <div className="absolute bottom-0 left-1.5 animate-wheel-spin">
       <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
         <circle cx="12" cy="12" r="10" fill="currentColor" stroke="#1e293b" strokeWidth="1" />
         <path d="M12,4 L12,20 M4,12 L20,12" stroke="#1e293b" strokeWidth="2" strokeOpacity="0.5" />
       </svg>
    </div>
    <div className="absolute bottom-0 right-1.5 animate-wheel-spin">
       <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
         <circle cx="12" cy="12" r="10" fill="currentColor" stroke="#1e293b" strokeWidth="1" />
         <path d="M12,4 L12,20 M4,12 L20,12" stroke="#1e293b" strokeWidth="2" strokeOpacity="0.5" />
       </svg>
    </div>
  </div>
);

const navItems = [
  { title: "Dashboard", titleTh: "แผงควบคุม", href: "/", icon: LayoutDashboard },
  { title: "Vehicles", titleTh: "ยานพาหนะ", href: "/vehicles", icon: Car },
  { title: "Bookings", titleTh: "จองรถ", href: "/bookings", icon: PlusCircle },
  { title: "Calendar", titleTh: "ปฏิทิน", href: "/calendar", icon: CalendarIcon },
  { title: "My History", titleTh: "ประวัติของฉัน", href: "/history", icon: History },
];

const adminItems = [
  { title: "Approvals", titleTh: "การอนุมัติ", href: "/admin/approvals", icon: ShieldCheck },
  { title: "Fleet Management", titleTh: "จัดการรถยนต์", href: "/admin/fleet", icon: Settings },
  { title: "Line Settings", titleTh: "ตั้งค่าแจ้งเตือน", href: "/admin/settings", icon: BellRing },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);
  const isAdmin = profile?.role === 'Admin';

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="p-6 bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-2xl shadow-xl border border-white/5 group overflow-hidden">
            <AnimatedCarIcon />
          </div>
          <div>
            <h1 className="text-xl font-black font-headline tracking-tight text-white leading-none">FleetLink</h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] mt-1">TCI TREND GROUP</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 px-4 mb-2 uppercase tracking-widest text-[10px] font-bold">Main Menu | เมนู</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className={cn(
                      "rounded-xl transition-all duration-200 py-6",
                      pathname === item.href ? "bg-accent/10 text-accent" : "hover:bg-white/5"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-accent" : "text-slate-400")} />
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-bold">{item.titleTh}</span>
                        <span className="text-[10px] opacity-60 font-medium">{item.title}</span>
                      </div>
                      {pathname === item.href && <ChevronRight className="w-4 h-4 text-accent" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-slate-400 px-4 mb-2 uppercase tracking-widest text-[10px] font-bold">Admin | ผู้ดูแล</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={cn(
                        "rounded-xl transition-all duration-200 py-6",
                        pathname === item.href ? "bg-accent/10 text-accent" : "hover:bg-white/5"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-accent" : "text-slate-400")} />
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-bold">{item.titleTh}</span>
                          <span className="text-[10px] opacity-60 font-medium">{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 bg-sidebar border-t border-white/5">
        {user ? (
          <div className="flex items-center gap-3 px-3 py-4 bg-white/5 rounded-2xl overflow-hidden">
            <Avatar className="h-10 w-10 border-2 border-accent shadow-sm shrink-0">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback className="bg-accent text-white font-bold">{user.displayName?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold truncate text-white">{user.displayName}</span>
              <span className="text-[10px] text-slate-400 truncate">{isAdmin ? "Administrator" : (profile?.role || "Employee")}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-slate-400 hover:text-red-400 shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="px-3 py-2 text-center">
            <Link href="/login" className="text-xs text-slate-400 hover:text-accent font-bold transition-colors">
              Please Login | กรุณาเข้าสู่ระบบ
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
