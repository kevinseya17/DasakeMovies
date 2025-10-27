import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// configure SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

/**
 * Sends an email using the SendGrid API.
 * 
 * This function composes and dispatches an email message with the specified
 * recipient, subject, and HTML content. The sender information (email and name)
 * is retrieved from environment variables to ensure security and consistency.
 * 
 * Parameters:
 * - to: the recipient's email address.
 * - subject: the subject line of the email.
 * - html: the email body in HTML format.
 * 
 * Returns:
 * - the SendGrid response containing information about the sent message.
 * 
 * Throws:
 * - an error if the email fails to send.
 * 
 * Notes:
 * - the sender email is defined by the environment variable EMAIL_FROM.
 * - the display name for the sender is "Soporte DasakeMovies".
 * - all errors are logged before being rethrown.
 */
export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM!, // verified sender email in SendGrid
        name: "Soporte DasakeMovies",   // sender display name
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
