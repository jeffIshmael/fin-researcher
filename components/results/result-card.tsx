"use client";

import type { ResultCardData } from "@/lib/types";
import { humanize, isRecord, shortenHex } from "@/lib/utils";

/**
 * Cream "finding" card. It never invents values: it only shows fields that were
 * actually returned, omits null/missing ones (never turning them into zero), and
 * keeps the raw data one tap away. Bars are drawn from returned numbers only.
 */

const PROVENANCE = new Set([
  "period",
  "data_source",
  "data_last_updated",
  "generated_at",
  "data_quality",
  "provenance",
]);
const HIDE = new Set(["success"]);
const SIGNED_KEY = /(net|change|delta|diff)/i;
const LABEL_KEY = /(name|label|symbol|token|address|counterparty|entity|category|protocol|group)/i;
const METRIC_KEY = /(volume|amount|value|total|usd|share|percent|pct|count|balance|received|sent|inflow|outflow)/i;

type Prim = string | number | boolean;
interface Stat {
  label: string;
  value: Prim;
  signed: boolean;
}
interface ListBlock {
  title: string;
  items: unknown[];
}

function unwrap(data: unknown): unknown {
  let cur = data;
  for (let i = 0; i < 3; i++) {
    if (!isRecord(cur)) break;
    const keys = Object.keys(cur).filter((k) => !HIDE.has(k));
    if (keys.length === 1 && (isRecord(cur[keys[0]]) || Array.isArray(cur[keys[0]]))) cur = cur[keys[0]];
    else break;
  }
  return cur;
}

function collect(
  obj: Record<string, unknown>,
  prefix: string,
  depth: number,
  stats: Stat[],
  lists: ListBlock[],
  provenance: Record<string, unknown>,
) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || HIDE.has(key)) continue;
    if (PROVENANCE.has(key)) {
      provenance[key] = value;
      continue;
    }
    const label = prefix ? `${prefix} · ${humanize(key)}` : humanize(key);
    if (Array.isArray(value)) {
      if (value.length > 0) lists.push({ title: label, items: value });
    } else if (isRecord(value)) {
      if (depth < 2) collect(value, label, depth + 1, stats, lists, provenance);
    } else {
      stats.push({ label, value: value as Prim, signed: SIGNED_KEY.test(key) });
    }
  }
}

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

function Num({ n, signed }: { n: number; signed: boolean }) {
  if (!signed || n === 0) return <>{nf.format(n)}</>;
  const up = n > 0;
  return (
    <span className={up ? "text-pos" : "text-neg"}>
      {up ? "↑ +" : "↓ −"}
      {nf.format(Math.abs(n))}
    </span>
  );
}

function Value({ value, signed }: { value: Prim; signed: boolean }) {
  if (typeof value === "number") return <Num n={value} signed={signed} />;
  if (typeof value === "boolean") return <>{value ? "Yes" : "No"}</>;
  if (value.startsWith("https://")) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 [overflow-wrap:anywhere]">
        {value.replace(/^https:\/\//, "")}
      </a>
    );
  }
  return <span className="[overflow-wrap:anywhere]">{shortenHex(value)}</span>;
}

