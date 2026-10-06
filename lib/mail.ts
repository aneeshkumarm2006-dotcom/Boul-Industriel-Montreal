import "server-only";
import nodemailer from "nodemailer";

// Mail goes out from the Davnoot automations mailbox.
// Env (Vercel → Settings → Environment Variables):
//   SMTP_USER  automations@davnoot.com
//   SMTP_PASS  Google app password for that account (16 characters, no spaces)
export function getMailer() {
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return null;
  return {
    from: SMTP_USER,
    transport: nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
  };
}

export const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
