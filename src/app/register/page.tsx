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
    <div className="relative p-4 bg-accent rounded-3xl shadow-2xl shadow-accent/40 overflow-hidden w-48 h-28 flex items-end justify-center border-b-4 border-accent-foreground/20">
      {/* Moving Road Lines (From Right to Left for forward motion) */}
      <div className="absolute bottom-6 left-0 w-full h-1 overflow-hidden pointer-events-none">
        <div className="flex w-[200%] animate-[slide-left_1s_linear_infinite]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-8 h-full bg-white/40 mr-8 rounded-full"></div>
          ))}
        </div>
      </div>
      
      {/* Side Profile Jeep */}
      <div className="relative animate-drive-vibration z-10 w-32 mb-4">
        <svg viewBox="0 0 120 70" className="w-32 h-auto text-white fill-current drop-shadow-lg">
          {/* Jeep Body Structure */}
          <path d="M10,45 L110,45 L110,32 L85,32 L78,15 L25,15 L25,32 L10,32 Z" />
          {/* Interior/Cabin shadow */}
          <path d="M28,18 L75,18 L82,32 L28,32 Z" fill="#1e293b" fillOpacity="0.4" />
          {/* Front Bumper */}
          <rect x="105" y="40" width="8" height="6" rx="2" fill="#334155" />
          {/* Spare Tire on the back */}
          <circle cx="12" cy="30" r="10" fill="#0f172a" />
          <circle cx="12" cy="30" r="6" fill="#1e293b" />
          
          {/* Headlight (Side view) */}
          <rect x="108" y="34" width="4" height="6" rx="1" fill="#fef08a" className="animate-pulse" />
        </svg>

        {/* Separated Spinning Wheels */}
        <div className="absolute -bottom-2 left-6 animate-spin duration-500">
           <svg viewBox="0 0 20 20" className="w-6 h-6 text-[#0f172a]">
             <circle cx="10" cy="10" r="9" fill="currentColor" />
             <path d="M10,2 L10,18 M2,10 L18,10 M4,4 L16,16 M16,4 L4,16" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
           </svg>
        </div>
        <div className="absolute -bottom-2 right-4 animate-spin duration-500">
           <svg viewBox="0 0 20 20" className="w-6 h-6 text-[#0f172a]">
             <circle cx="10" cy="10" r="9" fill="currentColor" />
             <path d="M10,2 L10,18 M2,10 L18,10 M4,4 L16,16 M16,4 L4,16" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
           </svg>
        </div>
      </div>
    </div>
    
    <style jsx global>{`
      @keyframes slide-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
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
                  onChange={(e) => setName(name)}
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
