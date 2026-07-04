import { createHmac } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'streakin-secret-key-change-in-production';
const WINDOW_SECONDS = 15;

export function getQRToken(academyId: string): { token: string; window: number; expiresAt: number } {
  const window = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const expiresAt = (window + 1) * WINDOW_SECONDS * 1000;
  const data = `${academyId}:${window}`;
  const token = createHmac('sha256', JWT_SECRET).update(data).digest('hex').slice(0, 16);
  return { token, window, expiresAt };
}

export interface QRData {
  academyId: string;
  token: string;
  window: number;
  expiresAt: number;
}

export function validateQRToken(qrData: QRData): { valid: boolean; academyId?: string; error?: string } {
  const currentWindow = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);

  // Accept current window or one prior
  if (qrData.window !== currentWindow && qrData.window !== currentWindow - 1) {
    return { valid: false, error: 'QR code expired. Please scan the screen again.' };
  }

  const data = `${qrData.academyId}:${qrData.window}`;
  const expectedToken = createHmac('sha256', JWT_SECRET).update(data).digest('hex').slice(0, 16);

  if (qrData.token !== expectedToken) {
    return { valid: false, error: 'Invalid QR code. Please scan the screen again.' };
  }

  return { valid: true, academyId: qrData.academyId };
}

export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
