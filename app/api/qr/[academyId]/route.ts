import { NextRequest, NextResponse } from 'next/server';
import { getQRToken } from '@/lib/qr-token';

export async function GET(
  request: NextRequest,
  { params }: { params: { academyId: string } }
) {
  try {
    const { token, window, expiresAt } = getQRToken(params.academyId);

    return NextResponse.json({
      academyId: params.academyId,
      token,
      window,
      expiresAt,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
