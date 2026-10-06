"use server";

// Kept apart from ./actions so the public page doesn't bundle the admin's upload and mail code
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { PREVIEW_COOKIE } from "@/lib/cms/content";

/** Used by the banner the site shows during a preview; harmless for anyone, so no session check. */
export async function exitPreview(lang: string) {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  redirect(`/${lang === "en" ? "en" : "fr"}/`);
}
