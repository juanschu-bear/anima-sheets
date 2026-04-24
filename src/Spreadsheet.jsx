// Spreadsheet view, locale-aware.
import React, { useState, useEffect, useMemo, useRef } from "react";
import { t, useLang, tRow, tSheetName, getLang } from "./i18n.js";
import { CATEGORY_DEFS, catColor, catLabel, SHEETS, euroNum } from "./data.js";

const STATUS_HUES = { cleared: 145, pending: 58, draft: 240 };

function columnDefs() {
  return [
    { key: "date",         label: t("col_date"),         width: 110, type: "date" },
    { key: "desc",         label: t("col_desc"),         width: 240, type: "text" },
    { key: "counterparty", label: t("col_counterparty"), width: 180, type: "text" },
    { key: "cat",          label: t("col_cat"),          width: 190, type: "cat" },
    { key: "payment",      label: t("col_payment"),      width: 120, type: "payment" },
    { key: "ref",          label: t("col_ref"),          width: 120, type: "text" },
    { key: "vat",          label: t("col_vat"),          width: 80,  type: "vat" },
    { key: "status",       label: t("col_status"),       width: 110, type: "status" },
    { key: "note",         label: t("col_note"),         width: 180, type: "text" },
    { key: "amount",       label: t("col_amount"),       width: 130, type: "amount" },
  ];
}

const EMPTY_ROW = () => ({
  id: Math.random().toString(36).slice(2, 9),
  date: new Date().toISOString().slice(0, 10),
  desc: "", counterparty: "", cat: "", payment: "card", ref: "", vat: 19,
  status: "draft", note: "", amount: 0,
});

// Prepare a "desc"/"note" field when entering the spreadsheet so edits stay stable.
function materializeRow(r) {
  const resolved = tRow(r);
  return {
    ...r,
    desc: r.desc || resolved.desc || "",
    note: r.note ?? resolved.note ?? "",
  };
}

