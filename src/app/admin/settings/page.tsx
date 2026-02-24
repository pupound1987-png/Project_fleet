
"use client";

import { useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BellRing, ShieldCheck, Key, MessageSquare } from "lucide-react";

export default function LineSettingsPage() {
  const { toast } = useToast();
  const [lineToken, setLineToken] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const handleSave = () => {
    // In a real app, this would save to a database or environment variables
    toast({
      title: "Settings Saved | บันทึกการตั้งค่าแล้ว",
      description: "Line notification configurations have been updated. (อัปเดตการตั้งค่าแจ้งเตือนผ่าน Line เรียบร้อยแล้ว)",
    });
  };

  const testConnection = () => {
    toast({
      title: "Test Sent | ส่งข้อความทดสอบแล้ว",
      description: "Check your Line group for the test notification. (กรุณาตรวจสอบข้อความทดสอบในกลุ่ม Line)",
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold text-blue-900">Notification Settings | ตั้งค่าการแจ้งเตือน</h2>
        </header>

        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-blue-950">Line Notification Config | ตั้งค่าแจ้งเตือนผ่านไลน์</h1>
          </div>

          <Card className="shadow-lg border-none">
            <CardHeader className="bg-primary/10 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Line Notify / Messaging API
              </CardTitle>
              <CardDescription>Configure credentials to receive real-time updates on Line. (ตั้งค่าข้อมูลเพื่อรับแจ้งเตือนแบบเรียลไทม์)</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable Notifications | เปิดใช้งานการแจ้งเตือน</Label>
                  <p className="text-sm text-muted-foreground">Send booking updates to Line group. (ส่งข้อมูลการจองไปยังกลุ่มไลน์)</p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" /> Line Notify Token | ไลน์โทเคน
                  </Label>
                  <Input 
                    type="password" 
                    placeholder="Enter your Line Token" 
                    value={lineToken}
                    onChange={(e) => setLineToken(e.target.value)}
                    className="bg-white"
                  />
                  <p className="text-[10px] text-muted-foreground italic">* Token required for sending messages to groups. (จำเป็นต้องใช้ Token ในการส่งข้อความเข้ากลุ่ม)</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Group ID | ไอดีกลุ่ม (Optional)
                  </Label>
                  <Input 
                    placeholder="e.g. C1234567890..." 
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-blue-50">
                <Button variant="outline" className="flex-1" onClick={testConnection}>
                  Test Connection | ทดสอบการเชื่อมต่อ
                </Button>
                <Button className="flex-1 bg-primary text-blue-900 font-bold hover:bg-primary/90" onClick={handleSave}>
                  Save Settings | บันทึกการตั้งค่า
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 border-none">
            <CardContent className="pt-6">
              <h3 className="font-bold text-blue-900 mb-2">How to get Line Token? | วิธีรับ Line Token</h3>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-5">
                <li>Go to <a href="https://notify-bot.line.me/" target="_blank" className="text-blue-600 underline">Line Notify</a></li>
                <li>Login and click on "My Page"</li>
                <li>Generate an access token for your specific group</li>
                <li>Copy and paste the token above</li>
              </ul>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
