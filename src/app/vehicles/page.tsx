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

  // Image Compression logic
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // Quality 0.6 is safe for < 1MB
      };
    });
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 800;
        canvas.height = (video.videoHeight / video.videoWidth) * 800;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawData = canvas.toDataURL('image/jpeg', 0.8);
        const compressedData = await compressImage(rawData);
        setNewVehicle({ ...newVehicle, imageUrl: compressedData });
        setShowCamera(false);
        toast({ title: "Photo Captured | ถ่ายรูปสำเร็จ" });
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawData = reader.result as string;
        const compressedData = await compressImage(rawData);
        setNewVehicle({ ...newVehicle, imageUrl: compressedData });
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
      toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields." });
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
      title: "Success",
      description: "New vehicle has been added.",
    });
  };

  const deleteVehicle = (id: string) => {
    if (!confirm("Are you sure?")) return;
    const docRef = doc(db, "vehicles", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Deleted" });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold text-blue-900">Fleet Management</h2>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary hover:bg-primary/90 text-blue-900">
            {isAdding ? "Close Form" : <><Plus className="w-4 h-4 mr-2" /> Add Vehicle</>}
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {isAdding && (
            <Card className="shadow-lg border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-900">Vehicle Registration</CardTitle>
                <CardDescription>Enter details and add a photo (max 1MB).</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVehicle} className="grid gap-6">
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <Label className="block text-sm font-bold text-blue-900">Vehicle Photo</Label>
                      <div className="relative aspect-video rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center">
                        {showCamera ? (
                          <>
                            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline />
                            <Button type="button" onClick={capturePhoto} className="absolute bottom-4 z-10 bg-white text-blue-900 rounded-full h-12 w-12 p-0 shadow-lg">
                              <Camera className="w-6 h-6" />
                            </Button>
                          </>
                        ) : newVehicle.imageUrl ? (
                          <Image src={newVehicle.imageUrl} alt="Preview" fill className="object-cover" />
                        ) : (
                          <CarIcon className="w-12 h-12 text-slate-300" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCamera(!showCamera)}>
                          <Camera className="w-4 h-4 mr-2" /> Camera
                        </Button>
                        <div className="relative flex-1">
                          <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                          <Button type="button" variant="outline" className="w-full">Upload</Button>
                        </div>
                      </div>
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Vehicle Name</Label>
                          <Input placeholder="e.g. Toyota Alphard" value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                          <Label>License Plate</Label>
                          <Input placeholder="กข-1234" value={newVehicle.licensePlate} onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})} required />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={newVehicle.type} onValueChange={(val) => setNewVehicle({...newVehicle, type: val as VehicleType})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sedan">Sedan</SelectItem>
                              <SelectItem value="Van">Van</SelectItem>
                              <SelectItem value="Pickup">Pickup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Capacity</Label>
                          <Input type="number" value={newVehicle.capacity} onChange={(e) => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={newVehicle.status} onValueChange={(val) => setNewVehicle({...newVehicle, status: val as VehicleStatus})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary text-blue-900 font-bold shadow-lg">Save Vehicle</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles?.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden shadow-sm border-none group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image src={getVehicleImage(vehicle)} alt={vehicle.vehicleName} fill className="object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 right-2">
                    <Badge className={vehicle.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}>
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-900">{vehicle.vehicleName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                </CardHeader>
                <CardFooter className="bg-slate-50 p-4 border-t flex justify-between">
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteVehicle(vehicle.id)}><Trash2 className="w-4 h-4 mr-2" /> Remove</Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/calendar?vehicle=${vehicle.id}`}><Info className="w-4 h-4 mr-2" /> Calendar</a>
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
