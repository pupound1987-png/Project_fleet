"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Key, MessageSquare, Loader2, ExternalLink, Rocket, ShieldCheck, Eye } from "lucide-react";
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { sendLineNotification } from "@/app/actions/line-notify";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function LineSettingsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const configRef = useMemoFirebase(() => doc(db, "settings", "line-config"), [db]);
  const { data: config, isLoading } = useDoc(configRef);

  const [lineToken, setLineToken] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSimulated, setIsSimulated] = useState(true); // Default to simulation for preview
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setLineToken(config.token || "");
      setIsEnabled(config.enabled !== false);
      setIsSimulated(config.isSimulated !== false);
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    setDocumentNonBlocking(configRef, {
      token: lineToken.trim(),
      enabled: isEnabled,
      isSimulated: isSimulated,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved | บันทึกแล้ว",
        description: "Configuration updated. (จำลองการทำงาน: " + (isSimulated ? "เปิด" : "ปิด") + ")",
      });
    }, 500);
  };

  const testConnection = async () => {
    const trimmedToken = lineToken.trim();
    if (!trimmedToken && !isSimulated) {
      toast({ variant: "destructive", title: "Missing Token", description: "Please enter your Line Notify token first." });
      return;
    }

    setIsTesting(true);
    
    if (isSimulated) {
      // Simulate success for testing logic
      setTimeout(() => {
        setIsTesting(false);
        toast({
          title: "Simulation Success! | จำลองสำเร็จ",
          description: "🔔 FleetLink [SIM]: ข้อความทดสอบถูกส่งแล้ว (จำลองการทำงานเพื่อให้คุณเห็นภาพโดยไม่ต้องใช้บัตร)",
        });
      }, 1000);
      return;
    }

    try {
      const res = await sendLineNotification(trimmedToken, "🔔 FleetLink Test: ระบบแจ้งเตือนพร้อมใช้งานแล้ว!");
      if (res.success) {
        toast({ title: "Success! | สำเร็จ", description: "Test notification sent to your Line." });
      } else {
        toast({
          variant: "destructive",
          title: "Network Restriction",
          description: res.error,
          duration: 10000,
        });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-blue-900">Notification Settings</h2>
        </header>

        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <BellRing className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-blue-950">Line Notification | การแจ้งเตือนไลน์</h1>
          </div>

          <Alert className="bg-blue-50 border-blue-200 shadow-sm">
            <Eye className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 font-bold">โหมดจำลองพิเศษ (สำหรับคนไม่มีบัตรครับ)</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              ผมเพิ่ม <b>"Simulation Mode"</b> ให้แล้วครับ เพื่อให้คุณทดสอบ Flow ของแอปได้โดยไม่ต้องใช้บัตรเครดิต เมื่อมีการจองรถ ระบบจะเด้งข้อความขึ้นมาบนจอนี้แทนการส่งเข้าไลน์จริงครับ
            </AlertDescription>
          </Alert>

          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-primary/10 border-b">
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Line Notify Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold text-blue-900">Simulation Mode | โหมดจำลอง</Label>
                        <p className="text-xs text-muted-foreground">แสดงข้อความแจ้งเตือนบนจอแทนการส่งจริง (แนะนำสำหรับหน้า Preview)</p>
                      </div>
                      <Switch checked={isSimulated} onCheckedChange={setIsSimulated} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/10">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Enabled | เปิดการใช้งาน</Label>
                        <p className="text-xs text-muted-foreground">อนุญาตให้มีการส่งแจ้งเตือนในระบบ</p>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" /> Line Notify Token (Optional in Simulation)
                    </Label>
                    <Input 
                      type="password" 
                      placeholder="Paste your access token here" 
                      value={lineToken}
                      onChange={(e) => setLineToken(e.target.value)}
                      className="bg-white font-mono"
                      disabled={isSimulated}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      *ไม่ต้องใส่ Token ก็ได้ถ้าเปิดโหมดจำลองอยู่ครับ
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={testConnection} disabled={isTesting}>
                      {isTesting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Test Connection | ทดสอบ
                    </Button>
                    <Button className="flex-1 bg-primary text-blue-900 font-bold hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Save Configuration | บันทึกค่า
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
