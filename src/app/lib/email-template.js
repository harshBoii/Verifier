// app/lib/email-templates.js

// FUNCTION 1: Your original template for the initial verification request.
export const getVerificationHtml = (Id,company,name,position,exp_id) => {
  // Use template literals (`) to create an HTML string
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Employment Verification Required</title>
        <style>
          /* Global styles */
          body {
            background-color: #f8f8f8;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          }
          /* Main container for the email content */
          .container {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            margin: 20px auto;
          }
          /* Centered heading */
          .heading {
            font-size: 24px;
            font-weight: 500;
            color: #333333;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
          }
          /* Paragraph text */
          .paragraph {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
            margin-bottom: 15px;
          }
          /* Wrapper to center the button */
          .button-wrapper {
            text-align: center;
            margin: 30px 0;
          }
          /* The button itself */
          .button {
            background-color: #2979FF;
            color: white; /* Corrected from black to white */
            padding: 14px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            display: inline-block;
            font-size: 16px;
          }
          /* Footer text */
          .footer {
            color: #999999;
            font-size: 12px;
            margin-top: 30px;
            text-align: center;
          }
          .hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="heading">Employment Verification Required</h1>
          <p class="paragraph">Dear Verifier,</p>
          <p class="paragraph">
            <strong>${name}</strong> has added their experience as a <strong>${position}</strong> in <strong>${company}</strong>. Please verify the details using the following link.
          </p>
          <div class="button-wrapper">
            <a href="https://verifier-phi.vercel.app/review/experience/${exp_id}" class="button">
              Verify Now
            </a>
          </div>
          <p class="paragraph">
            If you don't recognise this request, you can safely ignore this email.
          </p>
          <hr class="hr" />
          <p class="footer">
            You received this email because our user has identified you as a verifier of the organisation.<br />
            &copy; ${new Date().getFullYear()} Demo CRM Innovation Enterprises Private Limited
          </p>
        </div>
      </body>
    </html>
  `;
};


// --- NEW ADDITION ---
// FUNCTION 2: The new template for notifying admin/employee of the result.
export const getVerificationResultHtml = ({ employeeName, verifierComment }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Verification Submission Update</title>
        <style>
          body { font-family: sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: #ffffff; border: 1px solid #ddd; padding: 20px; border-radius: 5px; max-width: 600px; margin: 20px auto; }
          .comment-box { background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verification Result for ${employeeName}</h1>
          <p>The verifier has submitted the following comment regarding the experience details:</p>
          <div class="comment-box">
            <p>${verifierComment || "I approve that the experience mentioned is true to my knowledge."}</p>
          </div>
          <p>Please review this feedback in the main dashboard.</p>
        </div>
      </body>
    </html>
  `;
};

export const getRequestHrEmailHtml = ({ employeeName, submissionLink }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head><title>Action Required: Submit HR Email</title></head>
      <body>
        <div class="container">
          <h1 class="heading">Action Required: Submit HR Email</h1>
          <p class="paragraph">Hello ${employeeName},</p>
          <p class="paragraph">
            To complete your verification process, we need you to provide the email address of your HR representative. Please click the button below to securely submit this information.
          </p>
          <div class="button-wrapper">
            <a href="${submissionLink}" class="button">
              Submit HR Email
            </a>
          </div>
          <p class="paragraph">
            If you did not expect this request, please contact our support team.
          </p>
        </div>
      </body>
    </html>
  `;
};
