'use server';

/**
 * Server action to send a notification via Line Notify API.
 * เพิ่มระบบ Retry และการจัดการ DNS Error ให้เสถียรที่สุดสำหรับ Vercel
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) {
    return { success: false, error: 'Token is missing' };
  }

  const cleanToken = token.trim();
  const body = new URLSearchParams();
  body.append('message', message.trim());

  // ฟังก์ชันภายในสำหรับส่ง Request พร้อมระบบ Retry
  const fetchWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
          cache: 'no-store'
        });

        if (response.ok) return response;
        
        // หากเป็น Error จาก API (เช่น Token ผิด) ไม่ต้อง Retry
        if (response.status !== 500 && response.status !== 502 && response.status !== 503 && response.status !== 504) {
          return response;
        }
      } catch (err: any) {
        // หากเป็น DNS Error (ENOTFOUND) ให้รอแล้วลองใหม่
        const isDnsError = err.code === 'ENOTFOUND' || err.message?.includes('getaddrinfo');
        if (isDnsError && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // เพิ่มเวลาการรอขึ้นเรื่อยๆ
          continue;
        }
        throw err;
      }
    }
    throw new Error('All retries failed');
  };

  try {
    const response = await fetchWithRetry();

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Line API Error: ${response.status} - ${errorText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Line Notify Server Error:', error);
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      return { 
        success: false, 
        error: 'Network Error: ระบบ Vercel ค้นหาเซิร์ฟเวอร์ Line ไม่พบ (DNS Error) กรุณากดทดสอบอีกครั้งครับ' 
      };
    }
    return { success: false, error: `Connection Error: ${error.message}` };
  }
}
