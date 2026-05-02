// NLQ components.
import React, { useState, useEffect, useRef } from "react";
import { t, useLang, getLang } from "./i18n.js";
import { euro } from "./data.js";
import { catColor, catLabel } from "./data.js";
import { tRow, tSheetName } from "./i18n.js";
import { SHEETS_SEED } from "./data.js";

function currentRows(inputRows = null) {
  if (Array.isArray(inputRows) && inputRows.length) {
    return inputRows.map((r, idx) => {
      const amount = Number(r.totalAmount || 0);
      const normalized = Number.isFinite(amount) ? amount : 0;
      return {
        id: idx,
        date: String(r.transactionDate || "").slice(0, 10),
        desc: r.merchant || "Transaction",
        counterparty: r.merchant || "",
        cat: String(r.category || "other"),
        amount: normalized >= 0 ? -Math.abs(normalized) : Math.abs(normalized),
        status: "cleared",
        sheetId: "main",
        sheetName: "CFO Feed",
      };
    });
  }
  try {
    const raw = localStorage.getItem("anima_sheets_state_v3");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sheets)) {
        return parsed.sheets.flatMap(s => (s.rows || []).map(r => ({ ...r, sheetId: s.id, sheetName: tSheetName(s) })));
      }
    }
  } catch {}
  return SHEETS_SEED.flatMap(s => s.rows.map(r => ({ ...r, sheetId: s.id, sheetName: tSheetName(s) })));
}

function rowDesc(r) { return tRow(r).desc || r.desc || ""; }

function applyFilter(spec, rows) {
  let out = rows.slice();
  if (spec.sheet && spec.sheet !== "all") out = out.filter(r => r.sheetId === spec.sheet);
  if (Array.isArray(spec.categories) && spec.categories.length) {
    const set = new Set(spec.categories);
    out = out.filter(r => set.has(r.cat));
  }
  if (spec.direction === "income") out = out.filter(r => r.amount > 0);
  if (spec.direction === "expense") out = out.filter(r => r.amount < 0);
  if (typeof spec.minAmount === "number") out = out.filter(r => Math.abs(r.amount) >= spec.minAmount);
  if (typeof spec.maxAmount === "number") out = out.filter(r => Math.abs(r.amount) <= spec.maxAmount);
  if (spec.dateFrom) out = out.filter(r => r.date >= spec.dateFrom);
  if (spec.dateTo)   out = out.filter(r => r.date <= spec.dateTo);
  if (spec.text) {
    const q = String(spec.text).toLowerCase();
    out = out.filter(r => {
      const desc = rowDesc(r).toLowerCase();
      const cp = String(r.counterparty || "").toLowerCase();
      const note = (tRow(r).note || "").toLowerCase();
      return desc.includes(q) || cp.includes(q) || note.includes(q);
    });
  }
  if (spec.sort && spec.sort.by) {
    const dir = spec.sort.dir === "asc" ? 1 : -1;
    out.sort((a, b) => {
      if (spec.sort.by === "amount") return (Math.abs(a.amount) - Math.abs(b.amount)) * dir;
      if (spec.sort.by === "date") return (a.date < b.date ? -1 : 1) * dir;
      return 0;
    });
  }
  if (typeof spec.limit === "number" && spec.limit > 0) out = out.slice(0, spec.limit);
  return out;
}

function aggregate(spec, rows) {
  if (!spec.aggregate) return null;
  if (spec.groupBy === "category") {
    const by = new Map();
    for (const r of rows) {
      if (!by.has(r.cat)) by.set(r.cat, { key: r.cat, label: catLabel(r.cat), total: 0, count: 0 });
      const s = by.get(r.cat); s.total += Math.abs(r.amount); s.count += 1;
    }
    return { groupBy: "category", groups: [...by.values()].sort((a, b) => b.total - a.total) };
  }
  if (spec.groupBy === "month") {
    const by = new Map();
    for (const r of rows) {
      const k = r.date.slice(0, 7);
      if (!by.has(k)) by.set(k, { key: k, label: k, total: 0, count: 0 });
      const s = by.get(k); s.total += Math.abs(r.amount); s.count += 1;
    }
    return { groupBy: "month", groups: [...by.values()].sort((a, b) => a.key < b.key ? -1 : 1) };
  }
  const total = rows.reduce((s, r) => s + Math.abs(r.amount), 0);
  const count = rows.length;
  const avg = count ? total / count : 0;
  return { groupBy: null, total, count, avg };
}

