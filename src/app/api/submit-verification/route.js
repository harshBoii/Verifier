// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import { getVerificationResultHtml } from '@/app/lib/email-template'; // Corrected path
// import prisma from '@/app/lib/prisma'; // 1. Import your Prisma client
// import { Prisma } from '../../../../generated/prisma/edge';

// export async function POST(request) {
//   try {
//     // 2. The API now only needs the employee's ID and the comment
//     const { employeeId, revisionComment,expId  } = await request.json();

//     if (!employeeId) {
//       return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
//     }

//     // 3. Use Prisma to fetch the employee and their company's admin details
//     const employee = await prisma.user.findUnique({
//       where: {
//         id: parseInt(employeeId, 10),
//       },
//       include: {
//         company: {
//           include: {
//             admin: true, // Include the full admin user object
//           },
//         },
//       },
//     });

//     if (!employee || !employee.company || !employee.company.admin) {
//       return NextResponse.json({ error: 'Could not find employee or their company admin.' }, { status: 404 });
//     }

//     const adminEmail = employee.company.admin.email;
//     const employeeName = employee.fullName;
//     const employeeEmail = employee.email;
//     const companyName = employee.company.name

//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT, 10),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD, // Corrected variable name
//       },
//     });

//     // 4. Generate the email HTML using the fetched data
//     const emailHtml = getVerificationResultHtml({
//       employeeName: employeeName,
//       verifierComment: revisionComment
//     });

//     // --- Email to Admin ---
//     const adminMailOptions = {
//       from: `"Demo CRM" <${process.env.SMTP_USER}>`,
//       to: adminEmail,
//       subject: `Verification Submitted for ${employeeName} by ${companyName} `,
//       html: emailHtml,
//     };

//     // --- Email to Employee ---
//     const employeeMailOptions = {
//       from: `"Demo CRM" <${process.env.SMTP_USER}>`,
//       to: employeeEmail,
//       subject: `Your Verification Has Been Processed for Exp in ${companyName}`,
//       html: emailHtml,
//     };
    
//     // 5. Update the employee's status to verified in the database

//     // 6. Send both emails and update the database concurrently
//     await Promise.all([
//         transporter.sendMail(adminMailOptions),
//         transporter.sendMail(employeeMailOptions),

//         await prisma.$transaction([
//         prisma.user.update({
//             where: { id: employee.id },
//             data: { is_verified: true},
//         }),
//         prisma.workExperience.update({
//           where:{id:expId},
//           data:{hr_comment:revisionComment,progress:'Summary_added',chat_finished:true},
//         })
//         ])

//     ]);
//     try {
//       const payload = {
//         type: "progressUpdate",
//         userId: employee.id,
//         expId: expId,
//         progress: 'Summary_added',
//         comment: revisionComment,
//       };

//       await fetch("https://qstash.upstash.io/v2/publish/progress-updates", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
//         },
//         body: JSON.stringify({
//           body: payload,
//           delivery: { url: process.env.QSTASH_DELIVERY_URL },
//         }),
//       });

//       console.log(`Published verificationComplete job for userId=${employee.id}`);
//     } catch (err) {
//       console.error("Failed to publish to QStash:", err);
//     }
//     return NextResponse.json({ message: 'Verification submitted and emails sent successfully!' });

//   } catch (error) {
//     console.error("Failed to send verification result. Error:", error);
//     return NextResponse.json({ error: 'Failed to submit verification.' }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getVerificationResultHtml } from '@/app/lib/email-template';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
  try {
    const { employeeId, revisionComment, expId } = await request.json();

    if (!employeeId || !expId) {
      return NextResponse.json({ error: 'Missing employeeId or expId' }, { status: 400 });
    }

    // 1. Fetch the employee and their company's admin details in one go
    const employee = await prisma.user.findUnique({
      where: { id: parseInt(employeeId, 10) },
      include: {
        company: {
          include: {
            admin: true, // Include the full admin user object
          },
        },
      },
    });

    if (!employee || !employee.company || !employee.company.admin) {
      return NextResponse.json({ error: 'Could not find employee or their company admin.' }, { status: 404 });
    }

    const { fullName: employeeName, email: employeeEmail, company } = employee;
    const { name: companyName, admin } = company;

    // 2. Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false, // Use `true` if your SMTP port is 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const emailHtml = getVerificationResultHtml({
      employeeName: employeeName,
      verifierComment: revisionComment
    });

    // 3. Define mail options for admin and employee
    const adminMailOptions = {
      from: `"Demo CRM" <${process.env.SMTP_USER}>`,
      to: admin.email,
      subject: `Verification Submitted for ${employeeName} by ${companyName}`,
      html: emailHtml,
    };

    const employeeMailOptions = {
      from: `"Demo CRM" <${process.env.SMTP_USER}>`,
      to: employeeEmail,
      subject: `Your Verification Has Been Processed for Experience in ${companyName}`,
      html: emailHtml,
    };

    // 4. Use a Prisma transaction to ensure both DB updates succeed or fail together
    const transaction = prisma.$transaction([
      prisma.user.update({
        where: { id: employee.id },
        data: { is_verified: true },
      }),
      prisma.workExperience.update({
        where: { id: expId },
        data: { hr_comment: revisionComment, progress: 'Summary_added', chat_finished: true },
      })
    ]);

    // 5. Send emails and perform database transaction concurrently
    // This is more efficient and robust.
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(employeeMailOptions),
      transaction, // The transaction promise is now correctly placed here
    ]);

    // 6. Publish to QStash using the corrected direct-to-URL method
    try {
      const payload = {
        type: "progressUpdate",
        userId: employee.id,
        expId: expId,
        progress: 'Summary_added',
        comment: revisionComment,
      };

      const deliveryUrl = process.env.QSTASH_DELIVERY_URL;
      const publishUrl = `https://qstash.upstash.io/v2/publish/${deliveryUrl}`;

      await fetch(publishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      console.log(`Published verificationComplete job for userId=${employee.id}`);
    } catch (err) {
      // Log the error but don't fail the entire request,
      // as the primary goal (emailing and DB update) was successful.
      console.error("Failed to publish notification to QStash:", err);
    }

    return NextResponse.json({ message: 'Verification submitted and emails sent successfully!' });

  } catch (error) {
    console.error("Failed to send verification result. Error:", error);
    // Add specific error handling for Prisma not found error
    if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Record to update not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to submit verification.' }, { status: 500 });
  }
}
