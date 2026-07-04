import { NextRequest, NextResponse } from 'next/server';
import { findAcademyById } from '@/lib/demo-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { academyId: string } }
) {
  try {
    const academy = findAcademyById(params.academyId);

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    return NextResponse.json(academy);
  } catch (error) {
    console.error('Academy fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch academy' }, { status: 500 });
  }
}
