"use server";

// Every action re-checks the session: a server action is a public POST endpoint, whatever the UI shows.
import { cookies, draftMode } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { PREVIEW_COOKIE } from "@/lib/cms/content";
import { processUpload } from "@/lib/cms/media";
import { diff, effective, EMAIL_RE, validate, withOverrides, type Issue } from "@/lib/cms/merge";
import { MAX_INBOXES } from "@/lib/cms/registry";
import { assertAdmin, authConfigured, checkPassword, endSession, startSession } from "@/lib/cms/session";
import { canWrite, listVersions, prune, putDraft, putVersion, readDoc, storeKind } from "@/lib/cms/store";
import type { ContentDoc, Overrides, Photo } from "@/lib/cms/types";
import { getMailer } from "@/lib/mail";
import { project } from "@/content/project";
import { ADMIN_LANG_COOKIE, type AdminLang } from "./i18n";

type Failure = {
  ok: false;
  error: "UNAUTHORIZED" | "READ_ONLY" | "STORE_NOT_CONFIGURED" | "INVALID" | "CONFLICT" | "STORE_ERROR" | "NOT_FOUND" | "UPLOAD_FAILED" | "MAIL_FAILED";
  issues?: Issue[];
};

const SECURE = !!process.env.VERCEL || process.env.NODE_ENV === "production";
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

async function session(): Promise<{ name: string } | Failure> {
  try {
    return await assertAdmin();
  } catch {
    return { ok: false, error: "UNAUTHORIZED" };
  }
}

function writeFailure(): Failure | null {
  if (canWrite()) return null;
  return { ok: false, error: storeKind() === "none" ? "STORE_NOT_CONFIGURED" : "READ_ONLY" };
}

/** The store's list can trail a write by a moment; wait until the new version is the one pages will read. */
async function waitUntilListed(id: string) {
  for (let i = 0; i < 12; i++) {
    if ((await listVersions()).some((v) => v.id === id)) return;
    await new Promise((r) => setTimeout(r, 250));
  }
}

async function goLive(doc: ContentDoc) {
  const ref = await putVersion(doc);
  await waitUntilListed(ref.id);
  revalidatePath("/[lang]", "layout");
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  after(() => prune().catch((err) => console.error("CMS: pruning old versions failed", err)));
  return ref;
}

// ---------- Session ----------

export async function login(_prev: unknown, formData: FormData): Promise<{ error: "wrong" | "notConfigured" } | undefined> {
  if (!authConfigured()) return { error: "notConfigured" };
  if (!checkPassword(String(formData.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 1000)); // slows down guessing
    return { error: "wrong" };
  }
  await startSession(String(formData.get("name") ?? ""));
  redirect("/admin/");
}

export async function logout() {
  await endSession();
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  redirect("/admin/login/");
}

