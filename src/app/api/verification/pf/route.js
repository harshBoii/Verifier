// app/api/verification/digilocker/pf/route.js
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

    const pfData = docsData?.epfo?.uan || null;
    if (!pfData) return NextResponse.json({ error: "No UAN found." }, { status: 404 });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isPfVerified: true, uan: pfData }
    });

    return NextResponse.json({ success: true, section: "pf", data: pfData });

  } catch (err) {
    console.error("PF Verification Error:", err.message);
    return NextResponse.json({ error: "PF verification failed." }, { status: 500 });
  }
}
