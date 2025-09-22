import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getVerificationHtml } from '@/app/lib/email-template';
import { Public_verificaion } from '@/app/lib/email-template';
import crypto from "crypto";
import { sendPublicMail } from '@/app/lib/mailer_public';
export async function POST(request) {
  try {
    // The API still accepts all the original arguments
    const { verifierEmail, verifierNumber, employee_name, employee_id , company_name, position , exp_description} = await request.json();

    if (!verifierEmail ||  !verifierNumber || !employee_name || !company_name || !position || !exp_description) {
      // console.log(verifierEmail,exp_id,employeeId)
      return NextResponse.json({ error: 'Missing Credentials' }, { status: 400 });
    }
      const slug = company_name.trim().toLowerCase().replace(/\s+/g, "-"); // slugify
      const hash = crypto.createHash("sha256").update(employee_id).digest("hex").slice(0, 8);

      const externalId = `${slug}_${hash}`;



    const workExp = await prisma.workExperience.create({
    data: {
    role: position,
    companyName: company_name,
    employeeId: employee_id,
    description: exp_description,
    verifier_email: verifierEmail || "",
    verifier_number: verifierNumber,
    progress: "Beginning",
    is_external: true,
    external_id: externalId,
  },
});


    const Verification_text=`Employment Verification Required

Dear Verifier,

${employee_name} has added their experience as a ${position} in ${company_name}.  
Please verify the details using the following link:

👉 https://verifier-phi.vercel.app/review/public/experience?externalId=${externalId}

If you don't recognise this request, you can safely ignore this message.

---------------------------------------
You received this message because our user has identified you as a verifier of the organisation.  
© ${new Date().getFullYear()} Demo CRM Innovation Enterprises Private Limited
`

    const deliveryUrl = process.env.QSTASH_DELIVERY_URL;

    // CONSTRUCT THE CORRECT PUBLISH URL HERE
    const publishUrl = `https://qstash.upstash.io/v2/publish/${deliveryUrl}`;

    await sendPublicMail({
        to: verifierEmail,
        subject: `Employee Verification Request for ${user.fullName}`,
        html: Public_verificaion(company_name, employee_name, position,externalId),
    });


    // companyId,verifierNumber, message
    const notificationPayload = {
    verifierNumber: verifierNumber,
    message: Verification_text,
    };
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;


    const notificationPromises = [
      fetch(`${publishUrl}/sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`
        },
        body: JSON.stringify(notificationPayload),
      }),
      fetch(`${publishUrl}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
                Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,

        },
        body: JSON.stringify(notificationPayload),
      }),
    ];

    const results = await Promise.allSettled(notificationPromises);

    results.forEach((r, idx) => {
      if (r.status === "rejected") {
        console.error(`Notification ${idx} failed:`, r.reason);
      }
    })
    // 4. Update the database to record that the email was sent
    const updatedExperience=await prisma.workExperience.update({
        where: { external_id: externalId },
        data: { 
            mail_sent: true, 
            progress:'Mail_sent'
        },
    }
  );



// try {
//   const payload = {
//     type: "progressUpdate",
//     expId: updatedExperience.id, // Corrected from 'experienceId'
//     userId: updatedExperience.userId,
//     progress: `Mail Sent for ${updatedExperience.companyName}`,
//   };

//   // The destination URL from your environment variables
//   await fetch(publishUrl, { // Use the newly constructed URL
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
//     },
//     // The body now only needs to contain the payload for your worker
//     body: JSON.stringify(payload), 
//   });

//   console.log(`Published HR Email update for experienceId=${updatedExperience.id}`);
// } catch (err) {
//   console.error("Failed to publish HR Email update to QStash:", err);
// }
    return NextResponse.json({ message: 'VerificationRequest sent successfully!' });

  } catch (error) {
    console.error("Failed to send email. Error:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
