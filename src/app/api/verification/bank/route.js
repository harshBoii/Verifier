import { NextResponse } from 'next/server';
import { verifyBankAccount } from '@/app/lib/verificationServices';

export async function POST(request) {
  try {
    const { accountNumber, ifsc } = await request.json();

    if (!accountNumber || !ifsc) {
      return NextResponse.json({ error: 'Account number and IFSC code are required.' }, { status: 400 });
    }

    const providerResponse = await verifyBankAccount(accountNumber, ifsc);

    if (!providerResponse.success || !providerResponse.data?.registered_name) {
      return NextResponse.json({ error: 'Bank account details could not be verified.' }, { status: 400 });
    }

    // TODO: Match the returned name (providerResponse.data.registered_name)
    // against the user's name in your DB and update their status.

    return NextResponse.json({ 
      success: true, 
      message: 'Bank account verified successfully.',
      data: { accountHolderName: providerResponse.data.registered_name },
    });

  } catch (error) {
    console.error("Bank Verification API Error:", error.message);
    return NextResponse.json({ error: 'Failed to verify bank account.' }, { status: 500 });
  }
}
