import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { createMilestone } from '@/lib/demo-store';

const createSchema = z.object({
  academyId: z.string(),
  type: z.enum(['streak', 'points']),
  threshold: z.number().min(1),
  rewardDescription: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.parse(body);

    if (parsed.academyId !== session.user.academyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestone = createMilestone({
      academyId: parsed.academyId,
      type: parsed.type,
      threshold: parsed.threshold,
      rewardDescription: parsed.rewardDescription,
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error) {
    console.error('Milestone create error:', error);
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
