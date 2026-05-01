const DEFAULT_OWNER_ID = "77ad10a6-1d73-4201-9e81-e6be996d130a";

function getEnv(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sbUrl = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
  const sbKey = getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("SUPABASE_SERVICE_KEY");
  const ownerId = getEnv("CFO_OWNER_ID") || DEFAULT_OWNER_ID;
  if (!sbUrl || !sbKey) {
    return res.status(503).json({ error: "Supabase env missing" });
  }

  const qs = new URLSearchParams({
    select:
      "id,owner_id,conversation_id,created_at,transaction_date,merchant,total_amount,currency,vat_amount,category,is_business_expense,tax_relevant,payment_method,free_tags,drive_url",
    owner_id: `eq.${ownerId}`,
    order: "created_at.desc",
    limit: "300",
  });

  try {
    const r = await fetch(`${sbUrl}/rest/v1/cfo_transactions?${qs.toString()}`, {
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
      },
    });
    if (!r.ok) {
      const body = await r.text();
      return res.status(500).json({ error: `supabase query failed (${r.status})`, body });
    }
    const data = await r.json();
    return res.status(200).json({ ok: true, rows: Array.isArray(data) ? data : [] });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "cfo feed failed" });
  }
}