export async function setAdminLang(lang: AdminLang) {
  (await cookies()).set(ADMIN_LANG_COOKIE, lang === "en" ? "en" : "fr", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

// ---------- Publishing ----------

export async function publish(input: {
  overrides: Overrides;
  baseVersion: string | null;
  note?: string;
  force?: boolean;
}): Promise<{ ok: true; version: string } | Failure> {
  const who = await session();
  if ("ok" in who) return who;
  const blocked = writeFailure();
  if (blocked) return blocked;

  const values = withOverrides(isObj(input?.overrides) ? input.overrides : {});
  const errors = validate(values).filter((i) => i.level === "error");
  if (errors.length) return { ok: false, error: "INVALID", issues: errors };

  try {
    const latest = (await listVersions())[0]?.id ?? null;
    if (!input.force && latest !== input.baseVersion) return { ok: false, error: "CONFLICT" };
    const ref = await goLive({
      schema: 1,
      overrides: diff(values),
      basedOn: latest,
      savedAt: new Date().toISOString(),
      savedBy: who.name || undefined,
      note: typeof input.note === "string" && input.note.trim() ? input.note.trim().slice(0, 200) : undefined,
    });
    return { ok: true, version: ref.id };
  } catch (err) {
    console.error("CMS: publish failed", err);
    return { ok: false, error: "STORE_ERROR" };
  }
}

/** Publishes an older version again, as a new version (the history keeps everything in between). */
export async function restore(id: string): Promise<{ ok: true } | Failure> {
  const who = await session();
  if ("ok" in who) return who;
  const blocked = writeFailure();
  if (blocked) return blocked;
  if (typeof id !== "string" || !id.startsWith("cms/versions/")) return { ok: false, error: "NOT_FOUND" };

  try {
    const old = await readDoc(id);
    if (!old) return { ok: false, error: "NOT_FOUND" };
    await goLive({
      schema: 1,
      // effective() drops anything an older version holds that the current code no longer accepts
      overrides: diff(effective(old.overrides)),
      basedOn: (await listVersions())[0]?.id ?? null,
      savedAt: new Date().toISOString(),
      savedBy: who.name || undefined,
      restoredFrom: old.savedAt,
    });
    return { ok: true };
  } catch (err) {
    console.error("CMS: restore failed", err);
    return { ok: false, error: "STORE_ERROR" };
  }
}

// ---------- Preview (draft mode) ----------

async function startPreview(id: string, lang: string) {
  (await draftMode()).enable();
  (await cookies()).set(PREVIEW_COOKIE, id, { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/" });
  return { ok: true as const, url: `/${lang === "en" ? "en" : "fr"}/` };
}

/** Saves the editor's current state as a draft and turns preview on for this browser. */
export async function preview(input: { overrides: Overrides; baseVersion: string | null; lang: string }): Promise<{ ok: true; url: string } | Failure> {
  const who = await session();
  if ("ok" in who) return who;
  const blocked = writeFailure();
  if (blocked) return blocked;
  try {
    const values = withOverrides(isObj(input?.overrides) ? input.overrides : {});
    const ref = await putDraft({
      schema: 1,
      overrides: diff(values),
      basedOn: input.baseVersion,
      savedAt: new Date().toISOString(),
      savedBy: who.name || undefined,
    });
    return await startPreview(ref.id, input.lang);
  } catch (err) {
    console.error("CMS: preview failed", err);
    return { ok: false, error: "STORE_ERROR" };
  }
}

/** Shows a past version on the site, for this browser only. */
export async function previewVersion(id: string, lang: string): Promise<{ ok: true; url: string } | Failure> {
  const who = await session();
  if ("ok" in who) return who;
  if (typeof id !== "string" || !id.startsWith("cms/versions/") || !(await readDoc(id).catch(() => null))) {
    return { ok: false, error: "NOT_FOUND" };
  }
  return startPreview(id, lang);
}

// ---------- Photos ----------

const MAX_UPLOAD = 3.9 * 1024 * 1024;

export async function uploadPhoto(formData: FormData): Promise<{ ok: true; photo: Photo } | Failure> {
  const who = await session();
  if ("ok" in who) return who;
  const blocked = writeFailure();
  if (blocked) return blocked;
  const file = formData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > MAX_UPLOAD) return { ok: false, error: "INVALID" };
  try {
    const photo = await processUpload(Buffer.from(await file.arrayBuffer()));
    return { ok: true, photo: { ...photo, alt: { fr: "", en: "" } } };
  } catch (err) {
    console.error("CMS: photo upload failed", err);
    return { ok: false, error: "UPLOAD_FAILED" };
  }
}

// ---------- Contact ----------

/** Sends a test message to the inboxes typed in the editor (published or not). */
export async function sendTestEmail(inboxes: string[]): Promise<{ ok: true } | Failure> {
  const who = await session();
  if ("ok" in who) return who;
  const to = Array.isArray(inboxes) ? inboxes.map((e) => String(e).trim()) : [];
  if (!to.length || to.length > MAX_INBOXES || !to.every((e) => EMAIL_RE.test(e))) return { ok: false, error: "INVALID" };
  const mailer = getMailer();
  if (!mailer) return { ok: false, error: "MAIL_FAILED" };
  try {
    await mailer.transport.sendMail({
      from: { name: project.company, address: mailer.from },
      to,
      subject: "Test : formulaire de contact du site / contact form test",
      text:
        "Ce courriel test confirme que les demandes envoyées depuis le site arriveront à cette adresse.\n\n" +
        "This test email confirms that requests sent from the site will reach this address.",
    });
    return { ok: true };
  } catch (err) {
    console.error("CMS: test email failed", err);
    return { ok: false, error: "MAIL_FAILED" };
  }
}
