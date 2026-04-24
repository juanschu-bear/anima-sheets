// Import view.
import React, { useState, useRef, useMemo } from "react";
import { t, useLang, getLang } from "./i18n.js";
import { CATEGORY_DEFS, catColor, catLabel, euroNum } from "./data.js";

const MOCK_CSV_ROWS = [
  { date: "2026-04-23", desc: "MUELLER GMBH RE 2847",         amount:  4200.00 },
  { date: "2026-04-22", desc: "SEPA FREELANCER EINGANG",      amount:  3500.00 },
  { date: "2026-04-19", desc: "GEHALT TEAM SEPA SAMMLER",     amount: -3200.00 },
  { date: "2026-04-18", desc: "DAUERAUFTRAG MIETE HAUPTSTR",  amount:  -950.00 },
  { date: "2026-04-17", desc: "LINKEDIN MARKETING SOL IE",    amount:  -480.00 },
  { date: "2026-04-15", desc: "FIGMA INC / JAHRESABO",        amount:  -225.00 },
  { date: "2026-04-14", desc: "HOTEL MERCURE BERLIN CHECKOUT",amount:  -340.00 },
  { date: "2026-04-14", desc: "DB FERNVERKEHR TICKET",        amount:  -189.00 },
  { date: "2026-04-13", desc: "RESTAURANT KLUB ESSEN",        amount:  -142.50 },
  { date: "2026-04-12", desc: "ADOBE SYSTEMS IE",             amount:   -59.99 },
  { date: "2026-04-11", desc: "FINANZAMT USTVA APRIL",        amount:  -480.00 },
  { date: "2026-04-10", desc: "ALLIANZ GEWERBE BHV",          amount:  -195.00 },
];

function autoCat(desc) {
  const d = desc.toLowerCase();
  if (/gehalt|lohn/.test(d)) return "gehaelter";
  if (/miete|hauptstr/.test(d)) return "miete";
  if (/linkedin|meta ads|google ads|kampagne/.test(d)) return "marketing";
  if (/adobe|figma|github|notion|google work|saas|lizenz|jahresabo/.test(d)) return "software";
  if (/hotel|ticket|bahn|db |flug/.test(d)) return "reisekosten";
  if (/restaurant|essen|kaffee|bewirt/.test(d)) return "bewirtung";
  if (/finanzamt|ust|steuer/.test(d)) return "steuern";
  if (/allianz|versich|bhv|haftpflicht/.test(d)) return "versicherungen";
  if (/telekom|vodafone|o2|internet/.test(d)) return "telekommunikation";
  if (/papier|toner|büro|buero/.test(d)) return "buerobedarf";
  if (/re |rechnung|eingang|freelancer|kunden/.test(d)) return "einnahmen";
  return "sonstiges";
}

