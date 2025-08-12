import nodemailer from 'nodemailer';
import prisma from '@/app/lib/prisma';
import CryptoJS from 'crypto-js';

// Helper to decrypt the stored password
const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.ENCRYPTION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Sends an email using a specific company's SMTP settings.
 * @param {object} options
 * @param {number} options.companyId - The ID of the company whose settings to use.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The email subject.
 * @param {string} options.html - The HTML content of the email.
 */
export const sendMailWithCompanySmtp = async ({ companyId, to, subject, html }) => {
    // 1. Fetch the company's SMTP settings from the database
    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });

    if (!company || !company.smtpHost || !company.smtpPassword) {
        throw new Error(`SMTP settings for company ID ${companyId} are not configured.`);
    }

    // 2. Decrypt the stored password
    const decryptedPassword = decrypt(company.smtpPassword);

    // 3. Create a Nodemailer transporter with the company's credentials
    const transporter = nodemailer.createTransport({
        host: company.smtpHost,
        port: company.smtpPort,
        secure: company.smtpPort === 465, // `true` for port 465, `false` for others
        auth: {
            user: company.smtpUser,
            pass: decryptedPassword,
        },
    });

    // 4. Define the mail options
    const mailOptions = {
        from: `"${company.name}" <${company.senderEmail}>`,
        to: to,
        subject: subject,
        html: html,
    };

    // 5. Send the email
    return transporter.sendMail(mailOptions);
};