function plain(v: Prim): string {
  if (typeof v === "number") return nf.format(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return shortenHex(v);
}

/** Pick one numeric field shared by the rows to draw proportional bars from. */
function pickMetric(items: unknown[]): { key: string | null; max: number } {
  const rows = items.filter(isRecord);
  if (rows.length < 2) return { key: null, max: 0 };
  const counts = new Map<string, number>();
  const bad = new Set<string>();
  for (const r of rows) {
    for (const [k, v] of Object.entries(r)) {
      if (typeof v === "number" && Number.isFinite(v)) {
        if (v < 0) bad.add(k);
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
  }
  const candidates = [...counts.entries()]
    .filter(([k, c]) => !bad.has(k) && c >= rows.length / 2)
    .map(([k]) => k);
  const key = candidates.find((k) => METRIC_KEY.test(k)) ?? candidates[0] ?? null;
  if (!key) return { key: null, max: 0 };
  const max = Math.max(...rows.map((r) => (typeof r[key] === "number" ? (r[key] as number) : 0)));
  return max > 0 ? { key, max } : { key: null, max: 0 };
}

function ListItem({ item, metricKey, max }: { item: unknown; metricKey: string | null; max: number }) {
  if (!isRecord(item)) {
    return <li className="py-2 text-sm [overflow-wrap:anywhere]">{String(item)}</li>;
  }
  const entries = Object.entries(item).filter(
    ([, v]) => v !== null && v !== undefined && typeof v !== "object",
  ) as [string, Prim][];
  const labelEntry =
    entries.find(([k, v]) => LABEL_KEY.test(k) && typeof v === "string") ??
    entries.find(([, v]) => typeof v === "string");
  const metricEntry = metricKey ? entries.find(([k, v]) => k === metricKey && typeof v === "number") : undefined;
  const rest = entries.filter((e) => e !== labelEntry && e !== metricEntry).slice(0, 3);
  const pct = metricEntry ? Math.max(2, Math.min(100, ((metricEntry[1] as number) / max) * 100)) : null;

  return (
    <li className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-sm font-medium [overflow-wrap:anywhere]">
          {labelEntry ? shortenHex(String(labelEntry[1])) : "Item"}
        </p>
        {metricEntry && (
          <p className="shrink-0 font-mono text-sm tabular-nums">{nf.format(metricEntry[1] as number)}</p>
        )}
      </div>
      {pct !== null && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
          <div className="h-full rounded-full bg-pos" style={{ width: `${pct}%` }} />
        </div>
      )}
      {rest.length > 0 && (
        <p className="mt-1 text-xs text-ink-muted [overflow-wrap:anywhere]">
          {rest.map(([k, v]) => `${humanize(k)}: ${plain(v)}`).join(" · ")}
        </p>
      )}
    </li>
  );
}

function ListBlockView({ block, limit }: { block: ListBlock; limit: number }) {
  const { key, max } = pickMetric(block.items);
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {block.title}
        {key && <span className="ml-1.5 font-normal normal-case tracking-normal">by {humanize(key).toLowerCase()}</span>}
      </p>
      <ul className="divide-y divide-paper-line">
        {block.items.slice(0, limit).map((item, i) => (
          <ListItem key={i} item={item} metricKey={key} max={max} />
        ))}
      </ul>
      {block.items.length > limit && (
        <p className="text-xs text-ink-muted">+{block.items.length - limit} more in raw data</p>
      )}
    </div>
  );
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {stats.map((s) => (
        <div key={s.label} className="min-w-0">
          <dt className="text-xs text-ink-muted">{s.label}</dt>
          <dd className="font-mono text-[15px] font-medium leading-snug tabular-nums">
            <Value value={s.value} signed={s.signed} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function provenanceLines(p: Record<string, unknown>): { label: string; text: string }[] {
  const out: { label: string; text: string }[] = [];
  const asText = (v: unknown): string =>
    isRecord(v)
      ? Object.values(v).filter((x) => typeof x === "string" || typeof x === "number").join(" → ")
      : String(v);
  if (p.period !== undefined) out.push({ label: "Period", text: asText(p.period) });
  if (p.data_source !== undefined) out.push({ label: "Source", text: asText(p.data_source) });
  if (p.data_last_updated !== undefined) out.push({ label: "Data updated", text: asText(p.data_last_updated) });
  if (p.generated_at !== undefined) out.push({ label: "Generated", text: asText(p.generated_at) });
  const dq = p.data_quality;
  if (isRecord(dq) && Array.isArray(dq.limitations) && dq.limitations.length > 0) {
    out.push({ label: "Limitations", text: dq.limitations.map(String).join(" · ") });
  }
  return out;
}

export function ResultCard({ card }: { card: ResultCardData }) {
  const root = unwrap(card.data);
  const stats: Stat[] = [];
  const lists: ListBlock[] = [];
  const provenance: Record<string, unknown> = {};

  if (isRecord(root)) collect(root, "", 0, stats, lists, provenance);
  else if (Array.isArray(root)) lists.push({ title: "Results", items: root });
  else if (root !== null && root !== undefined) stats.push({ label: "Result", value: String(root), signed: false });

  // The chat reply tells the story; the card keeps one hero figure and a few supporting ones.
  const hero = stats[0];
  const support = stats.slice(1, 4);
  const extraStats = stats.slice(4, 12);
  const leadList = !hero ? lists[0] : undefined;
  const moreLists = (leadList ? lists.slice(1) : lists).slice(0, 2);
  const lines = provenanceLines(provenance);
  const heroIsLong = hero ? typeof hero.value === "string" && hero.value.length > 14 : false;
  const hasBody = Boolean(hero || leadList);

  return (
    <section className="animate-fade-up mt-2 overflow-hidden rounded-2xl bg-paper text-ink shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <header className="flex items-center justify-between px-4 pt-3.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{card.title}</h3>
        <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-accent">OnFRA</span>
      </header>

      <div className="px-4 pb-4 pt-2">
        {hero && (
          <div>
            <p className="text-xs text-ink-muted">{hero.label}</p>
            <p
              className={`font-display font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] ${
                heroIsLong ? "text-xl" : "text-4xl"
              }`}
            >
              <Value value={hero.value} signed={hero.signed} />
            </p>
          </div>
        )}
        {support.length > 0 && (
          <div className="mt-3 border-t border-paper-line pt-3">
            <StatGrid stats={support} />
          </div>
        )}
        {leadList && <ListBlockView block={leadList} limit={3} />}

        <details className={`group text-xs ${hasBody ? "mt-3 border-t border-paper-line pt-3" : ""}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink-muted">
            More detail
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="mt-3">
            {extraStats.length > 0 && <StatGrid stats={extraStats} />}
            {moreLists.map((l) => (
              <ListBlockView key={l.title} block={l} limit={6} />
            ))}
            {lines.length > 0 && (
              <dl className="mt-3 space-y-0.5 border-t border-paper-line pt-3 text-ink-muted">
                {lines.map((l) => (
                  <div key={l.label} className="flex gap-2">
                    <dt className="shrink-0">{l.label}:</dt>
                    <dd className="min-w-0 [overflow-wrap:anywhere]">{l.text}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className="mt-3 text-ink-muted">Raw data</p>
            <pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-paper-2 p-2 font-mono text-[11px]">
              {JSON.stringify(card.data, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </section>
  );
}
