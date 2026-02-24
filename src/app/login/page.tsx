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
    <div className="relative p-4 bg-primary/10 rounded-3xl shadow-xl overflow-hidden w-64 h-36 flex items-end justify-center border-b-4 border-primary/20">
      {/* Moving Road Lines (Right to Left) */}
      <div className="absolute bottom-6 left-0 w-full h-1 overflow-hidden pointer-events-none">
        <div className="flex w-[200%] animate-[slide-left_0.6s_linear_infinite]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="w-10 h-full bg-slate-400/30 mr-10 rounded-full"></div>
          ))}
        </div>
      </div>
      
      {/* Small Red Car (Facing Right) */}
      <div className="relative animate-drive-vibration z-10 w-32 mb-4">
        <svg viewBox="0 0 120 60" className="w-32 h-auto drop-shadow-lg">
          {/* Car Body - Small Red Sedan */}
          <path 
            d="M10,45 L110,45 L110,35 C110,30 105,25 95,25 L85,25 L75,10 L35,10 L25,25 L15,25 C10,25 10,30 10,35 Z" 
            fill="#dc2626" 
          />
          {/* Windows */}
          <path d="M38,14 L72,14 L80,25 L32,25 Z" fill="#1e293b" fillOpacity="0.6" />
          {/* Headlight */}
          <circle cx="105" cy="35" r="3" fill="#fbbf24" className="animate-pulse" />
          {/* Tail light */}
          <rect x="10" y="32" width="4" height="8" rx="1" fill="#991b1b" />
        </svg>

        {/* Spinning Wheels */}
        <div className="absolute bottom-[-4px] left-6 animate-spin duration-300">
           <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#0f172a]">
             <circle cx="12" cy="12" r="10" fill="currentColor" />
             <path d="M12,4 L12,20 M4,12 L20,12" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
           </svg>
        </div>
        <div className="absolute bottom-[-4px] right-6 animate-spin duration-300">
           <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#0f172a]">
             <circle cx="12" cy="12" r="10" fill="currentColor" />
             <path d="M12,4 L12,20 M4,12 L20,12" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
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
