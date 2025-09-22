import nodemailer from "nodemailer";

/**
 * Sends an email using the platform's default/global SMTP settings.
 * Use this for external/public companies without internal SMTP.
 *
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 */
export const sendPublicMail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error("Global SMTP settings are not configured in environment variables.");
  }

  // 1. Create transporter from global env vars
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for 587/25
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2. Mail options
  const mailOptions = {
    from: `"Demo CRM" <${process.env.SMTP_USER}>`, // Or replace with your brand email
    to,
    subject,
    html,
  };

  // 3. Send mail
  return transporter.sendMail(mailOptions);
};
