'use server';

/**
 * Server action to send a notification via Line Notify API.
 * ปรับปรุงการจัดการ Error ให้รองรับปัญหา DNS (ENOTFOUND) บน Vercel
 * เพิ่มระบบ Retry หากเกิดปัญหาทางเครือข่าย
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) {
    return { success: false, error: 'Token is missing | ไม่พบ Token' };
  }

  const cleanToken = token.trim();
  const cleanMessage = message.trim();
  const body = new URLSearchParams();
  body.append('message', cleanMessage);

  // ฟังก์ชันภายในสำหรับส่ง Request
  const attemptFetch = async () => {
    return await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store'
    });
  };

  try {
    let response = await attemptFetch();

    // หากเจอปัญหา DNS (ENOTFOUND) หรือปัญหาชั่วคราว ให้ลองใหม่อีก 1 ครั้งทันที
    if (!response.ok && response.status === 500) {
       // รอสักครู่แล้วลองใหม่
       await new Promise(resolve => setTimeout(resolve, 500));
       response = await attemptFetch();
    }

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
    
    // จัดการปัญหา ENOTFOUND (DNS Error) ที่ Vercel เจอ
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      return {
        success: false,
        error: `Network Error: ระบบ Vercel ค้นหาที่อยู่ Line API ไม่เจอ (DNS Error) กรุณากดทดสอบใหม่อีกครั้ง หรือรอ 1-2 นาทีเพื่อให้ Vercel อัปเดตเส้นทางเน็ตเวิร์กครับ`
      };
    }

    return { 
      success: false, 
      error: `Connection Error: ไม่สามารถเชื่อมต่อกับ Line API ได้ (${error.message})` 
    };
  }
}
