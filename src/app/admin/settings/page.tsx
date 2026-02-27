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
import { Key, MessageSquare, Loader2, Send, ShieldCheck, Info } from "lucide-react";
import { useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { sendTelegramNotification } from "@/app/actions/telegram-notify";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function TelegramSettingsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const configRef = useMemoFirebase(() => doc(db, "settings", "telegram-config"), [db]);
  const { data: config, isLoading } = useDoc(configRef);

  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSimulated, setIsSimulated] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setBotToken(config.botToken || "");
      setChatId(config.chatId || "");
      setIsEnabled(config.enabled !== false);
      setIsSimulated(config.isSimulated !== false);
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    setDocumentNonBlocking(configRef, {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled: isEnabled,
      isSimulated: isSimulated,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "บันทึกเรียบร้อย | Saved",
        description: isSimulated 
          ? "อัปเดตโหมดจำลองแล้ว" 
          : "ระบบ Telegram ออนไลน์พร้อมใช้งาน",
      });
    }, 500);
  };

  const testConnection = async () => {
    if (isSimulated) {
      setIsTesting(true);
      setTimeout(() => {
        setIsTesting(false);
        toast({
          title: "จำลองการส่งสำเร็จ! | Simulation",
          description: "🔔 [SIM]: ข้อความจำลอง Telegram แจ้งเตือนสำเร็จ",
        });
      }, 800);
      return;
    }

    if (!botToken || !chatId) {
      toast({ variant: "destructive", title: "ข้อมูลไม่ครบ", description: "กรุณาระบุ Bot Token และ Chat ID ครับ" });
      return;
    }

    setIsTesting(true);
    const res = await sendTelegramNotification(botToken, chatId, "<b>🔔 FleetLink Test</b>\nระบบแจ้งเตือน Telegram พร้อมใช้งานแล้ว!");
    setIsTesting(false);

    if (res.success) {
      toast({ title: "ส่งสำเร็จ! | Success", description: "ตรวจสอบในแอป Telegram ของคุณได้เลย" });
    } else {
      toast({
        variant: "destructive",
        title: "การเชื่อมต่อล้มเหลว",
        description: res.error,
      });
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
            <Send className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-blue-950">Telegram Notification | แจ้งเตือนผ่านเทเลแกรม</h1>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 font-bold">ทำไมต้อง Telegram?</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              Telegram มีความเสถียรสูงกว่าในสภาพแวดล้อม Cloud อย่าง Vercel/Studio และแก้ปัญหา DNS Error ได้ดีกว่า Line Notify ครับ
            </AlertDescription>
          </Alert>

          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-primary/10 border-b">
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Telegram Bot Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <>
                  <div className="grid gap-4">
                    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isSimulated ? 'bg-amber-50 border-amber-100 shadow-inner' : 'bg-blue-50/50 border-blue-100'}`}>
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold text-blue-900">Simulation Mode | โหมดจำลอง</Label>
                        <p className="text-xs text-muted-foreground">ใช้เพื่อทดสอบ Flow งานโดยไม่ต้องส่งข้อความจริง</p>
                      </div>
                      <Switch checked={isSimulated} onCheckedChange={setIsSimulated} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/10">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Enabled | เปิดใช้งาน</Label>
                        <p className="text-xs text-muted-foreground">อนุญาตให้มีการแจ้งเตือนเมื่อมีการจอง</p>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-bold">
                        <Key className="w-4 h-4 text-primary" /> Bot Token
                      </Label>
                      <Input 
                        type="password" 
                        placeholder="123456789:ABCDefgh..." 
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        className="bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-bold">
                        <Send className="w-4 h-4 text-primary" /> Chat ID
                      </Label>
                      <Input 
                        placeholder="-100123456789" 
                        value={chatId}
                        onChange={(e) => setChatId(e.target.value)}
                        className="bg-white font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3" /> คุณสามารถใช้ @userinfobot เพื่อหา Chat ID ของคุณได้
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={testConnection} disabled={isTesting}>
                      {isTesting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Test Connection | ทดสอบ
                    </Button>
                    <Button className="flex-1 bg-primary text-blue-900 font-bold hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Save & Apply | บันทึกค่า
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
