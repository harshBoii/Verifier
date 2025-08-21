import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';

export async function POST(request) {
  try {
    // 1. Authenticate the user from their session to ensure they have the right to add templates.
    // This part is optional but highly recommended for security.
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jose.jwtVerify(token, secret);

    // 2. Get the form data from the request body
    const body = await request.json();
    const {
      companyId, // The ID of the company this template belongs to
      name,
      type,
      subject,
      body: emailBody, // Destructure 'body' from the request and rename it to 'emailBody'
    } = body;

    // 3. Basic validation
    if (!companyId || !name || !type || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 4. Use Prisma to create the new email template record in the database
    const newTemplate = await prisma.emailTemplate.create({
      data: {
        companyId: parseInt(companyId, 10), // Ensure companyId is an integer
        name,
        type,
        subject,
        body: emailBody, // The HTML content from the rich text editor
      },
    });

    // 5. Return the newly created template with a 201 Created status
    return NextResponse.json(newTemplate, { status: 201 });

  } catch (error) {
    // Handle potential unique constraint errors (e.g., if a template of that type already exists for the company)
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A template with this name or type already exists for this company.' }, { status: 409 });
    }
    console.error("API Add Email Template Error:", error);
    return NextResponse.json({ error: 'Failed to create email template.' }, { status: 500 });
  }
}
