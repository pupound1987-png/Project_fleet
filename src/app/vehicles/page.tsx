
"use client";

import { useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { MOCK_VEHICLES, type Vehicle, type VehicleType, type VehicleStatus } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Users, Car as CarIcon, Trash2, Plus, Info, License } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function VehiclesPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    name: '',
    licensePlate: '',
    type: 'Sedan',
    capacity: 4,
    status: 'Available',
    remark: ''
  });

  const getVehicleImage = (type: string) => {
    switch (type) {
      case 'Van': return "https://picsum.photos/seed/fleet1/400/300";
      case 'Sedan': return "https://picsum.photos/seed/fleet2/400/300";
      case 'Pickup': return "https://picsum.photos/seed/fleet3/400/300";
      default: return "https://picsum.photos/seed/fleet4/400/300";
    }
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.licensePlate) {
      toast({
        variant: "destructive",
        title: "Error | ข้อผิดพลาด",
        description: "Please fill in all required fields. (กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน)",
      });
      return;
    }

    const vehicle: Vehicle = {
      id: `V${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: newVehicle.name!,
      licensePlate: newVehicle.licensePlate!,
      type: (newVehicle.type as VehicleType) || 'Sedan',
      capacity: newVehicle.capacity || 4,
      status: (newVehicle.status as VehicleStatus) || 'Available',
      remark: newVehicle.remark || ''
    };

    setVehicles([vehicle, ...vehicles]);
    setIsAdding(false);
    setNewVehicle({ name: '', licensePlate: '', type: 'Sedan', capacity: 4, status: 'Available', remark: '' });
    
    toast({
      title: "Success | สำเร็จ",
      description: "New vehicle has been added to the fleet. (เพิ่มยานพาหนะใหม่เข้าสู่ระบบเรียบร้อยแล้ว)",
    });
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    toast({
      title: "Deleted | ลบข้อมูลแล้ว",
      description: "Vehicle has been removed from the system. (ลบข้อมูลยานพาหนะออกจากระบบแล้ว)",
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-blue-900">Fleet Management | จัดการฟลีทรถ</h2>
          </div>
          <Button 
            onClick={() => setIsAdding(!isAdding)} 
            className="bg-primary hover:bg-primary/90 text-blue-900"
          >
            {isAdding ? "Close Form | ปิดฟอร์ม" : <><Plus className="w-4 h-4 mr-2" /> Add Vehicle | เพิ่มรถใหม่</>}
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {isAdding && (
            <Card className="shadow-lg border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-900">Vehicle Registration | ลงทะเบียนรถใหม่</CardTitle>
                <CardDescription>Enter details for the new addition to your fleet. (กรอกรายละเอียดสำหรับรถคันใหม่)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVehicle} className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Vehicle Name | ชื่อรถ / รุ่น</Label>
                      <Input 
                        placeholder="e.g. Toyota Alphard" 
                        value={newVehicle.name}
                        onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>License Plate | เลขทะเบียนรถ</Label>
                      <Input 
                        placeholder="กข-1234" 
                        value={newVehicle.licensePlate}
                        onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Vehicle Type | ประเภทรถ</Label>
                      <Select 
                        value={newVehicle.type} 
                        onValueChange={(val) => setNewVehicle({...newVehicle, type: val as VehicleType})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sedan">Sedan | รถเก๋ง</SelectItem>
                          <SelectItem value="Van">Van | รถตู้</SelectItem>
                          <SelectItem value="Pickup">Pickup | รถกระบะ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity | ความจุ (ที่นั่ง)</Label>
                      <Input 
                        type="number" 
                        value={newVehicle.capacity}
                        onChange={(e) => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status | สถานะเบื้องต้น</Label>
                      <Select 
                        value={newVehicle.status} 
                        onValueChange={(val) => setNewVehicle({...newVehicle, status: val as VehicleStatus})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available | ว่าง</SelectItem>
                          <SelectItem value="Maintenance">Maintenance | ซ่อมบำรุง</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Remarks | หมายเหตุ (ถ้ามี)</Label>
                    <Input 
                      placeholder="Other details... | รายละเอียดอื่นๆ..." 
                      value={newVehicle.remark}
                      onChange={(e) => setNewVehicle({...newVehicle, remark: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancel | ยกเลิก</Button>
                    <Button type="submit" className="bg-primary text-blue-900 px-8">Save Vehicle | บันทึกข้อมูลรถ</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden shadow-sm border-none group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={getVehicleImage(vehicle.type)} 
                    alt={vehicle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint={vehicle.type.toLowerCase() + " car"}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge className={
                      vehicle.status === 'Available' ? 'bg-green-500' : 
                      vehicle.status === 'Maintenance' ? 'bg-red-500' : 'bg-blue-500'
                    }>
                      {vehicle.status === 'Available' ? 'ว่าง' : 
                       vehicle.status === 'Maintenance' ? 'ซ่อมบำรุง' : 
                       vehicle.status === 'In Use' ? 'กำลังใช้' : vehicle.status}
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
                      <span>{vehicle.capacity} Seats | ที่นั่ง</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CarIcon className="w-4 h-4 text-primary" />
                      <span>{vehicle.type === 'Van' ? 'รถตู้' : vehicle.type === 'Sedan' ? 'รถเก๋ง' : 'รถกระบะ'}</span>
                    </div>
                  </div>
                  {vehicle.remark && (
                    <p className="text-xs text-muted-foreground bg-blue-50/50 p-2 rounded italic">
                      Note: {vehicle.remark}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="bg-blue-50/30 p-4 border-t border-blue-100 flex justify-between gap-2">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteVehicle(vehicle.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove | ลบ
                  </Button>
                  <Button variant="outline" size="sm" asChild className="border-primary text-blue-900">
                    <a href={`/calendar?vehicle=${vehicle.id}`}>
                      <Info className="w-4 h-4 mr-2" /> Details | รายละเอียด
                    </a>
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