export function Spreadsheet() {
  useLang();
  const [sheets, setSheets] = useState(() =>
    SHEETS.map(s => ({ id: s.id, name: tSheetName(s), rows: s.rows.map(materializeRow) }))
  );
  const [activeId, setActiveId] = useState(sheets[0].id);
  const [edit, setEdit] = useState(null);
  const [selected, setSelected] = useState({ rowIdx: 0, colIdx: 0 });
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState(null);

  const activeSheet = sheets.find(s => s.id === activeId) || sheets[0];
  const rows = activeSheet.rows;
  const COLUMNS = columnDefs();

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(r =>
      (r.desc || "").toLowerCase().includes(q) ||
      (r.note ?? "").toLowerCase().includes(q) ||
      (r.counterparty ?? "").toLowerCase().includes(q) ||
      catLabel(r.cat).toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totals = useMemo(() => {
    let inc = 0, exp = 0;
    for (const r of filtered) {
      if (r.amount > 0) inc += r.amount;
      else exp += Math.abs(r.amount);
    }
    return { inc, exp, net: inc - exp, count: filtered.length };
  }, [filtered]);

  const updateRows = (fn) =>
    setSheets(prev => prev.map(s => s.id === activeId ? { ...s, rows: fn(s.rows) } : s));
  const updateCell = (rowId, col, value) =>
    updateRows(rr => rr.map(r => r.id === rowId ? { ...r, [col]: value } : r));
  const addRow = () => {
    updateRows(rr => [EMPTY_ROW(), ...rr]);
    setSelected({ rowIdx: 0, colIdx: 0 });
    setTimeout(() => setEdit({ rowIdx: 0, colIdx: 1 }), 80);
  };
  const deleteRow = (id) => updateRows(rr => rr.filter(r => r.id !== id));

  const addSheet = () => {
    const id = "sheet-" + Math.random().toString(36).slice(2, 7);
    setSheets(prev => [...prev, { id, name: "Untitled " + (prev.length + 1), rows: [] }]);
    setActiveId(id);
    setTimeout(() => setRenaming(id), 50);
  };
  const renameSheet = (id, name) =>
    setSheets(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  const duplicateSheet = (id) => {
    const src = sheets.find(s => s.id === id);
    if (!src) return;
    const newId = "sheet-" + Math.random().toString(36).slice(2, 7);
    setSheets(prev => [...prev, { id: newId, name: src.name + " (copy)", rows: src.rows.map(r => ({ ...r, id: Math.random().toString(36).slice(2, 9) })) }]);
    setActiveId(newId);
  };
  const deleteSheet = (id) => {
    if (sheets.length <= 1) return;
    setSheets(prev => prev.filter(s => s.id !== id));
    if (id === activeId) setActiveId(sheets.find(s => s.id !== id).id);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (edit) return;
      if (document.activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
      const maxRow = filtered.length - 1, maxCol = COLUMNS.length - 1;
      let { rowIdx, colIdx } = selected;
      if (e.key === "ArrowDown")       { e.preventDefault(); rowIdx = Math.min(maxRow, rowIdx + 1); }
      else if (e.key === "ArrowUp")    { e.preventDefault(); rowIdx = Math.max(0, rowIdx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); colIdx = Math.min(maxCol, colIdx + 1); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); colIdx = Math.max(0, colIdx - 1); }
      else if (e.key === "Enter")      { e.preventDefault(); setEdit({ rowIdx, colIdx }); return; }
      else if (e.key === "Tab")        { e.preventDefault(); colIdx = e.shiftKey ? Math.max(0, colIdx - 1) : Math.min(maxCol, colIdx + 1); }
      else return;
      setSelected({ rowIdx, colIdx });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, edit, filtered.length]);

  const totalWidth = COLUMNS.reduce((s, c) => s + c.width, 0) + 48 + 48;

  return (
    <div className="anim-in">
      <SheetTabs sheets={sheets} activeId={activeId} setActiveId={setActiveId}
        renaming={renaming} setRenaming={setRenaming} onRename={renameSheet}
        onAdd={addSheet} onDuplicate={duplicateSheet} onDelete={deleteSheet} />
      <Toolbar query={query} setQuery={setQuery} onAdd={addRow} />
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden relative">
        <div className="overflow-auto" style={{ maxHeight: "62vh" }}>
          <div className="grid text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] font-medium border-b border-[var(--line)] bg-[var(--surface2)]/70 backdrop-blur sticky top-0 z-20"
               style={{ gridTemplateColumns: `48px ${COLUMNS.map(c => `${c.width}px`).join(" ")} 48px`, minWidth: totalWidth }}>
            <div className="px-3 py-2.5 text-center">#</div>
            {COLUMNS.map(c => (
              <div key={c.key} className={`px-3 py-2.5 ${c.type === "amount" || c.type === "vat" ? "text-right" : ""}`}>{c.label}</div>
            ))}
            <div />
          </div>
          {filtered.length === 0 && <div className="py-16 text-center text-[var(--muted)] text-[13px]">{t("no_results")}</div>}
          {filtered.map((row, rowIdx) => (
            <Row key={row.id} row={row} rowIdx={rowIdx} columns={COLUMNS} totalWidth={totalWidth}
              selected={selected} setSelected={setSelected} edit={edit} setEdit={setEdit}
              updateCell={updateCell} onDelete={() => deleteRow(row.id)} />
          ))}
        </div>
        <div className="grid border-t border-[var(--line)] bg-[var(--surface2)]/60 text-[12px]"
             style={{ gridTemplateColumns: `48px 1fr 130px 48px`, minWidth: totalWidth }}>
          <div />
          <div className="px-3 py-2.5 text-[var(--muted)]">
            {t("rows_count", { n: totals.count })}
            {" · "}{t("income_total")}{" "}
            <span className="font-semibold text-[var(--pos)] tabular-nums">{"€" + euroNum(totals.inc)}</span>
            {" · "}{t("expense_total")}{" "}
            <span className="font-semibold text-[var(--neg)] tabular-nums">{"€" + euroNum(totals.exp)}</span>
          </div>
          <div className="px-3 py-2.5 text-right tabular-nums font-semibold"
               style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: totals.net >= 0 ? "var(--pos)" : "var(--neg)" }}>
            {totals.net >= 0 ? "+" : "−"}{"€" + euroNum(Math.abs(totals.net))}
          </div>
          <div />
        </div>
      </div>
      <div className="mt-3 text-[11.5px] text-[var(--muted)] flex items-center gap-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>←</Kbd><Kbd>→</Kbd> {t("kbd_navigate")}</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>Enter</Kbd> {t("kbd_edit")}</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>Tab</Kbd> {t("kbd_next_cell")}</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>Esc</Kbd> {t("kbd_cancel")}</span>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return <kbd className="px-1.5 py-0.5 rounded border border-[var(--line-strong)] bg-[var(--surface)] text-[10.5px] font-medium tabular-nums">{children}</kbd>;
}

