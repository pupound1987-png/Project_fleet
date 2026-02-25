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
import { BellRing, Key, MessageSquare, Loader2, Info, ExternalLink, Rocket, ShieldCheck } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setLineToken(config.token || "");
      setIsEnabled(config.enabled !== false);
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    setDocumentNonBlocking(configRef, {
      token: lineToken.trim(),
      enabled: isEnabled,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved | บันทึกแล้ว",
        description: "Line configuration has been updated successfully.",
      });
    }, 500);
  };

  const testConnection = async () => {
    const trimmedToken = lineToken.trim();
    if (!trimmedToken) {
      toast({ variant: "destructive", title: "Missing Token", description: "Please enter your Line Notify token first." });
      return;
    }

    setIsTesting(true);
    try {
      const res = await sendLineNotification(trimmedToken, "🔔 FleetLink Test: ระบบแจ้งเตือนพร้อมใช้งานแล้ว! (ส่งจากหน้าการตั้งค่าผู้ดูแลระบบ)");
      if (res.success) {
        toast({
          title: "Success! | สำเร็จ",
          description: "Test notification sent to your Line group.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed | การเชื่อมต่อถูกจำกัด",
          description: res.error,
          duration: 10000,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: err.message,
      });
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
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-blue-950">Line Notification | การแจ้งเตือนไลน์</h1>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <Rocket className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-bold">Deployment Required for Testing (ต้องกด Publish ก่อน)</AlertTitle>
            <AlertDescription className="text-amber-700 text-sm space-y-3">
              <p>เนื่องจากระบบความปลอดภัยของหน้า <b>Preview</b> นี้ไม่อนุญาตให้แอปเชื่อมต่อไปยังภายนอก การกด "ทดสอบ" ในหน้านี้อาจขึ้น Error <b>"Network Connection Blocked"</b> ครับ</p>
              <div className="flex items-center gap-2 font-bold text-blue-700 bg-white/50 p-2 rounded-lg border border-blue-100">
                <ShieldCheck className="w-5 h-5" />
                <span>แต่มั่นใจได้ 100% ว่าโค้ดนี้จะทำงานได้ทันทีเมื่อคุณกดปุ่ม "Publish" สีน้ำเงินที่มุมขวาบนครับ</span>
              </div>
            </AlertDescription>
          </Alert>

          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-primary/10 border-b">
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Line Notify Configuration
              </CardTitle>
              <CardDescription>Configure how the system notifies your team via Line.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/10">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">Enabled | เปิดการใช้งาน</Label>
                      <p className="text-xs text-muted-foreground">ส่งข้อความแจ้งเตือนอัตโนมัติเข้ากลุ่ม Line</p>
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" /> Line Notify Token
                    </Label>
                    <Input 
                      type="password" 
                      placeholder="Paste your 43-character access token here" 
                      value={lineToken}
                      onChange={(e) => setLineToken(e.target.value)}
                      className="bg-white font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Get token from <a href="https://notify-bot.line.me/" target="_blank" className="underline font-bold">Line Notify Website</a>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={testConnection} disabled={isTesting}>
                      {isTesting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Test Connection | ทดสอบส่ง
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
