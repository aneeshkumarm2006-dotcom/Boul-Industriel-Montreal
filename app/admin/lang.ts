import "server-only";
import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, UI_STRINGS, type AdminLang } from "./i18n";

export async function getAdminLang(): Promise<AdminLang> {
  return (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "en" ? "en" : "fr";
}

export async function getUI() {
  const lang = await getAdminLang();
  return { lang, ui: UI_STRINGS[lang] };
}