function SheetTabs({ sheets, activeId, setActiveId, renaming, setRenaming, onRename, onAdd, onDuplicate, onDelete }) {
  return (
    <div className="flex items-end gap-1 mb-4 border-b border-[var(--line)] overflow-x-auto scrollbar-none">
      {sheets.map(s => {
        const active = s.id === activeId;
        return (
          <div key={s.id} className="relative group">
            <button onClick={() => setActiveId(s.id)} onDoubleClick={() => setRenaming(s.id)}
              className={`relative flex items-center gap-2 px-3.5 h-9 rounded-t-lg text-[12.5px] font-medium transition-all border border-b-0 ${active ? "bg-[var(--surface)] border-[var(--line)] text-[var(--fg)]" : "bg-transparent border-transparent text-[var(--muted)] hover:text-[var(--fg)]"}`}>
              <span className="h-1.5 w-1.5 rounded-full transition-all" style={{ background: active ? "var(--pos)" : "var(--line-strong)" }} />
              {renaming === s.id ? (
                <input autoFocus defaultValue={s.name}
                  onBlur={(e) => { onRename(s.id, e.target.value || s.name); setRenaming(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { onRename(s.id, e.target.value || s.name); setRenaming(null); }
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent focus:outline-none min-w-0 w-28" />
              ) : (<span>{s.name}</span>)}
              <span className="text-[10px] text-[var(--muted)] tabular-nums">{s.rows.length}</span>
              {active && <span className="absolute -bottom-px left-2 right-2 h-px bg-[var(--surface)]" />}
            </button>
            {active && sheets.length > 1 && (
              <SheetMenu onRename={() => setRenaming(s.id)} onDuplicate={() => onDuplicate(s.id)} onDelete={() => onDelete(s.id)} />
            )}
          </div>
        );
      })}
      <button onClick={onAdd} className="h-9 w-9 grid place-items-center rounded-t-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface2)] transition-colors" title={t("sheet_new")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  );
}

function SheetMenu({ onRename, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute right-1 top-1.5 z-10">
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="h-6 w-6 grid place-items-center rounded text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface2)]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 rounded-lg border border-[var(--line-strong)] bg-[var(--bg)] shadow-xl p-1 z-40 anim-in-fast">
            <MenuItem onClick={() => { onRename(); setOpen(false); }}>{t("sheet_rename")}</MenuItem>
            <MenuItem onClick={() => { onDuplicate(); setOpen(false); }}>{t("sheet_duplicate")}</MenuItem>
            <div className="h-px bg-[var(--line)] my-1" />
            <MenuItem danger onClick={() => { onDelete(); setOpen(false); }}>{t("sheet_delete")}</MenuItem>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-2.5 py-1.5 rounded text-[12px] transition-colors ${danger ? "text-[var(--neg)] hover:bg-[var(--neg)]/10" : "hover:bg-[var(--surface2)]"}`}>
      {children}
    </button>
  );
}

function Toolbar({ query, setQuery, onAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-1 max-w-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" strokeLinecap="round"/></svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={t("search_placeholder")}
            className="w-full h-10 pl-9 pr-3 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[13px] focus:outline-none focus:border-[var(--line-strong)] transition-colors" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[13px] font-medium transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          {t("filter")}
        </button>
        <button className="inline-flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[13px] font-medium transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v12M6 9l6 6 6-6M4 21h16"/></svg>
          {t("export_")}
        </button>
        <button onClick={onAdd} className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 text-[13px] font-medium transition-opacity">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          {t("new_row")}
        </button>
      </div>
    </div>
  );
}

function Row({ row, rowIdx, columns, totalWidth, selected, setSelected, edit, setEdit, updateCell, onDelete }) {
  return (
    <div className="grid border-b border-[var(--line)] hover:bg-[var(--surface2)]/40 transition-colors group"
      style={{ gridTemplateColumns: `48px ${columns.map(c => `${c.width}px`).join(" ")} 48px`, minWidth: totalWidth,
               animation: `row-in 320ms ${rowIdx * 14}ms backwards cubic-bezier(.2,.7,.2,1)` }}>
      <div className="px-3 py-0 text-[11px] text-[var(--muted)] tabular-nums grid place-items-center">{rowIdx + 1}</div>
      {columns.map((col, colIdx) => (
        <Cell key={col.key} col={col} row={row}
          isSelected={selected.rowIdx === rowIdx && selected.colIdx === colIdx}
          isEditing={edit?.rowIdx === rowIdx && edit?.colIdx === colIdx}
          onSelect={() => setSelected({ rowIdx, colIdx })}
          onEditStart={() => setEdit({ rowIdx, colIdx })}
          onEditEnd={() => setEdit(null)}
          onChange={(v) => updateCell(row.id, col.key, v)} />
      ))}
      <div className="grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDelete} className="h-7 w-7 grid place-items-center rounded hover:bg-[var(--neg)]/15 text-[var(--muted)] hover:text-[var(--neg)] transition-colors" aria-label={t("kbd_delete")}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
        </button>
      </div>
    </div>
  );
}

function Cell({ col, row, isSelected, isEditing, onSelect, onEditStart, onEditEnd, onChange }) {
  const value = row[col.key];
  const inputRef = useRef(null);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) inputRef.current.select();
    }
  }, [isEditing]);

  const align = col.type === "amount" || col.type === "vat" ? "text-right tabular-nums" : "";
  const base = `relative px-3 py-2.5 text-[13px] cursor-cell min-w-0 ${align}`;
  const ring = isSelected ? "outline outline-2 outline-[var(--fg)] outline-offset-[-2px] z-10 bg-[var(--bg)]" : "";

  if (!isEditing) {
    return (
      <div className={`${base} ${ring}`} onClick={onSelect} onDoubleClick={onEditStart} tabIndex={-1}>
        <CellDisplay col={col} value={value} row={row} />
      </div>
    );
  }

  const commit = (v) => { onChange(v); onEditEnd(); };
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onEditEnd(); }
    else if (e.key === "Enter" && col.type !== "cat" && col.type !== "status" && col.type !== "payment") { e.preventDefault(); commit(e.target.value); }
  };

  if (col.type === "cat" || col.type === "status" || col.type === "payment") {
    const options =
      col.type === "cat"
        ? CATEGORY_DEFS.filter(c => c.kind !== "summary").map(c => ({ value: c.key, label: catLabel(c.key) }))
        : col.type === "status"
        ? [["cleared", t("status_cleared")], ["pending", t("status_pending")], ["draft", t("status_draft")]].map(([v, l]) => ({ value: v, label: l }))
        : [["sepa", t("pay_sepa")], ["card", t("pay_card")], ["cash", t("pay_cash")], ["paypal", t("pay_paypal")], ["transfer", t("pay_transfer")]].map(([v, l]) => ({ value: v, label: l }));
    return (
      <div className={`${base} ${ring} p-0`}>
        <select ref={inputRef} value={value || ""} onChange={(e) => commit(e.target.value)} onBlur={() => onEditEnd()} onKeyDown={onKey}
                className="w-full h-full px-3 py-2.5 bg-transparent text-[13px] focus:outline-none appearance-none cursor-pointer">
          <option value="">—</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  if (col.type === "amount" || col.type === "vat") {
    return (
      <div className={`${base} ${ring} p-0`}>
        <input ref={inputRef} type="number" step={col.type === "vat" ? "1" : "0.01"} defaultValue={value}
          onBlur={(e) => commit(parseFloat(e.target.value) || 0)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); onEditEnd(); }
            else if (e.key === "Enter") { e.preventDefault(); commit(parseFloat(e.target.value) || 0); }
          }}
          className="w-full h-full px-3 py-2.5 bg-transparent text-[13px] tabular-nums focus:outline-none text-right"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }} />
      </div>
    );
  }

  return (
    <div className={`${base} ${ring} p-0`}>
      <input ref={inputRef} type={col.type === "date" ? "date" : "text"} defaultValue={value}
        onBlur={(e) => commit(e.target.value)} onKeyDown={onKey}
        className="w-full h-full px-3 py-2.5 bg-transparent text-[13px] focus:outline-none" />
    </div>
  );
}

function CellDisplay({ col, value }) {
  if (col.type === "cat") {
    if (!value) return <span className="text-[var(--muted)]">—</span>;
    const color = catColor(value);
    return (
      <span className="inline-flex items-center gap-1.5 min-w-0">
        <span className="h-2 w-2 rounded-sm flex-shrink-0" style={{ background: color }} />
        <span className="text-[12px] font-medium px-1.5 py-0.5 rounded truncate"
              style={{ background: `color-mix(in oklch, ${color}, transparent 85%)`, color }}>
          {catLabel(value)}
        </span>
      </span>
    );
  }
  if (col.type === "status") {
    const color = `oklch(0.72 0.14 ${STATUS_HUES[value] ?? 280})`;
    const labels = { cleared: t("status_cleared"), pending: t("status_pending"), draft: t("status_draft") };
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 relative" style={{ background: color }}>
          {value === "pending" && <span className="absolute inset-0 rounded-full animate-ping opacity-70" style={{ background: color }} />}
        </span>
        <span className="text-[11.5px] font-medium" style={{ color }}>{labels[value] || value}</span>
      </span>
    );
  }
  if (col.type === "payment") {
    const labels = { sepa: t("pay_sepa"), card: t("pay_card"), cash: t("pay_cash"), paypal: t("pay_paypal"), transfer: t("pay_transfer") };
    return <span className="text-[12px] text-[var(--muted)]">{labels[value] || "—"}</span>;
  }
  if (col.type === "vat") {
    if (value == null || value === 0) return <span className="text-[var(--muted)]">0%</span>;
    return <span className="tabular-nums text-[var(--muted)]">{value}%</span>;
  }
  if (col.type === "amount") {
    const pos = value > 0;
    return (
      <span style={{ color: pos ? "var(--pos)" : value < 0 ? "var(--fg)" : "var(--muted)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 500 }}>
        {pos ? "+" : value < 0 ? "−" : ""}{"€" + euroNum(Math.abs(value))}
      </span>
    );
  }
  if (col.type === "date") {
    if (!value) return <span className="text-[var(--muted)]">—</span>;
    const d = new Date(value);
    return (
      <span className="tabular-nums text-[var(--muted)]">
        {d.toLocaleDateString(getLang() === "de" ? "de-DE" : getLang() === "es" ? "es-ES" : "en-GB",
          { day: "2-digit", month: "short", year: "2-digit" })}
      </span>
    );
  }
  if (!value) return <span className="text-[var(--muted)]">—</span>;
  return <span className="truncate block">{value}</span>;
}