export function ImportView() {
  useLang();
  const [stage, setStage] = useState("idle");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState({ date: "date", desc: "desc", amount: "amount" });
  const [rows, setRows] = useState([]);
  const fileInputRef = useRef(null);

  const startUpload = (name) => {
    setFileName(name); setUploading(true); setProgress(0);
    let p = 0;
    const tick = () => {
      p += 8 + Math.random() * 12;
      if (p >= 100) {
        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          const prepared = MOCK_CSV_ROWS.map((r, i) => ({
            ...r, id: i, cat: autoCat(r.desc), include: true, confidence: 0.6 + Math.random() * 0.4,
          }));
          setRows(prepared); setStage("preview");
        }, 280);
        return;
      }
      setProgress(p); setTimeout(tick, 90);
    };
    setTimeout(tick, 80);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; startUpload(f?.name ?? "bank-export-april-2026.csv"); };
  const pickFile = () => fileInputRef.current?.click();
  const onFilePicked = (e) => { const f = e.target.files?.[0]; if (!f) return; startUpload(f.name); };
  const commit = () => setStage("committed");
  const reset = () => { setStage("idle"); setRows([]); setProgress(0); setFileName(""); };

  if (stage === "committed") return <SuccessScreen n={rows.filter(r => r.include).length} fileName={fileName} onReset={reset} />;
  if (stage === "preview") return <PreviewStep rows={rows} setRows={setRows} mapping={mapping} setMapping={setMapping} fileName={fileName} onBack={reset} onCommit={commit} />;

  return (
    <div className="anim-in grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Dropzone dragging={dragging} uploading={uploading} progress={progress} fileName={fileName}
          onPick={pickFile}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop} />
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFilePicked} />
      </div>
      <aside className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h3 className="text-[14px] font-semibold tracking-tight">{t("sources_title")}</h3>
        <p className="text-[12px] text-[var(--muted)] mt-1">{t("sources_sub")}</p>
        <ul className="mt-4 space-y-2.5">
          {["Sparkasse, CSV", "Deutsche Bank, CSV", "N26, CSV / XLSX", "Kontist, CSV", "DATEV, CSV", "Generic CSV"].map(s => (
            <li key={s} className="flex items-center gap-2.5 text-[13px]">
              <span className="h-6 w-6 rounded-md bg-[var(--surface2)] grid place-items-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>
              </span>{s}
            </li>
          ))}
        </ul>
        <div className="mt-5 pt-5 border-t border-[var(--line)]">
          <h4 className="text-[12px] font-semibold">{t("how_it_works")}</h4>
          <ol className="mt-2 space-y-2 text-[12.5px] text-[var(--muted)]">
            <li><span className="font-semibold text-[var(--fg)]">1.</span>&nbsp; {t("how_1")}</li>
            <li><span className="font-semibold text-[var(--fg)]">2.</span>&nbsp; {t("how_2")}</li>
            <li><span className="font-semibold text-[var(--fg)]">3.</span>&nbsp; {t("how_3")}</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Dropzone({ dragging, uploading, progress, fileName, onPick, onDragOver, onDragLeave, onDrop }) {
  return (
    <div onClick={!uploading ? onPick : undefined} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
         className={`relative rounded-2xl border-2 border-dashed p-10 md:p-14 text-center transition-all cursor-pointer overflow-hidden ${dragging ? "border-[var(--fg)] bg-[var(--surface2)]" : "border-[var(--line-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)]/60"}`}
         style={{ minHeight: 360 }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--fg) 1px, transparent 0)", backgroundSize: "18px 18px" }} />
      {!uploading ? (
        <div className="relative flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--surface2)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 18a4 4 0 0 1-.8-7.9 5 5 0 0 1 9.7-1.2 4.5 4.5 0 0 1 2.6 8.1"/>
              <path d="M12 12v9M8.5 15.5L12 12l3.5 3.5"/>
            </svg>
          </div>
          <div>
            <div className="text-[18px] font-semibold tracking-tight">{t("drop_title")}</div>
            <div className="text-[13px] text-[var(--muted)] mt-1.5">{t("drop_sub")}</div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="h-1 w-1 rounded-full bg-[var(--muted)]" /><span>{t("drop_p1")}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--muted)]" /><span>{t("drop_p2")}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--muted)]" /><span>{t("drop_p3")}</span>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--surface2)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-7 w-7 animate-spin" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3a9 9 0 1 1-6.4 2.6" /></svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold">{t("upload_progress", { f: fileName })}</div>
            <div className="text-[12px] text-[var(--muted)] mt-1 tabular-nums">
              {progress < 60 ? t("upload_reading") : progress < 95 ? t("upload_cat") : t("upload_done")}
            </div>
          </div>
          <div className="w-full max-w-md h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200" style={{ width: `${progress}%`, background: "var(--fg)" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewStep({ rows, setRows, mapping, setMapping, fileName, onBack, onCommit }) {
  const included = rows.filter(r => r.include);
  const totals = useMemo(() => {
    let inc = 0, exp = 0;
    for (const r of included) { if (r.amount > 0) inc += r.amount; else exp += Math.abs(r.amount); }
    return { inc, exp, net: inc - exp };
  }, [included.length]);

  const toggle = (id) => setRows(prev => prev.map(r => r.id === id ? { ...r, include: !r.include } : r));
  const changeCat = (id, cat) => setRows(prev => prev.map(r => r.id === id ? { ...r, cat, confidence: 1 } : r));

  return (
    <div className="anim-in">
      <Steps active={2} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold tracking-tight">{t("map_columns")}</h3>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">{t("from_file", { f: fileName })}</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--pos)]/15 text-[var(--pos)] font-medium">{t("auto_detected")}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ key: "date", label: t("col_date") }, { key: "desc", label: t("col_desc") }, { key: "amount", label: t("col_amount") }].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{f.label}</label>
                  <select value={mapping[f.key]} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                          className="mt-1 w-full h-9 px-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[13px] focus:outline-none focus:border-[var(--line-strong)]">
                    <option value="date">Buchungsdatum</option>
                    <option value="desc">Verwendungszweck</option>
                    <option value="amount">Umsatz</option>
                    <option value="iban">IBAN</option>
                    <option value="none">(ignore)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold tracking-tight">{t("preview_title")}</h3>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">{t("preview_sub", { n: included.length, t: rows.length })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setRows(prev => prev.map(r => ({ ...r, include: true })))} className="text-[12px] text-[var(--muted)] hover:text-[var(--fg)]">{t("select_all")}</button>
                <span className="text-[var(--muted)]">·</span>
                <button onClick={() => setRows(prev => prev.map(r => ({ ...r, include: false })))} className="text-[12px] text-[var(--muted)] hover:text-[var(--fg)]">{t("select_none")}</button>
              </div>
            </div>
            <div className="max-h-[52vh] overflow-auto">
              {rows.map((r, i) => (
                <div key={r.id}
                  className={`grid items-center gap-3 px-5 py-2.5 border-b border-[var(--line)] last:border-b-0 text-[13px] transition-colors ${r.include ? "" : "opacity-45"} hover:bg-[var(--surface2)]/50`}
                  style={{ gridTemplateColumns: "28px 92px 1fr 200px 120px", animation: `row-in 400ms ${i * 24}ms backwards cubic-bezier(.2,.7,.2,1)` }}>
                  <input type="checkbox" checked={r.include} onChange={() => toggle(r.id)} className="h-4 w-4 rounded border-[var(--line-strong)] accent-[var(--fg)]" />
                  <div className="tabular-nums text-[var(--muted)] text-[12px]">
                    {new Date(r.date).toLocaleDateString(getLang() === "de" ? "de-DE" : getLang() === "es" ? "es-ES" : "en-GB", { day: "2-digit", month: "short" })}
                  </div>
                  <div className="truncate font-medium">{r.desc}</div>
                  <div className="flex items-center gap-2">
                    <CatSelect value={r.cat} onChange={(v) => changeCat(r.id, v)} />
                    {r.confidence < 0.85 && <span title="Low confidence" className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--neg)]/15 text-[var(--neg)] font-medium whitespace-nowrap">?</span>}
                  </div>
                  <div className="text-right tabular-nums font-medium" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: r.amount > 0 ? "var(--pos)" : "var(--fg)" }}>
                    {r.amount > 0 ? "+" : "−"}{"€" + euroNum(Math.abs(r.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 h-fit lg:sticky lg:top-20">
          <h3 className="text-[14px] font-semibold tracking-tight">{t("summary")}</h3>
          <div className="mt-4 space-y-3">
            <SumRow label={t("income_total")} value={`+€${euroNum(totals.inc)}`} color="var(--pos)" />
            <SumRow label={t("expense_total")} value={`−€${euroNum(totals.exp)}`} color="var(--neg)" />
            <div className="h-px bg-[var(--line)] my-1" />
            <SumRow label={t("net_total")} value={`${totals.net >= 0 ? "+" : "−"}€${euroNum(Math.abs(totals.net))}`} color={totals.net >= 0 ? "var(--pos)" : "var(--neg)"} big />
          </div>
          <div className="mt-5 pt-5 border-t border-[var(--line)] space-y-2 text-[12px]">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--pos)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>
              {t("read_n", { n: rows.length })}
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--pos)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>
              {t("auto_cat_n", { n: rows.filter(r => r.confidence >= 0.85).length })}
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              {t("dup_n")}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={onCommit} className="h-11 rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 text-[13px] font-medium transition-opacity">
              {t("commit_n", { n: included.length })}
            </button>
            <button onClick={onBack} className="h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[13px] font-medium transition-colors">{t("cancel")}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CatSelect({ value, onChange }) {
  const color = catColor(value);
  return (
    <div className="relative flex-1 min-w-0">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-sm pointer-events-none" style={{ background: color }} />
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 pl-6 pr-7 rounded-full text-[12px] font-medium border appearance-none cursor-pointer focus:outline-none"
        style={{ background: `color-mix(in oklch, ${color}, transparent 85%)`, color, borderColor: `color-mix(in oklch, ${color}, transparent 70%)` }}>
        {CATEGORY_DEFS.filter(c => c.kind !== "summary").map(c => <option key={c.key} value={c.key}>{catLabel(c.key)}</option>)}
      </select>
      <svg viewBox="0 0 24 24" className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color }}><path d="M6 9l6 6 6-6"/></svg>
    </div>
  );
}

function SumRow({ label, value, color, big }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12.5px] text-[var(--muted)]">{label}</span>
      <span className={`tabular-nums ${big ? "text-[18px] font-semibold" : "text-[13px] font-medium"}`} style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color }}>{value}</span>
    </div>
  );
}

