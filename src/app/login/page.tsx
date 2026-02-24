
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome Back | ยินดีต้อนรับกลับมา",
        description: "Login successful. (เข้าสู่ระบบสำเร็จ)",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed | เข้าสู่ระบบไม่สำเร็จ",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-[#1a2b3c] mb-8 tracking-tight">TCI TREND GROUP</h1>
      
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem] overflow-hidden">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                type="email"
                placeholder="Email" 
                className="pl-12 py-6 bg-slate-50 border-none rounded-xl text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                type="password"
                placeholder="Password" 
                className="pl-12 py-6 bg-slate-50 border-none rounded-xl text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-7 bg-[#ff8c00] hover:bg-[#e67e00] text-white text-xl font-bold rounded-xl mt-6 shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
          
          <div className="text-center mt-6 text-sm text-gray-500">
            ยังไม่มีบัญชี? <Link href="/register" className="text-[#ff8c00] font-bold hover:underline">สร้างบัญชีใหม่</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
