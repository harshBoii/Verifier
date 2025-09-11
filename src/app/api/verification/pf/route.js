import { NextResponse } from 'next/server';
// Assuming your provider has EPFO endpoints similar to Aadhaar's.
// You would create `initiatePfOtp` and `verifyPfOtp` in verificationServices.js
import { initiatePfOtp, verifyPfOtp } from '@/app/lib/verificationServices'; 
import { setVerificationSession, getVerificationSession } from '@/app/lib/sessionStore';

export async function POST(request) {
  try {
    const { step, mobile, otp, clientId } = await request.json();

    if (step === 'send-otp') {
      if (!mobile) {
        return NextResponse.json({ error: 'Mobile number is required.' }, { status: 400 });
      }

      const providerResponse = await initiatePfOtp(mobile);
      if (!providerResponse.success || !providerResponse.data?.client_id) {
        throw new Error('Provider failed to send PF OTP.');
      }
      
      await setVerificationSession(providerResponse.data.client_id, { type: 'pf' });
      return NextResponse.json({ success: true, message: 'OTP sent successfully.', clientId: providerResponse.data.client_id });
    }

    else if (step === 'verify-otp') {
      if (!otp || !clientId) {
        return NextResponse.json({ error: 'OTP and Client ID are required.' }, { status: 400 });
      }

      const session = await getVerificationSession(clientId);
      if (!session || session.type !== 'pf') {
        return NextResponse.json({ error: 'Invalid or expired PF session.' }, { status: 400 });
      }
      
      const providerResponse = await verifyPfOtp(clientId, otp);
      if (!providerResponse.success) {
        return NextResponse.json({ error: 'Invalid OTP or PF verification failed.' }, { status: 400 });
      }

      // TODO: Save the fetched UAN and employment history to your database.

      return NextResponse.json({ success: true, message: 'PF details verified successfully.', data: providerResponse.data });
    }

    return NextResponse.json({ error: 'Invalid step provided.' }, { status: 400 });

  } catch (error) {
    console.error("PF Verification API Error:", error.message);
    return NextResponse.json({ error: 'Failed to verify PF details.' }, { status: 500 });
  }
}
