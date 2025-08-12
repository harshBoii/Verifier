// import { NextResponse } from 'next/server';

// /**
//  * Handles GET requests to fetch the current SMTP configuration.
//  * NOTE: For security, this NEVER returns the password.
//  */
// export async function GET() {
//   try {
//     const smtpSettings = {
//       smtpHost: process.env.SMTP_HOST || '',
//       smtpPort: process.env.SMTP_PORT || '',
//       smtpUser: process.env.SMTP_USER || '',
//       senderEmail: process.env.SMTP_FROM_EMAIL || '', // Assuming a separate var for the "from" address
//       passwordIsSet: !!process.env.SMTP_PASSWORD,
//     };
//     return NextResponse.json(smtpSettings);
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to load SMTP settings.' }, { status: 500 });
//   }
// }

// /**
//  * Handles POST requests to "save" SMTP configuration.
//  * In a real-world scenario, this would trigger a notification to an admin.
//  * It CANNOT programmatically change environment variables.
//  */
// export async function POST(request) {
//     try {
//         const body = await request.json();
        
//         // IMPORTANT: You cannot change .env variables at runtime.
//         // This action should be seen as a request to an administrator.
//         // In a real application, you might save these to a secure vault
//         // or trigger a CI/CD pipeline to update environment variables.
//         console.log("Received request to update SMTP settings (requires manual update and redeploy):", body);

//         // You can add logic here to send an email notification to a super admin.

//         return NextResponse.json({ message: 'SMTP settings update request received. Manual update and redeployment are required to apply changes.' });

//     } catch (error) {
//         console.error("API Update SMTP Error:", error);
//         return NextResponse.json({ error: 'Failed to process SMTP settings update.' }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import CryptoJS from 'crypto-js';

// Helper function to encrypt data
const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_SECRET).toString();
};

// Helper function to decrypt data (not used in this route, but useful for sending mail)
const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.ENCRYPTION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Handles GET requests to fetch the SMTP settings for the admin's company.
 */
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const adminId = payload.userId;

    const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { companyId: true } });
    if (!admin?.companyId) return NextResponse.json({ error: 'Admin not found or not linked to a company' }, { status: 404 });

    const company = await prisma.company.findUnique({ where: { id: admin.companyId } });

    return NextResponse.json({
      smtpHost: company.smtpHost || '',
      smtpPort: company.smtpPort || '',
      smtpUser: company.smtpUser || '',
      senderEmail: company.senderEmail || '',
      passwordIsSet: !!company.smtpPassword, // Securely indicate if a password exists
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load SMTP settings.' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update the SMTP settings for the admin's company.
 */
export async function PUT(request) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        const adminId = payload.userId;
        
        const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { companyId: true } });
        if (!admin?.companyId) return NextResponse.json({ error: 'Admin not found or not linked to a company' }, { status: 404 });

        const body = await request.json();
        const { smtpHost, smtpPort, smtpUser, smtpPass, senderEmail } = body;

        let dataToUpdate = {
            smtpHost,
            smtpPort: parseInt(smtpPort, 10) || null,
            smtpUser,
            senderEmail,
        };

        // Only update the password if a new one was provided and it's not the placeholder
        if (smtpPass && !smtpPass.includes('••••')) {
            dataToUpdate.smtpPassword = encrypt(smtpPass);
        }
        
        await prisma.company.update({
            where: { id: admin.companyId },
            data: dataToUpdate,
        });

        return NextResponse.json({ message: 'SMTP settings updated successfully!' });
    } catch (error) {
        console.error("API Update SMTP Error:", error);
        return NextResponse.json({ error: 'Failed to update SMTP settings.' }, { status: 500 });
    }
}
