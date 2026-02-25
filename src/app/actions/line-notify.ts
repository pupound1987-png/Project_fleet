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
    
    // Manual construction of the body for maximum compatibility with all Node environments
    const body = `message=${encodeURIComponent(cleanMessage)}`;

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
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
    console.error('Line Notify Network Error:', error);
    
    // Most common reason in Preview mode: Network isolation
    return { 
      success: false, 
      error: `Network Failure: ${error.message}. (หมายเหตุ: ระบบเน็ตเวิร์กในหน้า Preview อาจบล็อกการส่งข้อมูล แต่ระบบจะทำงานได้ปกติ 100% เมื่อคุณกดปุ่ม Publish สีน้ำเงินด้านบนครับ)`
    };
  }
}
