import { useEffect, useMemo, useState } from "react";

function parseCsv(text) {
  const rows = [];
  let cell = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function asNumber(value) {
  if (!value) return null;
  const normalized = String(value).replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCategory(input) {
  const raw = String(input || "").trim();
  if (!raw) return "other";
  return raw;
}

function labelCategory(raw) {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function sheetCsvUrl(sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Transactions`;
}

export function useLiveCfoFeed() {
  const sheetId = import.meta.env.VITE_CFO_SHEET_ID;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let disposed = false;
    if (!sheetId) return;
    setLoading(true);
    setError(null);
    fetch(sheetCsvUrl(sheetId))
      .then(async (res) => {
        if (!res.ok) throw new Error(`sheet fetch failed (${res.status})`);
        return res.text();
      })
      .then((csvText) => {
        if (disposed) return;
        const parsed = parseCsv(csvText);
        const records = parsed
          .map((r) => ({
            transactionDate: r[0] || null,
            merchant: r[1] || null,
            totalAmount: asNumber(r[2]),
            vatAmount: asNumber(r[3]),
            category: normalizeCategory(r[4]),
            isBusinessExpense: (r[5] || "").toLowerCase() === "ja",
            taxRelevant: (r[6] || "").toLowerCase() === "ja",
            paymentMethod: r[7] || null,
            freeTags: r[8] ? String(r[8]).split(",").map((t) => t.trim()).filter(Boolean) : [],
            driveUrl: r[9] || null,
            whatsanimaUrl: r[10] || null,
          }))
          .filter((x) => {
            const merchantLower = String(x.merchant || "").trim().toLowerCase();
            const categoryLower = String(x.category || "").trim().toLowerCase();
            if (merchantLower === "merchant" && categoryLower === "category") return false;
            return true;
          })
          .filter((x) => x.merchant || x.totalAmount != null);
        setRows(records);
      })
      .catch((err) => {
        if (disposed) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
    };
  }, [sheetId]);

  const summary = useMemo(() => {
    if (!rows.length) {
      return {
        totalRows: 0,
        totalSpend30d: 0,
        topCategories: [],
      };
    }
    const now = Date.now();
    const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    let totalSpend30d = 0;
    const categoryTotals = new Map();
    for (const row of rows) {
      const amount = Number(row.totalAmount || 0);
      const when = row.transactionDate ? Date.parse(row.transactionDate) : NaN;
      if (Number.isFinite(when) && when >= cutoff && amount > 0) totalSpend30d += amount;
      const key = row.category || "other";
      categoryTotals.set(key, (categoryTotals.get(key) || 0) + Math.max(0, amount));
    }
    const topCategories = [...categoryTotals.entries()]
      .map(([key, amount]) => ({ key, label: labelCategory(key), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
    return {
      totalRows: rows.length,
      totalSpend30d,
      topCategories,
    };
  }, [rows]);

  return {
    enabled: Boolean(sheetId),
    loading,
    error,
    rows,
    summary,
  };
}
