import { useEffect, useMemo, useState } from "react";

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

export function useLiveCfoFeed() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let disposed = false;
    setLoading(true);
    setError(null);
    fetch("/api/cfo-feed")
      .then(async (res) => {
        if (!res.ok) throw new Error(`cfo feed failed (${res.status})`);
        return res.json();
      })
      .then((payload) => {
        if (disposed) return;
        const records = ((payload && payload.rows) || [])
          .map((r) => ({
            transactionDate: r.transaction_date || null,
            merchant: r.merchant || null,
            totalAmount: asNumber(r.total_amount),
            vatAmount: asNumber(r.vat_amount),
            category: normalizeCategory(r.category),
            isBusinessExpense: Boolean(r.is_business_expense),
            taxRelevant: Boolean(r.tax_relevant),
            paymentMethod: r.payment_method || null,
            freeTags: Array.isArray(r.free_tags) ? r.free_tags.filter(Boolean) : [],
            driveUrl: r.drive_url || null,
            whatsanimaUrl: r.conversation_id ? `/chat/${r.conversation_id}` : null,
          }))
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
  }, []);

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
    enabled: true,
    loading,
    error,
    rows,
    summary,
  };
}
