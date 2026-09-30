"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/fr";
import { UNIT_SELECT } from "@/lib/unit-events";

type Strings = Dictionary["contact"];
type Intent = keyof Strings["intents"];
type Errors = Partial<Record<"name" | "email" | "phone", string>>;
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const field =
  "mt-1.5 block w-full rounded-lg border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-steel/60 focus:border-teal focus:ring-3 focus:ring-teal/20 aria-[invalid=true]:border-red-700 aria-[invalid=true]:ring-red-700/15";

export default function ContactForm({
  s,
  units,
  endpoint,
  email,
  phoneDisplay,
  lang,
}: {
  s: Strings;
  units: { id: string; label: string }[];
  endpoint: string;
  email: string;
  phoneDisplay: string;
  lang: string;
}) {
  const [unit, setUnit] = useState("");
  const [intent, setIntent] = useState<Intent>("prices");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [firstName, setFirstName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Prefill from the plan, the civic plates and the "get pricing" links
  useEffect(() => {
    const onUnit = (e: Event) => {
      setUnit((e as CustomEvent<string>).detail);
      setIntent("prices");
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-intent]");
      if (el?.dataset.intent && el.dataset.intent in s.intents) setIntent(el.dataset.intent as Intent);
    };
    window.addEventListener(UNIT_SELECT, onUnit);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener(UNIT_SELECT, onUnit);
      document.removeEventListener("click", onClick);
    };
  }, [s.intents]);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    if (!String(data.get("name")).trim()) e.name = s.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.get("email")).trim())) e.email = s.errors.email;
    if (String(data.get("phone")).replace(/\D/g, "").replace(/^1/, "").length !== 10) e.phone = s.errors.phone;
    return e;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e = validate(data);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (String(data.get("website"))) return; // honeypot filled: a bot

    const unitLabel = units.find((u) => u.id === data.get("unit"))?.label ?? s.fields.anyUnit;
    const payload = {
      name: String(data.get("name")).trim(),
      company: String(data.get("company") ?? "").trim(),
      email: String(data.get("email")).trim(),
      phone: String(data.get("phone")).trim(),
      unit: unitLabel,
      intent: s.intents[intent],
      message: String(data.get("message") ?? "").trim(),
      language: lang,
      page: window.location.href,
    };
    setFirstName(payload.name.split(/\s+/)[0]);

    if (endpoint) {
      setStatus("sending");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const out = await res.json().catch(() => ({ ok: res.ok }));
        setStatus(res.ok && out.ok !== false ? "sent" : "error");
      } catch {
        setStatus("error");
      }
      return;
    }

    if (email) {
      const body = [
        `${s.fields.name}: ${payload.name}`,
        payload.company && `${s.fields.company}: ${payload.company}`,
        `${s.fields.email}: ${payload.email}`,
        `${s.fields.phone}: ${payload.phone}`,
        `${s.fields.unit}: ${payload.unit}`,
        `${s.fields.intent}: ${payload.intent}`,
        payload.message && `\n${payload.message}`,
      ]
        .filter(Boolean)
        .join("\n");
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(s.mailSubject)}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
      return;
    }

    // No endpoint configured yet (preview build): keep the flow testable end to end
    console.warn("Contact form: set NEXT_PUBLIC_FORM_ENDPOINT to deliver requests.", payload);
    setStatus("sent");
  }

  if (status === "sent" || status === "mailto") {
    return (
      <div role="status" className="rounded-[1.25rem] bg-paper p-8 text-ink sm:p-10">
        <p className="h2 !text-[2rem]">{s.successTitle}</p>
        <p className="lead mt-3 text-steel">
          {status === "mailto" ? s.mailtoNote : s.success.replace("{name}", firstName)}
        </p>
        <p className="mt-6 border-t border-line pt-5 text-[0.9375rem] text-steel">
          {s.faster}{" "}
          <a href={`tel:+1${phoneDisplay.replace(/\D/g, "")}`} className="mono font-semibold text-ink underline decoration-teal/40 underline-offset-4 hover:decoration-teal">
            {phoneDisplay}
          </a>
        </p>
      </div>
    );
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-sm font-semibold text-red-800">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 rounded-[1.25rem] bg-paper p-6 text-ink sm:grid-cols-2 sm:p-9">
      <label className="block text-sm font-semibold">
        {s.fields.name}
        <input
          name="name"
          autoComplete="name"
          className={field}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {err("name")}
      </label>
      <label className="block text-sm font-semibold">
        {s.fields.company}
        <input name="company" autoComplete="organization" className={field} />
      </label>
      <label className="block text-sm font-semibold">
        {s.fields.email}
        <input
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className={field}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {err("email")}
      </label>
      <label className="block text-sm font-semibold">
        {s.fields.phone}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          className={field}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {err("phone")}
      </label>
      <label className="block text-sm font-semibold sm:col-span-2">
        {s.fields.unit}
        <select name="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className={`${field} select-chevron pr-10`}>
          <option value="">{s.fields.anyUnit}</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-semibold">{s.fields.intent}</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg border border-line bg-white p-1">
          {(Object.keys(s.intents) as Intent[]).map((k) => (
            <label
              key={k}
              className={`cursor-pointer rounded-md px-2 py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-teal ${
                intent === k ? "bg-slate text-white" : "text-steel hover:bg-paper-2"
              }`}
            >
              <input type="radio" name="intent" value={k} checked={intent === k} onChange={() => setIntent(k)} className="sr-only" />
              {s.intents[k]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-semibold sm:col-span-2">
        {s.fields.message}
        <textarea name="message" rows={3} className={field} />
      </label>
      {/* Honeypot: hidden from people, tempting for bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-steel">{s.consent}</p>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">
          {status === "sending" ? s.sending : s.submit}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm font-semibold text-red-800 sm:col-span-2">
          {s.sendError.replace("{phone}", phoneDisplay)}
        </p>
      )}
    </form>
  );
}
