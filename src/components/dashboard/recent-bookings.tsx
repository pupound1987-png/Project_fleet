"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export function RecentBookings() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  const isAdmin = profile?.role === 'Admin';

  // Use a simple query and sort client-side to avoid permission/index errors
  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user || isProfileLoading) return null;
    
    const baseQuery = collection(db, "bookings");
    if (isAdmin) {
      return baseQuery;
    } else {
      return query(baseQuery, where("employeeId", "==", user.uid));
    }
  }, [db, user, isAdmin, isProfileLoading]);

  const { data: rawBookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);

  // Sort and limit results on the client side
  const bookings = rawBookings ? [...rawBookings].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 5) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'Rejected': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getStatusTh = (status: string) => {
    switch (status) {
      case 'Approved': return 'อนุมัติแล้ว';
      case 'Pending': return 'รออนุมัติ';
      case 'Rejected': return 'ปฏิเสธ';
      case 'Cancelled': return 'ยกเลิก';
      case 'Completed': return 'เสร็จสิ้น';
      default: return status;
    }
  }

  return (
    <Card className="shadow-sm border-none bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900">
          {isAdmin ? "Recent All Bookings | การจองล่าสุดทั้งหมด" : "My Recent Bookings | การจองล่าสุดของฉัน"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(isProfileLoading || isBookingsLoading) ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : bookings?.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-50 bg-blue-50/20">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">{booking.vehicleName}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.employeeName} • {mounted && booking.startDateTime ? format(new Date(booking.startDateTime), 'dd MMM, HH:mm', { locale: th }) : '...'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={`font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{getStatusTh(booking.status)}</span>
              </div>
            </div>
          ))}
          {(!isBookingsLoading && !isProfileLoading && (!bookings || bookings.length === 0)) && (
            <div className="text-center py-4 text-xs text-muted-foreground italic">No recent activity. (ไม่มีกิจกรรมล่าสุด)</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}