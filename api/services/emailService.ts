import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// set API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

/**
 * sendMail
 * 
 * Sends an email using SendGrid.
 * 
 * @param to - recipient email address
 * @param subject - email subject
 * @param html - email content in HTML format
 * @returns info - information about the sent email
 * @throws error if sending fails
 * 
 * Notes:
 * - "from" email is set from environment variable EMAIL_FROM
 * - sender name is "Soporte DasakeMovies"
 */
export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM!, // verified sender in SendGrid
        name: "Soporte DasakeMovies",   // display name
      },
      subject,
      html,
    };

    const info = await sgMail.send(msg);
    console.log("📧 Email sent to:", to);
    return info;
  } catch (err) {
    console.error("Error sending email via SendGrid:", err);
    throw err;
  }
};
