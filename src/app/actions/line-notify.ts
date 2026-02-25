'use server';

/**
 * Server action to send a notification via Line Notify API.
 * This handles the HTTP request on the server to avoid CORS issues in the browser.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) return { success: false, error: 'Token is missing' };

  try {
    const cleanToken = token.trim();
    
    // Line Notify requires application/x-www-form-urlencoded
    // Standard format for Line Notify: message=<value>
    const body = new URLSearchParams();
    body.append('message', message);

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${cleanToken}`,
        'User-Agent': 'FleetLink-App/1.0', // Some APIs require a User-Agent
      },
      body: body.toString(),
      cache: 'no-store'
    });

    if (!response.ok) {
      // If Line API returns an error status (e.g., 401 Unauthorized)
      let errorDetail = 'Check your token';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.message || errorDetail;
      } catch (e) {
        // Not JSON
      }
      return { 
        success: false, 
        error: `Line API Error (${response.status}): ${errorDetail}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    // This catches "fetch failed", DNS issues, or connection timeouts
    console.error('Line Notify Fetch Error:', error);
    
    // Providing more context for the "fetch failed" error which is common in node environments
    const errorMessage = error.message || 'Unknown network error';
    return { 
      success: false, 
      error: `Connection Failed: ${errorMessage}. Please verify your network can reach notify-api.line.me`
    };
  }
}
