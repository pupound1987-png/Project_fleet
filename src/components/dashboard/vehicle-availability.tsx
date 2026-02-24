
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Bus, Truck, CarFront } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export function VehicleAvailability() {
  const db = useFirestore();
  const vehiclesRef = useMemoFirebase(() => collection(db, "vehicles"), [db]);
  const { data: vehicles } = useCollection(vehiclesRef);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Van': return <Bus className="w-4 h-4" />;
      case 'Pickup': return <Truck className="w-4 h-4" />;
      default: return <CarFront className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available': return <Badge className="bg-green-500 hover:bg-green-600">Available | ว่าง</Badge>;
      case 'In Use': return <Badge className="bg-blue-500 hover:bg-blue-600">In Use | กำลังใช้</Badge>;
      case 'Maintenance': return <Badge className="bg-red-500 hover:bg-red-600">Maintenance | ซ่อมบำรุง</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-none bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900">Fleet Availability | สถานะรถในฟลีท</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-accent/30 hover:bg-accent/30 border-none">
              <TableHead className="rounded-l-lg">Vehicle | รถ</TableHead>
              <TableHead>Type | ประเภท</TableHead>
              <TableHead>License Plate | ทะเบียน</TableHead>
              <TableHead>Capacity | ความจุ</TableHead>
              <TableHead className="text-right rounded-r-lg">Status | สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles?.map((vehicle) => (
              <TableRow key={vehicle.id} className="border-b border-blue-50">
                <TableCell className="font-medium text-blue-950">{vehicle.vehicleName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {getIcon(vehicle.type)}
                    <span className="text-xs uppercase tracking-wider">{vehicle.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.capacity} Seats | ที่นั่ง</TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(vehicle.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
