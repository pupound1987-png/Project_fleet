'use server';

/**
 * Server action to send a notification via Line Notify API.
 * ปรับปรุงการจัดการ Error ให้รองรับปัญหา DNS (ENOTFOUND) บน Vercel
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) {
    return { success: false, error: 'Token is missing | ไม่พบ Token' };
  }

  try {
    const cleanToken = token.trim();
    const cleanMessage = message.trim();
    
    const body = new URLSearchParams();
    body.append('message', cleanMessage);

    // ใช้ fetch ไปยัง Line Notify API
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {}
      
      return { 
        success: false, 
        error: `Line API Error: ${errorMessage}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Line Notify Full Error:', error);
    
    // จัดการปัญหา ENOTFOUND (DNS Error) ที่พบบ่อยบน Vercel Cloud
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      return {
        success: false,
        error: `Network Error: ระบบ Vercel ไม่สามารถหาที่อยู่ Line API ได้ในขณะนี้ (DNS Error) กรุณากดปุ่มทดสอบใหม่อีกครั้ง หรือรอประมาณ 1-2 นาทีครับ`
      };
    }

    return { 
      success: false, 
      error: `Connection Error: ไม่สามารถเชื่อมต่อกับ Line API ได้ (${error.message})` 
    };
  }
}
