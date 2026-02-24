
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Car, 
  Calendar as CalendarIcon, 
  History, 
  ShieldCheck, 
  Settings,
  LogOut,
  PlusCircle
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

const navItems = [
  { title: "Dashboard", titleTh: "แผงควบคุม", href: "/", icon: LayoutDashboard },
  { title: "Vehicles", titleTh: "ยานพาหนะ", href: "/vehicles", icon: Car },
  { title: "Bookings", titleTh: "จองรถ", href: "/bookings", icon: PlusCircle },
  { title: "Calendar", titleTh: "ปฏิทินการใช้งาน", href: "/calendar", icon: CalendarIcon },
  { title: "My History", titleTh: "ประวัติของฉัน", href: "/history", icon: History },
];

const adminItems = [
  { title: "Approvals", titleTh: "การอนุมัติ", href: "/admin/approvals", icon: ShieldCheck },
  { title: "Fleet Management", titleTh: "จัดการฟลีทรถ", href: "/admin/fleet", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-blue-100">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline tracking-tight text-blue-900">FleetLink</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Enterprise</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu | เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.titleTh}</span>
                        <span className="text-[10px] text-muted-foreground leading-none">{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration | ผู้ดูแลระบบ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.titleTh}</span>
                        <span className="text-[10px] text-muted-foreground leading-none">{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-blue-50">
        <div className="flex items-center gap-3 px-2 py-3 bg-accent/30 rounded-lg">
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
            <AvatarImage src="https://picsum.photos/seed/user1/40/40" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate text-blue-900">admin</span>
            <span className="text-xs text-muted-foreground truncate">admin@tcitrendgroup</span>
          </div>
          <button className="p-2 hover:bg-white rounded-md transition-colors text-muted-foreground hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
