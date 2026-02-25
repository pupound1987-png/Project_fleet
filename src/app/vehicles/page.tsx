
"use client";

import { useState, useRef, useEffect } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
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
import { Users, Car as CarIcon, Trash2, Plus, Info, Camera, Upload, RefreshCw, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export type VehicleType = 'Van' | 'Pickup' | 'Sedan';
export type VehicleStatus = 'Available' | 'Maintenance' | 'Booked' | 'In Use';

export default function VehiclesPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const vehiclesRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "vehicles");
  }, [db, user]);

  const { data: vehicles, isLoading } = useCollection(vehiclesRef);

  const [isAdding, setIsAdding] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    licensePlate: '',
    type: 'Sedan' as VehicleType,
    capacity: 4,
    status: 'Available' as VehicleStatus,
    imageUrl: '',
    remark: ''
  });

  useEffect(() => {
    if (showCamera) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Stop camera stream when hidden
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setNewVehicle({ ...newVehicle, imageUrl: imageData });
        setShowCamera(false);
        toast({ title: "Photo Captured | ถ่ายรูปสำเร็จ" });
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVehicle({ ...newVehicle, imageUrl: reader.result as string });
        toast({ title: "Image Uploaded | อัปโหลดรูปสำเร็จ" });
      };
      reader.readAsDataURL(file);
    }
  };

  const getVehicleImage = (vehicle: any) => {
    if (vehicle.imageUrl) return vehicle.imageUrl;
    
    switch (vehicle.type) {
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
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (!vehiclesRef) return;

    const vehicleData = {
      vehicleId: `V${Date.now()}`,
      vehicleName: newVehicle.name,
      licensePlate: newVehicle.licensePlate,
      type: newVehicle.type,
      capacity: newVehicle.capacity,
      status: newVehicle.status,
      imageUrl: newVehicle.imageUrl,
      remark: newVehicle.remark
    };

    addDocumentNonBlocking(vehiclesRef, vehicleData);
    
    setIsAdding(false);
    setNewVehicle({ name: '', licensePlate: '', type: 'Sedan', capacity: 4, status: 'Available', imageUrl: '', remark: '' });
    
    toast({
      title: "Success | สำเร็จ",
      description: "New vehicle has been added with its photo.",
    });
  };

  const deleteVehicle = (id: string) => {
    const docRef = doc(db, "vehicles", id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Deleted | ลบข้อมูลแล้ว",
      description: "Vehicle has been removed from the system.",
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
            <Card className="shadow-lg border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-900">Vehicle Registration | ลงทะเบียนรถใหม่</CardTitle>
                <CardDescription>Enter details and upload a photo of the actual vehicle.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVehicle} className="grid gap-6">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Image Section */}
                    <div className="space-y-4">
                      <Label className="block text-sm font-bold text-blue-900">Vehicle Photo | รูปถ่ายรถจริง</Label>
                      <div className="relative aspect-video rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center">
                        {showCamera ? (
                          <>
                            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline />
                            {hasCameraPermission === false && (
                              <Alert variant="destructive" className="mx-4 z-10">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Camera Required</AlertTitle>
                                <AlertDescription>Please allow camera access.</AlertDescription>
                              </Alert>
                            )}
                            <Button 
                              type="button" 
                              onClick={capturePhoto}
                              className="absolute bottom-4 z-10 bg-white text-blue-900 hover:bg-slate-100 rounded-full h-12 w-12 p-0"
                            >
                              <Camera className="w-6 h-6" />
                            </Button>
                          </>
                        ) : newVehicle.imageUrl ? (
                          <>
                            <Image src={newVehicle.imageUrl} alt="Preview" fill className="object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2">
                               <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setNewVehicle({...newVehicle, imageUrl: ''})}>
                                 <RefreshCw className="h-4 w-4" />
                               </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6 space-y-2">
                            <CarIcon className="w-12 h-12 text-slate-300 mx-auto" />
                            <p className="text-xs text-muted-foreground">ถ่ายรูปหรืออัปโหลดรูปภาพรถ</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => setShowCamera(!showCamera)}
                        >
                          <Camera className="w-4 h-4 mr-2" /> 
                          {showCamera ? "Cancel Camera" : "Take Photo | ถ่ายรูป"}
                        </Button>
                        <div className="relative flex-1">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileUpload}
                          />
                          <Button type="button" variant="outline" className="w-full">
                            <Upload className="w-4 h-4 mr-2" /> Upload | อัปโหลด
                          </Button>
                        </div>
                      </div>
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
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

                      <div className="grid md:grid-cols-3 gap-4">
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
                          placeholder="Other details..." 
                          value={newVehicle.remark}
                          onChange={(e) => setNewVehicle({...newVehicle, remark: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancel | ยกเลิก</Button>
                    <Button type="submit" className="bg-primary text-blue-900 px-8 font-bold">
                      Save Vehicle | บันทึกข้อมูลรถ
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading fleet data...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles?.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden shadow-sm border-none group hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image 
                      src={getVehicleImage(vehicle)} 
                      alt={vehicle.vehicleName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={
                        vehicle.status === 'Available' ? 'bg-green-500 shadow-lg' : 
                        vehicle.status === 'Maintenance' ? 'bg-red-500 shadow-lg' : 'bg-blue-500 shadow-lg'
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
                        <CardTitle className="text-xl font-bold text-blue-900">{vehicle.vehicleName}</CardTitle>
                        <p className="text-sm text-muted-foreground font-mono">{vehicle.licensePlate}</p>
                      </div>
                      <Badge variant="outline" className="text-xs uppercase tracking-tighter bg-accent/20 border-accent/20 text-blue-900">{vehicle.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{vehicle.capacity} Seats</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CarIcon className="w-4 h-4 text-primary" />
                        <span>{vehicle.type}</span>
                      </div>
                    </div>
                    {vehicle.remark && (
                      <p className="text-xs text-muted-foreground bg-blue-50/50 p-2 rounded italic border border-blue-100">
                        Note: {vehicle.remark}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between gap-2">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteVehicle(vehicle.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-primary text-blue-900 hover:bg-primary/10">
                      <a href={`/calendar?vehicle=${vehicle.id}`}>
                        <Info className="w-4 h-4 mr-2" /> Details
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
