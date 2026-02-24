"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const AnimatedCarLogo = () => (
  <div className="relative flex flex-col items-center mb-6">
    <div className="relative p-8 bg-accent rounded-3xl shadow-2xl shadow-accent/40 overflow-hidden w-40 h-24 flex items-center justify-center border-b-4 border-accent-foreground/20">
      {/* Road Lines moving Right to Left (Car moving Forward) */}
      <div className="absolute bottom-4 left-0 w-full flex justify-around overflow-hidden h-[3px]">
        <div className="w-8 h-full bg-white/50 animate-road-line"></div>
        <div className="w-8 h-full bg-white/50 animate-road-line [animation-delay:0.3s]"></div>
        <div className="w-8 h-full bg-white/50 animate-road-line [animation-delay:0.6s]"></div>
      </div>
      
      {/* Long Van Body Facing Right */}
      <div className="relative animate-drive-vibration z-10 w-32">
        <svg viewBox="0 0 120 50" className="w-32 h-14 text-white fill-current drop-shadow-xl">
          {/* Long Van Body Shape */}
          <path d="M2,38 L118,38 L118,12 Q118,5 110,5 L15,5 Q2,5 2,15 Z" />
          {/* Large Windshield */}
          <path d="M95,8 L112,8 Q115,8 115,14 L115,22 L95,22 Z" fill="#1e293b" fillOpacity="0.5" />
          {/* Passenger Windows */}
          <path d="M8,8 L32,8 L32,22 L8,22 Z" fill="#1e293b" fillOpacity="0.5" />
          <path d="M36,8 L62,8 L62,22 L36,22 Z" fill="#1e293b" fillOpacity="0.5" />
          <path d="M66,8 L92,8 L92,22 L66,22 Z" fill="#1e293b" fillOpacity="0.5" />
          {/* Headlight */}
          <rect x="114" y="26" width="4" height="4" rx="1" fill="#fef08a" className="animate-pulse" />
          {/* Tail light */}
          <rect x="2" y="26" width="3" height="8" rx="1" fill="#ef4444" />
        </svg>

        {/* Wheels positioned further apart (Long Wheelbase) */}
        <div className="absolute -bottom-1 left-2 w-7 h-7 bg-slate-900 rounded-full border-2 border-white/40 animate-spin [animation-duration:0.4s] shadow-inner">
          <div className="w-full h-[2px] bg-white/60 absolute top-1/2 -translate-y-1/2"></div>
          <div className="w-[2px] h-full bg-white/60 absolute left-1/2 -translate-x-1/2"></div>
        </div>
        <div className="absolute -bottom-1 right-2 w-7 h-7 bg-slate-900 rounded-full border-2 border-white/40 animate-spin [animation-duration:0.4s] shadow-inner">
          <div className="w-full h-[2px] bg-white/60 absolute top-1/2 -translate-y-1/2"></div>
          <div className="w-[2px] h-full bg-white/60 absolute left-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

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
            <CardTitle className="text-2xl font-bold text-white">Login | เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-slate-300">Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="pb-10 px-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    type="email"
                    placeholder="Company Email" 
                    className="pl-12 py-6 bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-accent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    type="password"
                    placeholder="Password" 
                    className="pl-12 py-6 bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-accent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-7 bg-accent hover:bg-accent/90 text-white text-lg font-bold rounded-xl mt-4 shadow-lg shadow-accent/20 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login | เข้าสู่ระบบ"}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>
            
            <div className="text-center mt-8 text-sm text-slate-300">
              Don't have an account?{" "}
              <Link href="/register" className="text-accent font-bold hover:underline underline-offset-4">
                Register | สมัครสมาชิก
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
          &copy; 2024 FleetLink Operation System
        </p>
      </div>
    </div>
  );
}
