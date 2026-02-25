'use server';

/**
 * Server action to send a notification via Line Notify API.
 * Uses standard x-www-form-urlencoded format required by Line.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) {
    return { success: false, error: 'Token is missing | ไม่พบ Token' };
  }

  try {
    const cleanToken = token.trim();
    
    // Line Notify requires application/x-www-form-urlencoded
    // Using URLSearchParams is the most robust way to ensure correct encoding
    const params = new URLSearchParams();
    params.append('message', message);

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: params.toString(),
      cache: 'no-store'
    });

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.message || errorDetail;
      } catch (e) {
        // Fallback if not JSON
      }
      return { 
        success: false, 
        error: `Line API Error: ${errorDetail}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Line Notify Network Error:', error);
    
    // Provide a clear message about potential network blocks in dev environments
    const errorMessage = error.message || 'Unknown network error';
    return { 
      success: false, 
      error: `Network Failure: ${errorMessage}. (ในโหมด Studio ระบบ Network อาจบล็อกการส่งข้อมูลออกภายนอก)`
    };
  }
}
