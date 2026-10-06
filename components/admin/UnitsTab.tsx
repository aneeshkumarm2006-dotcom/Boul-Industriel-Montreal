"use client";

import { deepEqual } from "@/lib/cms/merge";
import { UNIT_ROWS, type UnitState } from "@/lib/cms/units";
import { fill } from "@/lib/format";
import { Badge, fieldId, inputBase, IssueList, SectionCard, smallBtn, useEditor } from "./ui";

/** Today's date in Montréal, as YYYY-MM-DD. */
export function todayInMontreal(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-max gap-1 rounded-lg border border-line bg-white p-1">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
            value === v ? (v === "sale" ? "bg-mint text-slate" : "bg-slate text-white") : "text-steel hover:bg-paper-2"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default function UnitsTab({ onUnitChange, onDateEdit }: { onUnitChange: () => void; onDateEdit: () => void }) {
  const { ui, values, published, set, issues } = useEditor();
  const u = ui.units;
  const rows = UNIT_ROWS.map((row) => ({
    row,
    key: `u:${row.id}`,
    state: values[`u:${row.id}`] as UnitState,
    pub: published[`u:${row.id}`] as UnitState,
  }));
  const forSale = rows.filter((r) => r.state.status === "sale").length;
  const range = values["p:areaRange"] as [number, number];
  const asOf = values["p:availabilityAsOf"] as string;

  const setUnit = (key: string, next: UnitState) => {
    set(key, next);
    onUnitChange();
  };
  const suggest = () => {
    const areas = rows.flatMap((r) => (r.state.status === "sale" && r.state.sqft ? [r.state.sqft] : []));
    if (areas.length) set("p:areaRange", [Math.min(...areas), Math.max(...areas)]);
  };
  const num = (v: string) => (v === "" ? NaN : Math.round(Number(v)));

  return (
    <div className="grid gap-6">
      <SectionCard
        title={u.title}
        hint={u.intro}
        aside={<p className="mono rounded-md bg-paper-2 px-2.5 py-1.5 text-sm">{fill(u.summary, { sale: forSale, sold: rows.length - forSale })}</p>}
      >
        <ul>
          <li aria-hidden className="eyebrow hidden grid-cols-[minmax(0,1fr)_auto_9rem] gap-4 pb-2 text-steel sm:grid">
            <span>{u.unit}</span>
            <span>{u.status}</span>
            <span>{u.area}</span>
          </li>
          {rows.map(({ row, key, state, pub }) => {
            const changed = !deepEqual(state, pub);
            const name = row.civics.join(" + ");
            return (
              <li
                key={row.id}
                id={fieldId(key)}
                className={`grid scroll-mt-40 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-line px-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_9rem] ${
                  changed ? "bg-mint/20" : ""
                }`}
              >
                <p className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1">
                  <span className="civic text-[1.35rem] text-slate">{name}</span>
                  {row.through && <span className="eyebrow text-steel">{u.through}</span>}
                  {changed && <Badge tone="unpublished">{ui.unpublished}</Badge>}
                </p>
                <Segmented
                  label={`${u.status} ${name}`}
                  value={state.status}
                  options={[
                    ["sale", u.forSale],
                    ["sold", u.sold],
                  ]}
                  onChange={(status) => setUnit(key, { ...state, status })}
                />
                <div>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    aria-label={`${u.area} ${name}`}
                    value={state.sqft ?? ""}
                    placeholder={u.onRequest}
                    onChange={(e) => {
                      const n = num(e.target.value);
                      setUnit(key, { ...state, sqft: Number.isFinite(n) && n > 0 ? n : null });
                    }}
                    className={`${inputBase} w-32 sm:w-full ${state.status === "sold" ? "opacity-50" : ""}`}
                  />
                  <IssueList ui={ui} issues={issues.get(key)} />
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard id={fieldId("p:availabilityAsOf")} title={u.asOf} hint={u.asOfHint}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={asOf}
              aria-label={u.asOf}
              onChange={(e) => {
                set("p:availabilityAsOf", e.target.value);
                onDateEdit();
              }}
              className={inputBase}
            />
            <button
              type="button"
              className={smallBtn}
              onClick={() => {
                set("p:availabilityAsOf", todayInMontreal());
                onDateEdit();
              }}
            >
              {u.today}
            </button>
          </div>
          <IssueList ui={ui} issues={issues.get("p:availabilityAsOf")} />
        </SectionCard>

        <SectionCard id={fieldId("p:areaRange")} title={u.range} hint={u.rangeHint}>
          <div className="flex flex-wrap items-center gap-2 text-[0.9375rem]">
            <span>{u.from}</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              aria-label={`${u.range} min`}
              value={Number.isFinite(range[0]) ? range[0] : ""}
              onChange={(e) => set("p:areaRange", [num(e.target.value), range[1]])}
              className={`${inputBase} w-28`}
            />
            <span>{u.to}</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              aria-label={`${u.range} max`}
              value={Number.isFinite(range[1]) ? range[1] : ""}
              onChange={(e) => set("p:areaRange", [range[0], num(e.target.value)])}
              className={`${inputBase} w-28`}
            />
            <span>pi² / sq ft</span>
          </div>
          <button type="button" className={`${smallBtn} mt-3`} onClick={suggest}>
            {u.suggest}
          </button>
          <IssueList ui={ui} issues={issues.get("p:areaRange")} />
        </SectionCard>
      </div>
    </div>
  );
}
