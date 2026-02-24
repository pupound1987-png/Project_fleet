'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full shadow-2xl border-none">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Something went wrong!</CardTitle>
            <CardDescription>
              We encountered an unexpected error. Please try refreshing the page.
              (เกิดข้อผิดพลาดไม่คาดคิด กรุณาลองใหม่อีกครั้ง)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="bg-slate-100 p-3 rounded text-[10px] font-mono text-slate-600 overflow-auto max-h-32">
              {error.message}
            </div>
            <Button 
              onClick={() => reset()} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again | ลองอีกครั้ง
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="w-full py-6"
            >
              Back to Home | กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}