const SYSTEM_PROMPT = `You are a query parser for a German finance ledger.
Translate the user's question into a single JSON object describing a filter and (optional) aggregate.
Available sheet ids: main, personal, project. Use "all" for all sheets.
Available category keys: einnahmen, ausgaben, gehaelter, software, marketing, miete, reisekosten, steuern, versicherungen, bewirtung, sonstiges, buerobedarf, telekommunikation, abschreibungen, beratung, fahrzeugkosten.
Today is 2026-04-27.
Output ONLY valid minified JSON with keys: intent, sheet, categories, direction, minAmount, maxAmount, dateFrom, dateTo, text, limit, sort {by,dir}, aggregate, groupBy, headline (in the original language).`;

function inferMonthRange(question) {
  const q = question.toLowerCase();
  const monthMap = {
    january: "01", januar: "01", enero: "01",
    february: "02", februar: "02", febrero: "02",
    march: "03", maerz: "03", märz: "03", marzo: "03",
    april: "04", abril: "04",
    may: "05", mai: "05", mayo: "05",
    june: "06", juni: "06", junio: "06",
    july: "07", juli: "07", julio: "07",
    august: "08", augusto: "08",
    september: "09", september: "09", septiembre: "09",
    october: "10", oktober: "10", octubre: "10",
    november: "11", noviembre: "11",
    december: "12", dezember: "12", diciembre: "12",
  };
  const year = (q.match(/\b(20\d{2})\b/) || [])[1] || String(new Date().getFullYear());
  for (const [name, mm] of Object.entries(monthMap)) {
    if (!q.includes(name)) continue;
    const nextMonth = String((Number(mm) % 12) + 1).padStart(2, "0");
    const nextYear = mm === "12" ? String(Number(year) + 1) : year;
    return { dateFrom: `${year}-${mm}-01`, dateTo: `${nextYear}-${nextMonth}-01` };
  }
  return {};
}

function inferCategories(question) {
  const q = question.toLowerCase();
  const map = {
    software: ["software", "saas", "license", "lizenz", "licencia"],
    versicherungen: ["insurance", "versicherung", "seguro"],
    marketing: ["marketing", "ads", "werbung", "anuncio"],
    reisekosten: ["travel", "reise", "viaje", "hotel", "flug", "train", "bahn", "tren"],
    bewirtung: ["food", "meal", "restaurant", "döner", "comida"],
    miete: ["rent", "miete", "alquiler"],
    telekommunikation: ["telecom", "phone", "internet", "telekom"],
    steuern: ["tax", "steuer", "impuesto"],
    fahrzeugkosten: ["car", "vehicle", "auto", "fahrzeug"],
  };
  for (const [cat, words] of Object.entries(map)) {
    if (words.some((w) => q.includes(w))) return [cat];
  }
  return [];
}

function interpretQuestion(question) {
  const q = String(question || "").toLowerCase();
  const amountMatch = q.match(/(?:over|above|über|mas de|más de)\s*(\d+[.,]?\d*)/);
  const minAmount = amountMatch ? Number(amountMatch[1].replace(",", ".")) : null;
  const wantsSum = /(how much|wie viel|cuánto|cuanto|total|sum)/.test(q);
  const wantsTop = /(top|highest|größte|gr[oö]sste|mayor)/.test(q);
  const direction = /(income|einnahmen|ingresos)/.test(q) ? "income" : "expense";
  const { dateFrom, dateTo } = inferMonthRange(q);
  const categories = inferCategories(q);
  return {
    intent: wantsTop ? "top-categories" : wantsSum ? "sum" : "filter",
    sheet: "all",
    categories,
    direction,
    minAmount,
    maxAmount: null,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    text: null,
    limit: wantsTop ? 5 : 50,
    sort: { by: "amount", dir: "desc" },
    aggregate: true,
    groupBy: wantsTop ? "category" : null,
    headline: question,
  };
}

