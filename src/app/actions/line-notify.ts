'use server';

/**
 * Server action to send a notification via Line Notify API.
 * Includes a robust 5-round retry mechanism to handle Vercel/Studio DNS (ENOTFOUND) issues.
 */
export async function sendLineNotification(token: string, message: string) {
  if (!token || !token.trim()) {
    return { success: false, error: 'กรุณาระบุ Token ก่อนครับ' };
  }

  const cleanToken = token.trim();
  const formData = new URLSearchParams();
  formData.append('message', message.trim());

  const maxRetries = 5;
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        cache: 'no-store', // Force no cache for DNS freshness
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        lastError = new Error(`Line API Error (${response.status}): ${errorText}`);
        
        // Don't retry for authentication or bad request errors
        if (response.status === 401 || response.status === 400) {
          return { success: false, error: `Token หรือข้อมูลผิดพลาด (${response.status})` };
        }
      }
    } catch (err: any) {
      lastError = err;
      
      const isRetryable = 
        err.code === 'ENOTFOUND' || 
        err.code === 'EAI_AGAIN' ||
        err.code === 'ECONNRESET' ||
        err.name === 'AbortError' ||
        err.message?.includes('fetch failed');
      
      if (isRetryable && i < maxRetries - 1) {
        // Exponential backoff delay (1s, 2s, 4s, 8s, 16s)
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  let errorMessage = lastError?.message || 'Unknown network error';
  
  // Specific handling for DNS/Network errors commonly found on Vercel/Studio
  if (errorMessage.includes('getaddrinfo') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('fetch failed')) {
    errorMessage = 'Network Error: ระบบ Vercel/Studio ไม่สามารถเชื่อมต่อกับ Line ได้ (DNS Issue) กรุณารอสักครู่แล้วกด "ทดสอบ" ซ้ำอีกครั้งครับ (ระบบพยายามแล้ว 5 ครั้ง)';
  } else if (lastError?.name === 'AbortError') {
    errorMessage = 'Timeout: การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้งครับ';
  }

  console.error('Final Line Notify Failure:', lastError);
  return { success: false, error: errorMessage };
}
