"use client";

import type { DriveTimeValue } from "@/lib/cms/defaults";
import { deepEqual } from "@/lib/cms/merge";
import { BUILDING_FACTS, LOCKED_DRIVE_TIME } from "@/lib/cms/registry";
import { fill } from "@/lib/format";
import {
  Badge,
  BiInputs,
  CloseIcon,
  DownIcon,
  fieldId,
  IconButton,
  inputClass,
  IssueList,
  LockIcon,
  PlusIcon,
  SectionCard,
  smallBtn,
  UpIcon,
  useEditor,
} from "./ui";

export default function BuildingTab() {
  const { ui, lang, values, published, set, issues } = useEditor();
  const b = ui.building;
  const times = values["p:driveTimes"] as DriveTimeValue[];
  const setTimes = (next: DriveTimeValue[]) => set("p:driveTimes", next);
  const move = (i: number, d: number) => {
    const next = [...times];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setTimes(next);
  };

  return (
    <div className="grid gap-6">
      <SectionCard title={b.facts} hint={b.factsHint}>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {BUILDING_FACTS.map((fact) => {
            const key = `p:building.${fact.key}`;
            const value = values[key] as number | string;
            const changed = !deepEqual(value, published[key]);
            return (
              <div key={key} id={fieldId(key)} className="scroll-mt-40">
                <label htmlFor={`cms-${fact.key}`} className="flex min-h-10 items-end gap-2 text-sm font-semibold">
                  {fact.label[lang]}
                  {changed && <Badge tone="unpublished">{ui.unpublished}</Badge>}
                </label>
                {"min" in fact ? (
                  <input
                    id={`cms-${fact.key}`}
                    type="number"
                    min={fact.min}
                    max={fact.max}
                    step={fact.step}
                    inputMode="decimal"
                    value={typeof value === "number" && Number.isFinite(value) ? value : ""}
                    onChange={(e) => set(key, e.target.value === "" ? NaN : Number(e.target.value))}
                    className={`${inputClass} mt-1.5`}
                  />
                ) : (
                  <input
                    id={`cms-${fact.key}`}
                    value={String(value)}
                    maxLength={40}
                    onChange={(e) => set(key, e.target.value)}
                    className={`${inputClass} mt-1.5`}
                  />
                )}
                <IssueList ui={ui} issues={issues.get(key)} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        id={fieldId("p:driveTimes")}
        title={b.drive}
        hint={b.driveHint}
        aside={!deepEqual(times, published["p:driveTimes"]) && <Badge tone="unpublished">{ui.unpublished}</Badge>}
      >
        <IssueList ui={ui} issues={issues.get("p:driveTimes")?.filter((i) => i.index === undefined)} />
        <ol className="grid gap-3">
          {times.map((d, i) => {
            const locked = d.key === LOCKED_DRIVE_TIME;
            return (
              <li key={d.key} className="grid gap-3 rounded-xl border border-line bg-paper/60 p-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto] sm:items-start">
                <div>
                  <p className="mb-1 text-xs font-semibold text-steel">{b.place}</p>
                  <BiInputs
                    ui={ui}
                    value={d.name}
                    index={i}
                    issues={issues.get("p:driveTimes")?.filter((x) => x.code !== "range")}
                    label={`${b.place} ${i + 1}`}
                    onChange={(name) => setTimes(times.map((t, n) => (n === i ? { ...t, name } : t)))}
                  />
                  {locked && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-steel">
                      <LockIcon /> {fill(b.locked, { a40: "{a40}" })}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-steel">{b.minutes}</p>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    inputMode="numeric"
                    aria-label={`${b.minutes} ${i + 1}`}
                    value={Number.isFinite(d.min) ? d.min : ""}
                    onChange={(e) => setTimes(times.map((t, n) => (n === i ? { ...t, min: e.target.value === "" ? NaN : Math.round(Number(e.target.value)) } : t)))}
                    className={inputClass}
                  />
                  <IssueList ui={ui} issues={issues.get("p:driveTimes")?.filter((x) => x.code === "range")} index={i} />
                </div>
                <div className="flex sm:pt-5">
                  <IconButton label={ui.moveUp} onClick={() => move(i, -1)} disabled={i === 0}>
                    <UpIcon />
                  </IconButton>
                  <IconButton label={ui.moveDown} onClick={() => move(i, 1)} disabled={i === times.length - 1}>
                    <DownIcon />
                  </IconButton>
                  <IconButton label={ui.remove} tone="danger" disabled={locked || times.length <= 1} onClick={() => setTimes(times.filter((_, n) => n !== i))}>
                    <CloseIcon />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ol>
        {times.length < 12 && (
          <button
            type="button"
            className={`${smallBtn} mt-3`}
            onClick={() => setTimes([...times, { key: `p${Date.now().toString(36)}`, min: 10, name: { fr: "", en: "" } }])}
          >
            <PlusIcon /> {b.addPlace}
          </button>
        )}
      </SectionCard>
    </div>
  );
}