function parseJsonLoose(txt) {
  if (!txt) return null;
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

async function askClaude(question) {
  if (window.claude && window.claude.complete) {
    const resp = await window.claude.complete({
      messages: [{ role: "user", content: SYSTEM_PROMPT + "\n\nQuestion: " + question }],
    });
    const parsed = parseJsonLoose(resp);
    if (parsed) return parsed;
  }
  return interpretQuestion(question);
}

function toCsv(rows) {
  const header = ["date","description","counterparty","category","ref","amount","status","sheet"];
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const body = rows.map(r => [
    r.date, rowDesc(r), r.counterparty || "", catLabel(r.cat), r.ref || "",
    r.amount.toFixed(2), r.status || "", r.sheetName || r.sheetId || "",
  ].map(esc).join(","));
  return [header.join(","), ...body].join("\n");
}

function downloadCsv(rows, filename) {
  const csv = toCsv(rows);
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename || "anima-query.csv";
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

export function AskButton({ onClick }) {
  return (
    <button onClick={onClick}
      className="fixed bottom-6 right-6 z-30 h-12 pl-4 pr-5 rounded-full bg-[var(--fg)] text-[var(--bg)] shadow-xl inline-flex items-center gap-2 text-[13px] font-semibold hover:scale-[1.03] transition-transform"
      style={{ boxShadow: "0 10px 40px -10px color-mix(in oklch, var(--net), transparent 40%)" }}
      aria-label={t("nlq_button")}>
      <span className="relative h-5 w-5 grid place-items-center">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l1.9 5.9L20 10l-6.1 2.1L12 18l-1.9-5.9L4 10l6.1-2.1z"/>
        </svg>
        <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: "currentColor" }} />
      </span>
      {t("nlq_button")}
      <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded border border-current/30 opacity-70 font-mono">⌘K</span>
    </button>
  );
}

export function AskModal({ onClose, rows = [] }) {
  useLang();
  const inputRef = useRef(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const samples = [t("nlq_q1"), t("nlq_q2"), t("nlq_q3"), t("nlq_q4")];

  const run = async (question) => {
    setQ(question); setErr(""); setResult(null); setState("thinking");
    try {
      const spec = await askClaude(question);
      const ledgerRows = currentRows(rows);
      const filteredRows = applyFilter(spec, ledgerRows);
      const agg = aggregate(spec, filteredRows);
      setResult({ spec, rows: filteredRows, agg, headline: spec.headline || "", question });
      setState("done");
    } catch (e) {
      setErr(String(e && e.message || e));
      setState("error");
    }
  };

  const onSubmit = (e) => { e.preventDefault(); if (!q.trim()) return; run(q.trim()); };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] rounded-2xl border border-[var(--line-strong)] bg-[var(--bg)] shadow-2xl overflow-hidden anim-in-fast">
        <form onSubmit={onSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-[var(--line)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--muted)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l1.9 5.9L20 10l-6.1 2.1L12 18l-1.9-5.9L4 10l6.1-2.1z"/>
          </svg>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t("nlq_placeholder")}
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[var(--muted)]" />
          <button type="submit" disabled={!q.trim() || state === "thinking"}
            className="h-8 px-3 rounded-lg bg-[var(--fg)] text-[var(--bg)] text-[12px] font-semibold disabled:opacity-40 disabled:pointer-events-none hover:opacity-90 transition-opacity">
            {state === "thinking" ? t("nlq_thinking") + "…" : t("nlq_button")}
          </button>
          <button type="button" onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
          </button>
        </form>
        <div className="max-h-[60vh] overflow-y-auto">
          {state === "idle" && <Suggestions samples={samples} onPick={run} />}
          {state === "thinking" && <Thinking />}
          {state === "error" && <ErrorBlock err={err} />}
          {state === "done" && result && <ResultBlock result={result} />}
        </div>
      </div>
    </div>
  );
}

