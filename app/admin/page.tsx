import Editor from "@/components/admin/Editor";
import { readPublished } from "@/lib/cms/content";
import { requireAdmin } from "@/lib/cms/session";
import { canWrite, storeKind } from "@/lib/cms/store";
import type { Overrides } from "@/lib/cms/types";
import { getUI } from "./lang";

// Photo uploads (sharp) run in this page's server actions
export const maxDuration = 60;

export default async function AdminPage() {
  const session = await requireAdmin();
  const { lang } = await getUI();

  let overrides: Overrides = {};
  let baseVersion: string | null = null;
  let loadError = false;
  try {
    const { id, doc } = await readPublished();
    baseVersion = id;
    overrides = doc?.overrides ?? {};
  } catch (err) {
    // Editing from the code defaults here would overwrite the live content on publish, so publishing is disabled
    console.error("CMS: could not read the published version", err);
    loadError = true;
  }

  return (
    <Editor
      lang={lang}
      publishedOverrides={overrides}
      baseVersion={baseVersion}
      writable={canWrite()}
      store={storeKind()}
      userName={session.name}
      loadError={loadError}
    />
  );
}
