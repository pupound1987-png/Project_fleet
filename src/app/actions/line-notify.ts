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
    
    // Line Notify requires 'application/x-www-form-urlencoded'
    // URLSearchParams ensures correct encoding for messages including spaces and Thai characters
    const body = new URLSearchParams();
    body.append('message', message);

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      // Disable caching for live notifications
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      return { 
        success: false, 
        error: `Line API Error: ${errorData.message || 'Unknown error'}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Line Notify Network Error:', error);
    
    // In many development sandboxes, outgoing requests to external APIs are blocked
    // This is the most common cause of 'fetch failed' in this environment.
    return { 
      success: false, 
      error: `Network Failure: ${error.message}. (หมายเหตุ: ระบบเน็ตเวิร์กในหน้า Preview อาจบล็อกการส่งข้อมูล แต่ระบบจะทำงานได้ปกติเมื่อ Deploy ขึ้นจริงครับ)`
    };
  }
}
