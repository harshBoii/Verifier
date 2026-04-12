import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { performSubmitVerification } from '@/app/lib/perform-submit-verification';
import {
  parseExperienceIdFromExpToken,
  parseEmployeeUserIdFromEmpToken,
} from '@/app/lib/outbound-call-ids';

/**
 * Called by the voice microservice when an outbound verification call completes.
 * Body: { emp_id, exp_id, summary }
 */
export async function POST(request) {
  try {
    const secret = process.env.WEBHOOK_CALL_SECRET;
    if (secret) {
      const auth = request.headers.get('authorization');
      if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { emp_id, exp_id, summary } = body;

    if (exp_id == null || exp_id === '') {
      return NextResponse.json({ error: 'exp_id is required.' }, { status: 400 });
    }

    const expNumeric = parseExperienceIdFromExpToken(exp_id);
    if (expNumeric == null) {
      return NextResponse.json({ error: 'Invalid exp_id format.' }, { status: 400 });
    }

    let employeeId = parseEmployeeUserIdFromEmpToken(emp_id);

    const experience = await prisma.workExperience.findUnique({
      where: { id: expNumeric },
      select: { userId: true },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Work experience not found.' }, { status: 404 });
    }

    if (employeeId == null && experience.userId != null) {
      employeeId = experience.userId;
    }

    if (employeeId == null) {
      return NextResponse.json(
        { error: 'Could not resolve employee for this experience.' },
        { status: 400 }
      );
    }

    const revisionComment =
      typeof summary === 'string' ? summary : summary != null ? String(summary) : '';

    await performSubmitVerification({
      employeeId,
      expId: expNumeric,
      revisionComment,
    });

    return NextResponse.json({ ok: true, message: 'Verification recorded.' }, { status: 200 });
  } catch (error) {
    console.error('webhook call/done error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record to update not found.' }, { status: 404 });
    }
    if (error.message === 'Missing employeeId or expId') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process webhook.' }, { status: 500 });
  }
}
