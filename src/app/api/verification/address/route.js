import { NextResponse } from 'next/server';
import { initiateAadhaarOtp, verifyAadhaarOtp } from '@/app/lib/verificationServices';
import { setVerificationSession, getVerificationSession } from '@/app/lib/sessionStore';

export async function POST(request) {
  try {
    const { step, aadhaar, otp, clientId } = await request.json();

    if (step === 'send-otp') {
      if (!aadhaar || !/^\d{12}$/.test(aadhaar.replace(/\s/g, ''))) {
        return NextResponse.json({ error: 'A valid 12-digit Aadhaar number is required.' }, { status: 400 });
      }

      const providerResponse = await initiateAadhaarOtp(aadhaar.replace(/\s/g, ''));

      if (!providerResponse.success || !providerResponse.data?.client_id) {
        throw new Error('Provider failed to initiate OTP.');
      }

      // Securely store the client_id with a short expiry
      await setVerificationSession(providerResponse.data.client_id, { type: 'aadhaar' });

      return NextResponse.json({ success: true, message: 'OTP sent successfully.', clientId: providerResponse.data.client_id });
    } 
    
    else if (step === 'verify-otp') {
      if (!otp || !clientId) {
        return NextResponse.json({ error: 'OTP and Client ID are required.' }, { status: 400 });
      }

      const session = await getVerificationSession(clientId);
      if (!session || session.type !== 'aadhaar') {
        return NextResponse.json({ error: 'Invalid or expired session. Please try again.' }, { status: 400 });
      }

      const providerResponse = await verifyAadhaarOtp(clientId, otp);

      if (!providerResponse.success) {
        return NextResponse.json({ error: 'Invalid OTP or verification failed.' }, { status: 400 });
      }

      // TODO: Save the verified address (providerResponse.data) to your database.
      // Do not store the raw Aadhaar number.

      return NextResponse.json({ success: true, message: 'Address verified successfully.', data: providerResponse.data });
    }

    return NextResponse.json({ error: 'Invalid step provided.' }, { status: 400 });

  } catch (error) {
    console.error("Address Verification API Error:", error.message);
    return NextResponse.json({ error: 'Failed to verify address.' }, { status: 500 });
  }
}
