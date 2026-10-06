import { project } from "@/content/project";
import { getLeadSettings } from "@/lib/cms/content";
import { escapeHtml as esc, getMailer } from "@/lib/mail";

// Sends each contact-form submission to the inboxes set in /admin (Coordonnées), from the Davnoot
// automations mailbox (SMTP_USER / SMTP_PASS, see lib/mail.ts).
const MAX = 2000;

export async function POST(request: Request) {
  const mailer = getMailer();
  if (!mailer) {
    console.error("Contact form: SMTP_USER / SMTP_PASS not set");
    return Response.json({ ok: false }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const get = (k: string) => String(body[k] ?? "").trim().slice(0, MAX);

  if (get("website")) return Response.json({ ok: true }); // honeypot filled: a bot
  const name = get("name");
  const email = get("email");
  const phone = get("phone");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || phone.replace(/\D/g, "").length < 10) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const rows: [string, string][] = (
    [
      ["Nom / Name", name],
      ["Entreprise / Company", get("company")],
      ["Courriel / Email", email],
      ["Téléphone / Phone", phone],
      ["Unité / Unit", get("unit")],
      ["Demande / Request", get("intent")],
      ["Message", get("message")],
      ["Langue / Language", get("language")],
      ["Page", get("page")],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const html =
    '<table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd;background:#f5f5f5;font-weight:bold">${esc(k)}</td>` +
          `<td style="border:1px solid #ddd">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
      )
      .join("") +
    "</table>";

  // Read only after validation, so junk requests never touch the store
  const { inboxes } = await getLeadSettings();

  try {
    await mailer.transport.sendMail({
      from: { name: project.company, address: mailer.from },
      to: inboxes,
      replyTo: { name, address: email },
      subject: `Nouvelle demande – ${name}${get("unit") ? ` – ${get("unit")}` : ""}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact form: send failed", err);
    return Response.json({ ok: false }, { status: 502 });
  }
}
