import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { getEnv } from "./_env.js";

const DEFAULT_OWNER_ID = "77ad10a6-1d73-4201-9e81-e6be996d130a";

function getHeader(req: any, name: string): string {
  const raw = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  if (Array.isArray(raw)) return String(raw[0] || "");
  return String(raw || "");
}

async function resolveOwnerFromAuth(req: any, sbUrl: string, anonKey: string): Promise<string | null> {
  const auth = getHeader(req, "authorization");
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  const userSb = createClient(sbUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userSb.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return data.user.id;
}

async function resolveOwnerFromApiKey(req: any, sbUrl: string, serviceKey: string): Promise<string | null> {
  const key = getHeader(req, "x-anima-api-key").trim();
  if (!key) return null;
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const admin = createClient(sbUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin
    .from("ad_api_keys")
    .select("id,user_id,scopes,revoked_at")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .maybeSingle();
  if (error || !data?.user_id) return null;
  const scopes = Array.isArray(data.scopes) ? data.scopes : [];
  if (!scopes.includes("sheets:read")) return null;
  await admin
    .from("ad_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);
  return data.user_id;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sbUrl = getEnv("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const sbAnon = getEnv("SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const sbKey = getEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY");
  if (!sbUrl || !sbKey) {
    return res.status(503).json({ error: "Supabase env missing" });
  }
  const ownerFromAuth = sbAnon ? await resolveOwnerFromAuth(req, sbUrl, sbAnon) : null;
  const ownerFromApiKey = await resolveOwnerFromApiKey(req, sbUrl, sbKey);
  const ownerId = ownerFromAuth || ownerFromApiKey || getEnv("CFO_OWNER_ID") || DEFAULT_OWNER_ID;

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
