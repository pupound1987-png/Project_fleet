'use server';

/**
 * Server action to send a notification via Telegram Bot API.
 * Telegram is generally more stable regarding DNS (ENOTFOUND) issues.
 */
export async function sendTelegramNotification(botToken: string, chatId: string, message: string) {
  if (!botToken || !chatId || !message) {
    return { success: false, error: 'ข้อมูลไม่ครบถ้วน (Token, Chat ID หรือ Message)' };
  }

  const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
  
  const maxRetries = 3;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: message,
          parse_mode: 'HTML'
        }),
        cache: 'no-store',
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        lastError = new Error(`Telegram API Error: ${errorData.description || response.statusText}`);
        if (response.status === 401 || response.status === 400) break;
      }
    } catch (err: any) {
      lastError = err;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      break;
    }
  }

  return { 
    success: false, 
    error: lastError?.message || 'การเชื่อมต่อ Telegram ล้มเหลว' 
  };
}