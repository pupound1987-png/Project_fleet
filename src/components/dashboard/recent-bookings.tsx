
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function RecentBookings() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'Rejected': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <Card className="shadow-sm border-none bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {MOCK_BOOKINGS.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-50 bg-blue-50/20">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">{booking.vehicleName}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.employeeName} • {format(new Date(booking.startDateTime), 'MMM dd, HH:mm')}
                </p>
              </div>
              <Badge className={`font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