function Steps({ active }) {
  const items = [{ n: 1, label: t("step_upload") }, { n: 2, label: t("step_map") }, { n: 3, label: t("step_commit") }];
  return (
    <div className="flex items-center gap-2">
      {items.map((it, i) => {
        const done = it.n < active, current = it.n === active;
        return (
          <React.Fragment key={it.n}>
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full grid place-items-center text-[11px] font-semibold tabular-nums transition-all ${done ? "bg-[var(--pos)] text-[var(--bg)]" : current ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-[var(--surface2)] text-[var(--muted)]"}`}>
                {done ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg> : it.n}
              </div>
              <span className={`text-[12.5px] ${current ? "font-medium" : "text-[var(--muted)]"}`}>{it.label}</span>
            </div>
            {i < items.length - 1 && <div className="h-px bg-[var(--line)] flex-1 min-w-8 max-w-16" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SuccessScreen({ n, fileName, onReset }) {
  return (
    <div className="anim-in flex items-center justify-center py-16">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center max-w-md w-full">
        <div className="mx-auto h-14 w-14 rounded-full bg-[var(--pos)]/15 grid place-items-center">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--pos)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-10"/></svg>
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-tight">{t("imp_done_title")}</h3>
        <p className="text-[13px] text-[var(--muted)] mt-2">{t("imp_done_sub", { n, f: fileName })}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={onReset} className="h-10 px-4 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[13px] font-medium transition-colors">{t("imp_again")}</button>
        </div>
      </div>
    </div>
  );
}
