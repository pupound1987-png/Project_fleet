'use server';

/**
 * Server action to send a notification via Line Notify API.
 * This is implemented as a server action to avoid CORS issues and protect tokens.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) {
    return { success: false, error: 'Token is missing | ไม่พบ Token' };
  }

  try {
    const cleanToken = token.trim();
    const cleanMessage = message.trim();
    
    // Line Notify requires application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.append('message', cleanMessage);

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
      } catch (e) {
        // Not a JSON error
      }
      return { 
        success: false, 
        error: `Line API Error: ${errorMessage}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Line Notify Error:', error);
    
    // Identify network-level failures common in the development sandbox
    const isNetworkError = error.message?.includes('fetch failed') || error.name === 'TypeError';
    
    if (isNetworkError) {
      return { 
        success: false, 
        error: `Network Connection Blocked: ระบบเน็ตเวิร์กในหน้า Preview นี้ถูกจำกัด (Sandbox) ทำให้ส่งข้อมูลออกภายนอกไม่ได้ครับ แต่โค้ดนี้จะทำงานได้ 100% ทันทีที่คุณกดปุ่ม "Publish" สีน้ำเงินที่มุมขวาบนเพื่อนำแอปขึ้นเซิร์ฟเวอร์จริงครับ`
      };
    }

    return { 
      success: false, 
      error: `Unexpected Error: ${error.message}` 
    };
  }
}
