// app/api/verification/digilocker/address/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { exchangeCodeForToken, fetchDigilockerDocs } from '@/app/lib/idfyClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");

    if (!code || !userId) return NextResponse.json({ error: "Missing params." }, { status: 400 });

    const tokenData = await exchangeCodeForToken(code);
    const docsData = await fetchDigilockerDocs(tokenData.access_token);

    const addressData = docsData?.aadhaar?.address || null;
    if (!addressData) return NextResponse.json({ error: "No address found." }, { status: 404 });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isAddressVerified: true, verifiedAddress: addressData }
    });

    return NextResponse.json({ success: true, section: "address", data: addressData });

  } catch (err) {
    console.error("Address Verification Error:", err.message);
    return NextResponse.json({ error: "Address verification failed." }, { status: 500 });
  }
}
