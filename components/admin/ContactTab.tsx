"use client";

import { useEffect, useState } from "react";
import { sendTestEmail } from "@/app/admin/actions";
import { deepEqual, EMAIL_RE, formatPhone, normalizePhone } from "@/lib/cms/merge";
import { MAX_INBOXES } from "@/lib/cms/registry";
import { fill } from "@/lib/format";
import { Badge, CloseIcon, fieldId, IconButton, inputClass, IssueList, PlusIcon, SectionCard, smallBtn, useEditor } from "./ui";

function Changed({ k }: { k: string }) {
  const { ui, values, published } = useEditor();
  return deepEqual(values[k], published[k]) ? null : <Badge tone="unpublished">{ui.unpublished}</Badge>;
}

export default function ContactTab() {
  const { ui, values, set, issues } = useEditor();
  const c = ui.contact;
  const phone = values["p:phone"] as string;
  const email = values["p:email"] as string;
  const inboxes = values["p:leadInboxes"] as string[];

  // The phone field keeps what the client types; the stored value is the normalized +1 number
  const [phoneText, setPhoneText] = useState(() => formatPhone(phone));
  useEffect(() => {
    if (normalizePhone(phoneText) !== phone) setPhoneText(formatPhone(phone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const [test, setTest] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  async function sendTest() {
    const to = inboxes.map((e) => e.trim()).filter(Boolean);
    if (!to.length || !to.every((e) => EMAIL_RE.test(e))) return setTest({ tone: "error", text: c.testInvalid });
    setTesting(true);
    setTest(null);
    try {
      const res = await sendTestEmail(to);
      setTest(
        res.ok
          ? { tone: "ok", text: fill(c.testSent, { to: to.join(", ") }) }
          : { tone: "error", text: res.error === "UNAUTHORIZED" ? ui.sessionExpired : c.testFailed },
      );
    } catch {
      setTest({ tone: "error", text: c.testFailed });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <SectionCard title={c.title}>
        <div className="grid gap-6 md:grid-cols-2">
          <div id={fieldId("p:phone")} className="scroll-mt-40">
            <label className="flex items-center gap-2 text-[0.9375rem] font-semibold" htmlFor="cms-phone">
              {c.phone} <Changed k="p:phone" />
            </label>
            <p className="mb-2 text-sm text-steel">{c.phoneHint}</p>
            <input
              id="cms-phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={phoneText}
              aria-invalid={!!issues.get("p:phone")?.length}
              onChange={(e) => {
                setPhoneText(e.target.value);
                set("p:phone", normalizePhone(e.target.value) ?? e.target.value);
              }}
              onBlur={() => normalizePhone(phoneText) && setPhoneText(formatPhone(normalizePhone(phoneText)!))}
              className={inputClass}
            />
            <IssueList ui={ui} issues={issues.get("p:phone")} />
          </div>
          <div id={fieldId("p:email")} className="scroll-mt-40">
            <label className="flex items-center gap-2 text-[0.9375rem] font-semibold" htmlFor="cms-email">
              {c.email} <Changed k="p:email" />
            </label>
            <p className="mb-2 text-sm text-steel">{c.emailHint}</p>
            <input
              id="cms-email"
              type="email"
              inputMode="email"
              value={email}
              aria-invalid={!!issues.get("p:email")?.length}
              onChange={(e) => set("p:email", e.target.value.trim())}
              className={inputClass}
            />
            <IssueList ui={ui} issues={issues.get("p:email")} />
          </div>
        </div>
      </SectionCard>

      <SectionCard id={fieldId("p:leadInboxes")} title={c.inboxes} hint={c.inboxesHint} aside={<Changed k="p:leadInboxes" />}>
        <ul className="grid max-w-xl gap-2">
          {inboxes.map((address, i) => (
            <li key={i}>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  inputMode="email"
                  value={address}
                  aria-label={`${c.inboxes} ${i + 1}`}
                  aria-invalid={!!issues.get("p:leadInboxes")?.some((x) => x.index === i)}
                  onChange={(e) => set("p:leadInboxes", inboxes.map((a, n) => (n === i ? e.target.value.trim() : a)))}
                  className={inputClass}
                />
                <IconButton
                  label={ui.remove}
                  tone="danger"
                  disabled={inboxes.length <= 1}
                  onClick={() => set("p:leadInboxes", inboxes.filter((_, n) => n !== i))}
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <IssueList ui={ui} issues={issues.get("p:leadInboxes")} index={i} />
            </li>
          ))}
        </ul>
        <IssueList ui={ui} issues={issues.get("p:leadInboxes")?.filter((x) => x.index === undefined)} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {inboxes.length < MAX_INBOXES && (
            <button type="button" className={smallBtn} onClick={() => set("p:leadInboxes", [...inboxes, ""])}>
              <PlusIcon /> {c.addInbox}
            </button>
          )}
          <button type="button" className="btn btn-ghost !min-h-10 text-sm text-slate" disabled={testing} onClick={sendTest}>
            {testing ? c.testing : c.test}
          </button>
        </div>
        {test && (
          <p role="status" className={`mt-3 text-sm font-semibold ${test.tone === "ok" ? "text-teal" : "text-red-800"}`}>
            {test.text}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
