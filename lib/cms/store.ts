// Where published versions, preview drafts and uploaded photos live.
//   On Vercel: the project's Blob store (public). Versions are never overwritten — each publish is a new
//   file — so the CDN can't serve a stale copy, and the files double as the history.
//   Locally: .cms-data/ and public/_cms/ (gitignored), so a laptop never writes to the live site.
import "server-only";
import { del, get, list, put } from "@vercel/blob";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { ContentDoc, VersionRef } from "./types";

export type StoreKind = "blob" | "fs" | "none";

const VERSIONS = "cms/versions/";
const DRAFTS = "cms/drafts/";
const MEDIA = "cms/media/";
const YEAR = 60 * 60 * 24 * 365;
const FS_DATA = path.join(process.cwd(), ".cms-data");
const FS_MEDIA = path.join(process.cwd(), "public", "_cms", "media");
const DOC_ID = /^cms\/(versions|drafts)\/[A-Za-z0-9_-]+\.json$/;

/** Blob on Vercel (or when CMS_STORE=blob), the local folder otherwise; "none" when Blob isn't connected yet. */
export function storeKind(): StoreKind {
  if (!process.env.VERCEL && process.env.CMS_STORE !== "blob") return "fs";
  return process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? "blob" : "none";
}

/** Only production writes to Blob: preview deployments share the store and stay read-only. */
export function canWrite(): boolean {
  const kind = storeKind();
  if (kind === "fs") return true;
  return kind === "blob" && (process.env.VERCEL_ENV === "production" || process.env.CMS_ALLOW_WRITES === "1");
}

function assertWritable() {
  if (!canWrite()) throw new Error(storeKind() === "none" ? "STORE_NOT_CONFIGURED" : "READ_ONLY");
}

/** Sortable and filesystem-safe: 20261006T120000123Z */
function stamp(d = new Date()) {
  return d.toISOString().replace(/[-:.]/g, "");
}

function stampToIso(name: string): string {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\d{3})Z/.exec(name);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.${m[7]}Z` : new Date(0).toISOString();
}

const fsPath = (id: string) => path.join(FS_DATA, ...id.slice("cms/".length).split("/"));

async function listBlobs(prefix: string) {
  const out: { pathname: string; url: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    out.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function listDocs(prefix: string): Promise<VersionRef[]> {
  const kind = storeKind();
  let refs: VersionRef[] = [];
  if (kind === "blob") {
    refs = (await listBlobs(prefix)).map((b) => ({ id: b.pathname, savedAt: stampToIso(b.pathname.slice(prefix.length)), url: b.url }));
  } else if (kind === "fs") {
    const dir = path.join(FS_DATA, prefix.slice("cms/".length));
    const files = await readdir(dir).catch(() => [] as string[]);
    refs = files.filter((f) => f.endsWith(".json")).map((f) => ({ id: prefix + f, savedAt: stampToIso(f), url: "" }));
  }
  return refs.sort((a, b) => (a.id < b.id ? 1 : -1)); // newest first
}

export const listVersions = () => listDocs(VERSIONS);

/** Reads a version or a draft by id. Null when it doesn't exist. */
export async function readDoc(id: string): Promise<ContentDoc | null> {
  if (!DOC_ID.test(id)) return null;
  if (storeKind() === "blob") {
    const res = await get(id, { access: "public" });
    if (!res || res.statusCode !== 200) return null;
    return JSON.parse(await new Response(res.stream).text()) as ContentDoc;
  }
  if (storeKind() === "fs") {
    const text = await readFile(fsPath(id), "utf8").catch(() => null);
    return text === null ? null : (JSON.parse(text) as ContentDoc);
  }
  return null;
}

async function putDoc(prefix: string, doc: ContentDoc): Promise<VersionRef> {
  assertWritable();
  const body = JSON.stringify(doc);
  if (storeKind() === "blob") {
    // The random suffix keeps the URL unguessable: the document lists the inboxes that receive leads
    const res = await put(`${prefix}${stamp()}.json`, body, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
      cacheControlMaxAge: YEAR,
    });
    return { id: res.pathname, savedAt: doc.savedAt, url: res.url };
  }
  const id = `${prefix}${stamp()}-${randomBytes(6).toString("base64url")}.json`;
  await mkdir(path.dirname(fsPath(id)), { recursive: true });
  await writeFile(fsPath(id), body);
  return { id, savedAt: doc.savedAt, url: "" };
}

export const putVersion = (doc: ContentDoc) => putDoc(VERSIONS, doc);
export const putDraft = (doc: ContentDoc) => putDoc(DRAFTS, doc);

async function removeDocs(refs: VersionRef[]) {
  if (!refs.length) return;
  if (storeKind() === "blob") await del(refs.map((r) => r.url));
  else if (storeKind() === "fs") await Promise.all(refs.map((r) => rm(fsPath(r.id), { force: true })));
}

/** Keeps the newest `keep` versions and drops drafts older than a day. */
export async function prune(keep = 30) {
  if (!canWrite()) return;
  const versions = await listVersions();
  await removeDocs(versions.slice(keep));
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await removeDocs((await listDocs(DRAFTS)).filter((d) => d.savedAt < dayAgo));
}

/** Stores one photo rendition and returns its URL. */
export async function putMedia(id: string, file: string, body: Buffer, contentType: string): Promise<string> {
  assertWritable();
  if (storeKind() === "blob") {
    const res = await put(`${MEDIA}${id}/${file}`, body, { access: "public", addRandomSuffix: false, contentType, cacheControlMaxAge: YEAR });
    return res.url;
  }
  await mkdir(path.join(FS_MEDIA, id), { recursive: true });
  await writeFile(path.join(FS_MEDIA, id, file), body);
  return `/_cms/media/${id}/${file}`;
}
