
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { adminBookingAnomalyDetection, type AdminBookingAnomalyDetectionOutput } from "@/ai/flows/admin-booking-anomaly-detection";
import { MOCK_BOOKINGS } from "@/lib/mock-data";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function AnomalyDetectionWidget() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminBookingAnomalyDetectionOutput | null>(null);

  const runDetection = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Map mock data to detection input
      const res = await adminBookingAnomalyDetection({
        bookings: MOCK_BOOKINGS.map(b => ({
          bookingId: b.id,
          vehicleId: b.vehicleId,
          vehicleName: b.vehicleName,
          employeeName: b.employeeName,
          department: b.department,
          startDateTime: b.startDateTime,
          endDateTime: b.endDateTime,
          purpose: b.purpose,
          status: b.status as any,
          createdAt: b.createdAt
        }))
      });
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-white to-accent/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-bold">Smart Insights | ข้อมูลอัจฉริยะ</CardTitle>
        </div>
        <CardDescription>AI-powered anomaly detection for booking patterns. (ระบบตรวจจับความผิดปกติในการจองด้วย AI)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && !loading && (
          <Button 
            onClick={runDetection} 
            className="w-full bg-primary text-blue-900 hover:bg-primary/80 font-semibold"
          >
            Analyze Activity | วิเคราะห์กิจกรรม
          </Button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Scanning bookings for irregularities... (กำลังสแกนหาความผิดปกติ...)</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            {result.isAnomaly ? (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Anomaly Detected: {result.anomalyType} | ตรวจพบความผิดปกติ</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {result.description}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>All Clear | ปกติดี</AlertTitle>
                <AlertDescription className="text-xs">
                  {result.description}
                </AlertDescription>
              </Alert>
            )}

            {result.suggestedAction && (
              <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs">
                <p className="font-bold text-blue-900 mb-1">Suggested Action | ข้อเสนอแนะ:</p>
                <p className="text-muted-foreground">{result.suggestedAction}</p>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setResult(null)} 
              className="w-full text-xs"
            >
              Clear Results | ล้างผลลัพธ์
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
