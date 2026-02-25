'use server';

/**
 * Server action to send a notification via Line Notify API.
 * This handles the HTTP request on the server to avoid CORS issues.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) return { success: false, error: 'Token is missing' };

  try {
    const cleanToken = token.trim();
    
    // Line Notify requires application/x-www-form-urlencoded
    // Standard body format: message=URL_ENCODED_STRING
    const body = `message=${encodeURIComponent(message)}`;

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: body,
      cache: 'no-store'
    });

    if (!response.ok) {
      let errorDetail = 'API Rejected';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.message || errorDetail;
      } catch (e) {
        // Fallback to text if not JSON
      }
      return { 
        success: false, 
        error: `Line API Error (${response.status}): ${errorDetail}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    // This catches "fetch failed", DNS issues, or connection timeouts
    console.error('Line Notify Network Error:', error);
    
    const errorMessage = error.message || 'Unknown network error';
    return { 
      success: false, 
      error: `Network Failure: ${errorMessage}. (ระบบ Network ของ Cloud อาจบล็อกการส่งข้อมูลออกไปภายนอก)`
    };
  }
}
