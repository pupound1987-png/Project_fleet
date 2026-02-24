
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

  // Fetch user profile to check role
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
          <div className="bg-accent p-2 rounded-2xl shadow-lg shadow-accent/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black font-headline tracking-tight text-white">FleetLink</h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Enterprise</p>
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
        <div className="flex items-center gap-3 px-3 py-4 bg-white/5 rounded-2xl">
          <Avatar className="h-10 w-10 border-2 border-accent shadow-sm">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid || 'guest'}/100/100`} />
            <AvatarFallback className="bg-accent text-white font-bold">{user?.displayName?.substring(0, 2).toUpperCase() || "GU"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold truncate text-white">{user?.displayName || "Guest User"}</span>
            <span className="text-[10px] text-slate-400 truncate">{isAdmin ? "Administrator" : (profile?.role || "Employee")}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