function Suggestions({ samples, onPick }) {
  return (
    <div className="p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] mb-3">{t("nlq_suggest")}</div>
      <div className="grid gap-2">
        {samples.map((s, i) => (
          <button key={i} onClick={() => onPick(s)}
            className="text-left px-3.5 py-2.5 rounded-lg border border-[var(--line)] hover:bg-[var(--surface2)] text-[13px] transition-colors flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="p-8 flex flex-col items-center justify-center gap-3">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-[var(--line)]" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--fg)] animate-spin" style={{ animationDuration: "800ms" }} />
      </div>
      <div className="text-[12.5px] text-[var(--muted)]">{t("nlq_thinking")}…</div>
    </div>
  );
}

function ErrorBlock({ err }) {
  return (
    <div className="p-5">
      <div className="rounded-lg border border-[color-mix(in_oklch,var(--neg),transparent_70%)] bg-[color-mix(in_oklch,var(--neg),transparent_92%)] px-4 py-3 text-[12.5px] text-[var(--neg)]">
        {t("nlq_error")}
        <div className="text-[10.5px] opacity-70 mt-1 font-mono">{err}</div>
      </div>
    </div>
  );
}

function ResultBlock({ result }) {
  const { rows, agg, headline } = result;
  const locale = getLang() === "de" ? "de-DE" : getLang() === "es" ? "es-ES" : "en-GB";
  if (!rows.length && (!agg || !agg.groups)) {
    return <div className="p-6 text-center text-[13px] text-[var(--muted)]">{t("nlq_empty")}</div>;
  }
  return (
    <div className="p-5">
      {headline && (
        <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full grid place-items-center flex-shrink-0"
              style={{ background: "color-mix(in oklch, var(--net), transparent 85%)", color: "var(--net)" }}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.9 5.9L20 10l-6.1 2.1L12 18l-1.9-5.9L4 10l6.1-2.1z"/></svg>
            </div>
            <div className="text-[13.5px] leading-snug">{headline}</div>
          </div>
        </div>
      )}
      {agg && agg.groupBy == null && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label={t("tbl_amount")} value={euro(agg.total)} />
          <Stat label="n" value={String(agg.count)} mono />
          <Stat label="avg" value={euro(agg.avg)} />
        </div>
      )}
      {agg && agg.groupBy === "category" && (
        <div className="mb-4 rounded-xl border border-[var(--line)] overflow-hidden">
          {agg.groups.slice(0, 6).map((g, i) => {
            const color = catColor(g.key);
            const total = agg.groups.reduce((s, x) => s + x.total, 0) || 1;
            const pct = (g.total / total) * 100;
            return (
              <div key={g.key} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}>
                <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-[12.5px] font-medium w-32 truncate">{g.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, animation: `bar-grow 700ms ease-out ${i * 60}ms backwards` }} />
                </div>
                <span className="text-[12px] tabular-nums font-medium w-24 text-right" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{euro(g.total)}</span>
              </div>
            );
          })}
        </div>
      )}
      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{t("nlq_matching", { n: rows.length })}</div>
            <button onClick={() => downloadCsv(rows, "anima-query.csv")}
              className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-lg border border-[var(--line)] hover:bg-[var(--surface2)] transition-colors">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              {t("nlq_csv")}
            </button>
          </div>
          <ul className="rounded-xl border border-[var(--line)] overflow-hidden">
            {rows.slice(0, 40).map((r, i) => {
              const desc = tRow(r).desc;
              const color = catColor(r.cat);
              const pos = r.amount > 0;
              return (
                <li key={r.sheetId + "-" + r.id + "-" + i} className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-[var(--line)]" : ""}`} style={{ animation: `row-in 450ms ${i * 30}ms backwards ease-out` }}>
                  <span className="text-[11px] text-[var(--muted)] tabular-nums w-14">{new Date(r.date).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{desc}</div>
                    <div className="text-[11px] text-[var(--muted)] truncate">{r.counterparty}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: `color-mix(in oklch, ${color}, transparent 85%)`, color }}>{catLabel(r.cat)}</span>
                  <span className="text-[12.5px] tabular-nums font-semibold w-20 text-right flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: pos ? "var(--pos)" : "var(--fg)" }}>
                    {pos ? "+" : ""}{euro(r.amount, { decimals: 2 })}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
      <div className="mt-0.5 text-[15px] font-semibold tabular-nums" style={{ fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : undefined }}>{value}</div>
    </div>
  );
}
