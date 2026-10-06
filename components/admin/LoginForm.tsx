"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import type { UI } from "@/app/admin/i18n";

const input =
  "mt-1.5 block w-full rounded-lg border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] focus:border-teal focus:ring-3 focus:ring-teal/20";

export default function LoginForm({ ui, configured }: { ui: UI["login"]; configured: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);

  if (!configured) return <p className="mt-6 text-[0.9375rem] leading-relaxed text-steel">{ui.notConfigured}</p>;

  return (
    <form action={action} className="mt-6 grid gap-5">
      <label className="block text-sm font-semibold">
        {ui.password}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className={input}
          aria-invalid={state?.error === "wrong"}
          aria-describedby={state?.error ? "login-error" : undefined}
        />
      </label>
      <label className="block text-sm font-semibold">
        {ui.name}
        <input name="name" autoComplete="name" maxLength={60} className={input} />
        <span className="mt-1 block text-xs font-normal text-steel">{ui.nameHint}</span>
      </label>
      {state?.error && (
        <p id="login-error" role="alert" className="text-sm font-semibold text-red-800">
          {state.error === "wrong" ? ui.wrong : ui.notConfigured}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {ui.submit}
      </button>
    </form>
  );
}
