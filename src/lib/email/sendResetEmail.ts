import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: "nepallover2075@gmail.com",
    to,
    subject: "Reset Your Password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link is valid for 15 minutes.</p>
    `
  });
}
