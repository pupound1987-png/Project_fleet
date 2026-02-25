'use server';

/**
 * Server action to send a notification via Line Notify API.
 * This handles the HTTP request on the server to avoid CORS issues in the browser.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token) return { success: false, error: 'Token is missing' };

  try {
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        message: message,
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error: any) {
    console.error('Line Notify Error:', error);
    return { success: false, error: error.message };
  }
}
