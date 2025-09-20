// app/api/verification/digilocker/education/route.js
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

    const educationDocs = docsData?.education_certificates || [];
    if (educationDocs.length === 0) return NextResponse.json({ error: "No education documents found." }, { status: 404 });

    // Save into Education relation table
    for (const doc of educationDocs) {
      await prisma.education.create({
        data: {
          userId: Number(userId),
          institution: doc.institution_name,
          degree: doc.degree_name,
          year: doc.passing_year,
          documentUrl: doc.document_url,
        }
      });
    }

    return NextResponse.json({ success: true, section: "education", data: educationDocs });

  } catch (err) {
    console.error("Education Verification Error:", err.message);
    return NextResponse.json({ error: "Education verification failed." }, { status: 500 });
  }
}
