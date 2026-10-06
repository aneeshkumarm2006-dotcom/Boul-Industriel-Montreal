// Admin sign-in: one shared password (ADMIN_PASSWORD) and a signed cookie (ADMIN_SESSION_SECRET).
// Cookie value: v1.<expiry>.<password tag>.<name>.<hmac>. The password tag changes with the password,
// so setting a new ADMIN_PASSWORD signs everyone out.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE = 60 * 60 * 24 * 30;
const SECURE = !!process.env.VERCEL || process.env.NODE_ENV === "production";
// __Host- pins the cookie to this exact origin; it needs https, which Vercel always has
export const SESSION_COOKIE = process.env.VERCEL ? "__Host-cms_session" : "cms_session";

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
};
const password = () => {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length >= 12 ? p : null;
};

/** False until both env vars are set (the login page says so instead of accepting anything). */
export const authConfigured = () => !!(secret() && password());

const hmac = (data: string, key: string) => createHmac("sha256", key).update(data).digest("base64url");
const pwTag = (key: string, pw: string) => hmac(`pw:${pw}`, key).slice(0, 16);

export function checkPassword(input: string): boolean {
  const pw = password();
  if (!pw || !secret()) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

function sign(name: string): string {
  const key = secret()!;
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const who = Buffer.from(name.trim().slice(0, 60), "utf8").toString("base64url");
  const body = `v1.${exp}.${pwTag(key, password()!)}.${who}`;
  return `${body}.${hmac(body, key)}`;
}

function verify(value: string | undefined): { name: string } | null {
  const key = secret();
  const pw = password();
  if (!value || !key || !pw) return null;
  const cut = value.lastIndexOf(".");
  if (cut < 0) return null;
  const body = value.slice(0, cut);
  const sig = Buffer.from(value.slice(cut + 1));
  const expected = Buffer.from(hmac(body, key));
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
  const [v, exp, tag, who = ""] = body.split(".");
  if (v !== "v1" || Number(exp) * 1000 < Date.now() || tag !== pwTag(key, pw)) return null;
  return { name: Buffer.from(who, "base64url").toString("utf8") };
}

export async function getSession() {
  return verify((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function isAdmin() {
  return !!(await getSession());
}

/** For admin pages: sends visitors without a session to the login page. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login/");
  return session;
}

/** For server actions: anyone can POST to them, so each one checks the session itself. */
export async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function startSession(name: string) {
  (await cookies()).set(SESSION_COOKIE, sign(name), { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function endSession() {
  (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, secure: SECURE, sameSite: "lax", path: "/", maxAge: 0 });
}
