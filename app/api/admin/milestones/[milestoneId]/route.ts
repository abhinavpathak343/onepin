import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteMilestone, findMilestoneById } from '@/lib/demo-store';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const milestone = findMilestoneById(params.milestoneId);

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestone.academyId !== session.user.academyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    deleteMilestone(params.milestoneId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Milestone delete error:', error);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
