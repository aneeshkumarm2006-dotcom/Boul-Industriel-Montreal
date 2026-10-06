import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import LangSwitch from "@/components/admin/LangSwitch";
import LoginForm from "@/components/admin/LoginForm";
import { authConfigured, getSession } from "@/lib/cms/session";
import { getUI } from "../lang";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin/");
  const { lang, ui } = await getUI();

  return (
    <main className="grid min-h-svh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <LangSwitch lang={lang} label={ui.otherLang} />
        </div>
        <div className="mt-10 rounded-[1.25rem] border border-line bg-white p-6 sm:p-8">
          <p className="eyebrow text-teal">{ui.appName}</p>
          <h1 className="h3 mt-2 text-[1.75rem]">{ui.login.title}</h1>
          <LoginForm ui={ui.login} configured={authConfigured()} />
        </div>
      </div>
    </main>
  );
}
