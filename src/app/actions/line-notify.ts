'use server';

/**
 * Server action to send a notification via Line Notify API.
 * This handles the HTTP request on the server to avoid CORS issues in the browser.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token) return { success: false, error: 'Token is missing' };

  try {
    // Trimming token to avoid whitespace issues
    const cleanToken = token.trim();
    
    // Line Notify requires application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.append('message', message);

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${cleanToken}`,
      },
      body: body.toString(),
      // Add a timeout or cache policy if needed
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return { 
        success: false, 
        error: `Line API Error (${response.status}): ${errorData.message || 'Check your token'}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    // This catches "fetch failed" or network-related exceptions
    console.error('Line Notify Fetch Error:', error);
    return { 
      success: false, 
      error: error.message === 'fetch failed' 
        ? 'Connection failed. The server could not reach Line Notify API.' 
        : `Network error: ${error.message}` 
    };
  }
}
