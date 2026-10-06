import "server-only";
import { cache } from "react";
import { cookies, draftMode } from "next/headers";
import { effective, toSiteContent } from "./merge";
import { listVersions, readDoc } from "./store";
import { isAdmin } from "./session";
import type { ContactInfo, ContentDoc, SiteContent } from "./types";

/** Holds the id of the draft (or past version) shown while the admin previews. */
export const PREVIEW_COOKIE = "cms_preview";

export interface LoadedContent extends SiteContent {
  preview: boolean;
}

/** The latest published document (null before the first publish). Throws when the store can't be read. */
export async function readPublished(): Promise<{ id: string | null; doc: ContentDoc | null }> {
  const latest = (await listVersions())[0];
  if (!latest) return { id: null, doc: null };
  return { id: latest.id, doc: await readDoc(latest.id) };
}

async function publishedOverrides() {
  try {
    return (await readPublished()).doc?.overrides;
  } catch (err) {
    // Throwing keeps the last good page (ISR) or fails the build (Vercel keeps the previous deployment).
    // CMS_ALLOW_DEFAULTS_ON_ERROR=1 is the escape hatch if the store is ever suspended.
    if (process.env.CMS_ALLOW_DEFAULTS_ON_ERROR === "1") {
      console.error("CMS: store unreadable, rendering the code defaults", err);
      return undefined;
    }
    throw err;
  }
}

/**
 * The content for the current request: the published version, or the draft being previewed.
 * cookies() is only read in draft mode, so /fr/ and /en/ stay static otherwise.
 */
export const getSiteContent = cache(async (): Promise<LoadedContent> => {
  if ((await draftMode()).isEnabled) {
    const id = (await cookies()).get(PREVIEW_COOKIE)?.value;
    if (id && (await isAdmin())) {
      const doc = await readDoc(id).catch(() => null);
      if (doc) return { ...toSiteContent(effective(doc.overrides)), preview: true };
    }
  }
  return { ...toSiteContent(effective(await publishedOverrides())), preview: false };
});

/** Contact settings for the form handler; falls back to the code defaults so a lead is never lost. */
export async function getLeadSettings(): Promise<ContactInfo> {
  try {
    return toSiteContent(effective((await readPublished()).doc?.overrides)).contact;
  } catch (err) {
    console.error("CMS: store unreadable, sending the lead to the default inbox", err);
    return toSiteContent(effective(null)).contact;
  }
}
