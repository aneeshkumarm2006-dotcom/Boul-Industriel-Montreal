"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/app/admin/actions";
import { BUILTIN_PHOTOS, builtinPhoto } from "@/lib/cms/defaults";
import { deepEqual } from "@/lib/cms/merge";
import { PHOTO_LIMITS } from "@/lib/cms/registry";
import type { Photo } from "@/lib/cms/types";
import { fill } from "@/lib/format";
import {
  Badge,
  BiInputs,
  CloseIcon,
  DownIcon,
  fieldId,
  IconButton,
  inputBase,
  IssueList,
  PlusIcon,
  SectionCard,
  smallBtn,
  UpIcon,
  useEditor,
} from "./ui";

type GalleryKey = "m:gallery" | "m:interior";
const MAX_EDGE = 2400; // longest side sent to the server; renditions top out at 1800 px
const MAX_BYTES = 3.8 * 1024 * 1024; // under the 4 MB server-action limit

/** Decodes the photo in the browser and re-encodes it as a JPEG of at most 2400 px. */
async function downscale(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(/hei[cf]/i.test(`${file.type} ${file.name}`) ? "HEIC" : "NOT_IMAGE");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // transparent PNGs get a white background instead of black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [0.88, 0.8, 0.7]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= MAX_BYTES) return blob;
  }
  throw new Error("TOO_BIG");
}

function GalleryEditor({ k, title, hint }: { k: GalleryKey; title: string; hint: string }) {
  const { ui, lang, values, published, set, issues } = useEditor();
  const p = ui.photos;
  const photos = values[k] as Photo[];
  const latest = useRef(photos);
  latest.current = photos;
  const fileRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<{ tone: "info" | "error"; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const limits = PHOTO_LIMITS[k];
  const changed = !deepEqual(photos, published[k]);
  const keyIssues = issues.get(k);

  const update = (next: Photo[]) => set(k, next);
  const move = (i: number, d: number) => {
    const next = [...photos];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    update(next);
  };

  async function upload(files: File[]) {
    setBusy(true);
    const errors: string[] = [];
    for (const file of files) {
      if (latest.current.length >= limits.max) break;
      setMessages([{ tone: "info", text: fill(p.uploading, { name: file.name }) }]);
      try {
        const fd = new FormData();
        fd.append("file", await downscale(file), "photo.jpg");
        const res = await uploadPhoto(fd);
        if (res.ok) set(k, [...latest.current, res.photo]);
        else errors.push(res.error === "UNAUTHORIZED" ? ui.sessionExpired : res.error === "READ_ONLY" ? ui.readOnlyError : fill(p.uploadFailed, { name: file.name }));
      } catch (err) {
        const code = err instanceof Error ? err.message : "";
        errors.push(fill(code === "HEIC" ? p.heic : code === "NOT_IMAGE" ? p.notImage : p.uploadFailed, { name: file.name }));
      }
    }
    setMessages(errors.map((text) => ({ tone: "error", text })));
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const available = BUILTIN_PHOTOS.filter((name) => !photos.some((ph) => ph.key === name));

  return (
    <SectionCard
      id={fieldId(k)}
      title={title}
      hint={hint}
      aside={changed && <Badge tone="unpublished">{ui.unpublished}</Badge>}
    >
      <IssueList ui={ui} issues={keyIssues?.filter((i) => i.index === undefined)} />
      {photos.length === 0 && <p className="text-[0.9375rem] text-steel">{p.empty}</p>}
      <ol className="grid gap-4 md:grid-cols-2">
        {photos.map((photo, i) => (
          <li key={photo.key} className="flex flex-col gap-3 rounded-xl border border-line bg-paper/60 p-3">
            <div className="relative overflow-hidden rounded-lg bg-paper-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${photo.base}${photo.widths[0]}.webp`}
                alt=""
                width={photo.width}
                height={photo.height}
                className="aspect-[3/2] h-auto w-full object-cover"
                style={{ backgroundImage: `url(${photo.blur})`, backgroundSize: "cover" }}
              />
              <span className="mono absolute left-2 top-2 rounded bg-ink/75 px-1.5 py-0.5 text-xs text-white">{i + 1}</span>
              <span className="absolute right-1 top-1 flex rounded-lg bg-white/95 shadow-sm">
                <IconButton label={ui.moveUp} onClick={() => move(i, -1)} disabled={i === 0}>
                  <UpIcon />
                </IconButton>
                <IconButton label={ui.moveDown} onClick={() => move(i, 1)} disabled={i === photos.length - 1}>
                  <DownIcon />
                </IconButton>
                <IconButton
                  label={ui.remove}
                  tone="danger"
                  disabled={photos.length <= limits.min}
                  onClick={() => update(photos.filter((_, n) => n !== i))}
                >
                  <CloseIcon />
                </IconButton>
              </span>
            </div>
            <BiInputs
              ui={ui}
              value={photo.alt}
              index={i}
              issues={keyIssues}
              label={`${p.altFr.replace(" (FR)", "")} ${i + 1}`}
              placeholder={{ fr: p.altFr, en: p.altEn }}
              stack
              onChange={(alt) => update(photos.map((ph, n) => (n === i ? { ...ph, alt } : ph)))}
            />
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className={`btn btn-primary !min-h-11 cursor-pointer text-sm ${busy || photos.length >= limits.max ? "pointer-events-none opacity-50" : ""}`}>
          <PlusIcon />
          {p.upload}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => e.target.files?.length && upload(Array.from(e.target.files))}
          />
        </label>
        {available.length > 0 && photos.length < limits.max && (
          <select
            value=""
            aria-label={p.builtin}
            onChange={(e) => {
              const photo = builtinPhoto(e.target.value);
              if (photo) update([...photos, photo]);
            }}
            className={`${inputBase} select-chevron pr-10`}
          >
            <option value="">{p.builtin}…</option>
            {available.map((name) => (
              <option key={name} value={name}>
                {builtinPhoto(name)?.alt[lang] || name}
              </option>
            ))}
          </select>
        )}
        <p className="text-sm text-steel">{p.uploadHint}</p>
      </div>
      {messages.length > 0 && (
        <ul className="mt-3 grid gap-1" role="status">
          {messages.map((m, n) => (
            <li key={n} className={`text-sm font-semibold ${m.tone === "error" ? "text-red-800" : "text-steel"}`}>
              {m.text}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export default function PhotosTab() {
  const { ui } = useEditor();
  return (
    <div className="grid gap-6">
      <GalleryEditor k="m:gallery" title={ui.photos.exterior} hint={ui.photos.exteriorHint} />
      <GalleryEditor k="m:interior" title={ui.photos.interior} hint={ui.photos.interiorHint} />
      <p className="px-1 text-sm text-steel">{ui.photos.locked}</p>
    </div>
  );
}
