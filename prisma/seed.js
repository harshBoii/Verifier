import { PrismaClient, TemplateType } from '@prisma/client';
const prisma = new PrismaClient();

const templates = [
  // ========== CATEGORY: Verification_Request ==========

  // Template 1: Your Original Design (Enhanced)
  {
    name: 'Verification Request - Standard',
    type: TemplateType.Verification_Request,
    subject: 'Action Required: Please Verify Employment Details for {{name}}',
    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Google Sans', Arial, sans-serif; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
              .header { background-color: #4285F4; padding: 20px; text-align: center; }
              .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; }
              .content { padding: 30px; color: #3c4043; line-height: 1.6; }
              .content p { margin: 0 0 15px; }
              .button-wrapper { text-align: center; margin: 30px 0; }
              .button { background-color: #1a73e8; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 500; display: inline-block; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #5f6368; background-color: #f6f9fc; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header"><h1>Employment Verification Required</h1></div>
              <div class="content">
                  <p>Dear Verifier,</p>
                  <p>A request has been initiated to verify the employment details of <strong>{{name}}</strong> for the position of <strong>{{position}}</strong> at <strong>{{company}}</strong>.</p>
                  <p>Please review and confirm the provided information by clicking the button below. Your timely response is greatly appreciated.</p>
                  <div class="button-wrapper"><a href="{{exp_id}}" class="button">Verify Details</a></div>
                  <p>If you did not expect this request or believe it was sent in error, you may safely disregard this email.</p>
              </div>
              <div class="footer">
                  You received this email because you were identified as a verifier for this organization.<br>&copy; {{new Date().getFullYear()}} Demo CRM Innovation. All rights reserved.
              </div>
          </div>
      </body>
      </html>
    `,
  },
  // Template 2: Minimalist Verification Request
  {
    name: 'Verification Request - Minimalist',
    type: TemplateType.Verification_Request,
    subject: 'Verification Needed: {{name}}',
    body: `
      <!DOCTYPE html><html><body style="font-family: Inter, sans-serif; text-align: center; padding: 20px;">
        <h2>Verify Employment for {{name}}</h2>
        <p>Position: {{position}} at {{company}}</p>
        <a href="{{exp_id}}" style="display:inline-block; margin-top: 20px; padding: 12px 25px; background-color:#333; color:#fff; text-decoration:none; border-radius:4px;">Click to Verify</a>
      </body></html>
    `,
  },
  // Template 3: Formal Verification Request
  {
    name: 'Verification Request - Formal',
    type: TemplateType.Verification_Request,
    subject: 'Official Request for Employment Verification',
    body: `
      <!DOCTYPE html><html><body style="font-family: Georgia, serif; line-height: 1.5; color: #222;">
        <p>Dear Sir/Madam,</p>
        <p>This email serves as a formal request to verify the employment of <strong>{{name}}</strong>, who has listed experience as a <strong>{{position}}</strong> at your esteemed organization, <strong>{{company}}</strong>.</p>
        <p>Please proceed by accessing the secure portal via this link: <a href="{{exp_id}}">Verification Portal</a>.</p>
        <p>Thank you for your cooperation.</p>
      </body></html>
    `,
  },
  
  // ========== CATEGORY: Verification_Result ==========

  // Template 4: Your Original Design (Enhanced)
  {
    name: 'Verification Result - Standard',
    type: TemplateType.Verification_Result,
    subject: 'Update: Verification Submitted for {{employeeName}}',
    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <style>
              body { background-color: #f6f9fc; font-family: 'Roboto', Arial, sans-serif; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #dadce0; }
              .header { font-size: 22px; color: #202124; margin-bottom: 20px; }
              .comment-box { background-color: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px; margin: 20px 0; font-style: italic; color: #3c4043; }
              .footer { font-size: 12px; color: #5f6368; text-align: center; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1 class="header">Verification Result for {{employeeName}}</h1>
              <p>The verifier has submitted the following comment regarding the experience details:</p>
              <div class="comment-box">
                  <p>"{{verifierComment || "I can confirm that the experience details provided are accurate to the best of my knowledge."}}"</p>
              </div>
              <p>This feedback has been recorded. Please visit your dashboard for a complete overview.</p>
          </div>
          <p class="footer">This is an automated notification.</p>
      </body>
      </html>
    `,
  },
  // Template 5: Concise Verification Result
  {
    name: 'Verification Result - Concise',
    type: TemplateType.Verification_Result,
    subject: 'Result for {{employeeName}}',
    body: `
      <!DOCTYPE html><html><body style="font-family: Inter, sans-serif; padding:20px;">
        <h3>Verification Update</h3>
        <p><strong>For:</strong> {{employeeName}}</p>
        <p><strong>Verifier's Comment:</strong></p>
        <blockquote style="margin:0; padding:10px; background:#f1f1f1; border-left:3px solid #ccc;">{{verifierComment || "Approved."}}</blockquote>
      </body></html>
    `,
  },
  // Template 6: Detailed Verification Result
  {
    name: 'Verification Result - Detailed',
    type: TemplateType.Verification_Result,
    subject: 'Verification Completed: Review Required for {{employeeName}}',
    body: `
      <!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height:1.6;">
        <p>Hello,</p>
        <p>The verification process for <strong>{{employeeName}}</strong> has been completed. The verifier has provided the feedback below for your review.</p>
        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        <p><strong>Verifier's Statement:</strong></p>
        <p style="padding:15px; background:#e9f5ff; border:1px solid #bde0fe; border-radius:4px;">{{verifierComment || "The employment history is verified and correct."}}</p>
        <p>No further action is required unless there are discrepancies.</p>
      </body></html>
    `,
  },
  
  // ========== CATEGORY: Request_Hr_Mail ==========

  // Template 7: Your Original Design (Enhanced)
  {
    name: 'Request HR Email - Standard',
    type: TemplateType.Request_Hr_Mail,
    subject: 'Action Required: Submit Your HR Contact Information',
    body: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <style>
              body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Google Sans', Arial, sans-serif; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; padding: 40px; }
              .icon { margin-bottom: 20px; }
              .header { font-size: 22px; color: #202124; margin-bottom: 15px; }
              .paragraph { color: #5f6368; margin-bottom: 30px; line-height: 1.5; }
              .button { background-color: #1a73e8; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: 500; display: inline-block; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="icon"><img src="https://www.gstatic.com/images/icons/material/system/2x/rate_review_blue_48dp.png" alt="Action icon"></div>
              <h1 class="header">One More Step to Complete Your Profile</h1>
              <p class="paragraph">Hello {{employeeName}},<br>To finalize the verification process, we require the email address of your HR representative. Please click the button below to securely submit this information.</p>
              <a href="{{submissionLink}}" class="button">Submit HR Email</a>
          </div>
      </body>
      </html>
    `,
  },
  // Template 8: Urgent HR Email Request
  {
    name: 'Request HR Email - Urgent',
    type: TemplateType.Request_Hr_Mail,
    subject: 'URGENT: Your Action is Needed to Proceed',
    body: `
      <!DOCTYPE html><html><body style="font-family: Arial, sans-serif; border-left: 5px solid #d9534f; padding: 15px;">
        <h3>Action Required</h3>
        <p>Hello {{employeeName}},</p>
        <p>Your verification is currently on hold pending the submission of your HR contact's email address. Please provide this information immediately to avoid delays.</p>
        <p><a href="{{submissionLink}}">Click here to submit now.</a></p>
      </body></html>
    `,
  },
  // Template 9: Friendly HR Email Request
  {
    name: 'Request HR Email - Friendly',
    type: TemplateType.Request_Hr_Mail,
    subject: 'Just one last thing, {{employeeName}}!',
    body: `
      <!DOCTYPE html><html><body style="font-family: 'Comic Sans MS', cursive, sans-serif;">
        <h2>Hey {{employeeName}}, we're almost there!</h2>
        <p>We just need one little thing to wrap up your verification: your HR's email address. Could you pop it in for us? Thanks a bunch!</p>
        <a href="{{submissionLink}}">Add HR Email</a>
      </body></html>
    `,
  },
];


async function main() {
  console.log(`Start seeding ...`);

  const defaultCompany = await prisma.company.upsert({
    where: { name: 'System Default' },
    update: {},
    create: { name: 'System Default' },
  });
  
  console.log(`Created/found default company with ID: ${defaultCompany.id}`);

  for (const template of templates) {
    const newTemplate = await prisma.emailTemplate.upsert({
      where: { companyId_type: { companyId: defaultCompany.id, type: template.type } },
      update: { subject: template.subject, body: template.body, name: template.name },
      create: { ...template, companyId: defaultCompany.id },
    });
    console.log(`Created/updated template: ${newTemplate.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
s