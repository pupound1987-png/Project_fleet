"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const AnimatedCarLogo = () => (
  <div className="relative flex flex-col items-center mb-6">
    <div className="relative p-6 bg-accent rounded-3xl shadow-2xl shadow-accent/30 overflow-hidden">
      {/* Animated Road Lines */}
      <div className="absolute bottom-2 left-0 w-full flex justify-around overflow-hidden h-[2px]">
        <div className="w-4 h-full bg-white/40 animate-road-line"></div>
        <div className="w-4 h-full bg-white/40 animate-road-line [animation-delay:0.5s]"></div>
        <div className="w-4 h-full bg-white/40 animate-road-line [animation-delay:1s]"></div>
      </div>
      
      {/* Car Body with Vibration */}
      <div className="relative animate-drive-vibration">
        <svg viewBox="0 0 100 50" className="w-16 h-10 text-white fill-current drop-shadow-md">
          <path d="M10,35 Q10,25 20,20 L35,15 Q40,5 55,5 L75,5 Q85,10 90,20 L95,35 Z" />
          <path d="M38,15 L52,10 L72,10 L70,18 L38,18 Z" fill="#1e293b" fillOpacity="0.3" />
          <circle cx="90" cy="25" r="2" fill="#fef08a" />
        </svg>

        {/* Spinning Wheels */}
        <div className="absolute -bottom-1 left-3 w-4 h-4 bg-slate-900 rounded-full border border-white/40 animate-spin">
          <div className="w-full h-[1px] bg-white/60 absolute top-1/2 -translate-y-1/2"></div>
          <div className="w-full h-[1px] bg-white/60 absolute top-1/2 -translate-y-1/2 rotate-90"></div>
        </div>
        <div className="absolute -bottom-1 right-3 w-4 h-4 bg-slate-900 rounded-full border border-white/40 animate-spin">
          <div className="w-full h-[1px] bg-white/60 absolute top-1/2 -translate-y-1/2"></div>
          <div className="w-full h-[1px] bg-white/60 absolute top-1/2 -translate-y-1/2 rotate-90"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const role = email.toLowerCase() === 'admin@tcitrendgroup' ? 'Admin' : 'Employee';

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: name,
        department: "General",
        role: role,
        createdAt: new Date().toISOString()
      });

      if (role === 'Admin') {
        await setDoc(doc(db, "roles_admin", user.uid), {
          active: true,
          email: user.email
        });
      }

      toast({
        title: "Success | สำเร็จ",
        description: `Your account has been created as ${role}. (สร้างบัญชีผู้ใช้ในฐานะ ${role} เรียบร้อยแล้ว)`,
      });
      
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed | ลงทะเบียนไม่สำเร็จ",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://picsum.photos/seed/fleet4/1920/1080"
          alt="Background"
          fill
          className="object-cover"
          priority
          data-ai-hint="car parking"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-6">
          <AnimatedCarLogo />
          <h1 className="text-4xl font-black text-white tracking-tighter mb-1">FleetLink</h1>
          <p className="text-accent font-bold uppercase tracking-[0.3em] text-xs">TCI TREND GROUP</p>
        </div>

        <Card className="glass-morphism border-white/10 shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="pt-10 text-center">
            <CardTitle className="text-2xl font-bold text-white">Register | สร้างบัญชีใหม่</CardTitle>
            <CardDescription className="text-slate-300">Join our vehicle management network today.</CardDescription>
          </CardHeader>
          <CardContent className="pb-10 px-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="Full Name | ชื่อ-นามสกุล" 
                  className="pl-12 py-6 bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-accent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type="email"
                  placeholder="Email | อีเมลพนักงาน" 
                  className="pl-12 py-6 bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type="password"
                  placeholder="Password | รหัสผ่าน" 
                  className="pl-12 py-6 bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-7 bg-accent hover:bg-accent/90 text-white text-lg font-bold rounded-xl mt-4 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign Up | สมัครสมาชิก"}
              </Button>
            </form>
            
            <div className="text-center mt-8 text-sm text-slate-300">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-bold hover:underline underline-offset-4 flex items-center justify-center gap-1 mt-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login | กลับไปเข้าสู่ระบบ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}