import { NextResponse } from 'next/server';
import { performSubmitVerification } from '@/app/lib/perform-submit-verification';

export async function POST(request) {
  try {
    const { employeeId, revisionComment, expId } = await request.json();

    if (!employeeId || !expId) {
      return NextResponse.json({ error: 'Missing employeeId or expId' }, { status: 400 });
    }

    const result = await performSubmitVerification({
      employeeId,
      expId,
      revisionComment,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to send verification result. Error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record to update not found.' }, { status: 404 });
    }
    if (
      error.message === 'Missing employeeId or expId' ||
      error.message === 'Could not find employee or their company admin.'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit verification.' }, { status: 500 });
  }
}
