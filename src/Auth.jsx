import React, { useState, useEffect, useCallback } from "react";
import { t, useLang, setLang } from "./i18n.js";
import { supabase, isSupabaseConfigured } from "./supabase.js";
import { consumeSsoFromUrl } from "./sso.js";

function avatarFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `oklch(0.72 0.13 ${hue})`;
}

export function initialsFor(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapUser(user) {
  if (!user) return null;
  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  return {
    id: user.id,
    name,
    email: user.email || "",
    provider: "supabase",
    color: avatarFor(user.email || user.id || name),
  };
}

export function useAuth() {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await consumeSsoFromUrl();
        if (!configured) {
          setLoading(false);
          return;
        }
        const { data } = await supabase.auth.getSession();
        setSession(data.session || null);
        setUser(mapUser(data.session?.user || null));
      } finally {
        setLoading(false);
      }
    })();
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setUser(mapUser(nextSession?.user || null));
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [configured]);

  const signIn = useCallback(async ({ email, password, mode = "signin", name }) => {
    if (!configured) {
      return { ok: false, error: "Missing Supabase config" };
    }
    if (!email || !password) {
      return { ok: false, error: "Email and password are required" };
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || email.split("@")[0] },
        },
      });
      return { ok: !error, error: error?.message || null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { ok: !error, error: error?.message || null };
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    await supabase.auth.signOut();
  }, [configured]);

  return { session, user, signIn, signOut, loading, configured };
}

export function AuthGate({ onSignIn }) {
  useLang();
  const [step, setStep] = useState("idle");
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStep("loading");
    const result = await onSignIn({
      name: name.trim(),
      email: email.trim(),
      password,
      mode,
    });
    if (!result?.ok) {
      setError(result?.error || "Authentication failed");
      setStep("idle");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="grid-fade" />
      </div>
      <div className="relative z-10 w-full max-w-[420px] mx-4 anim-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[var(--fg)] text-[var(--bg)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M5 19 L12 5 L19 19" /><path d="M8 14 H16" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight text-[17px]">Anima Sheets</span>
            <span className="text-[var(--muted)] text-[12px]">, CFO</span>
          </div>
          <div className="ml-auto"><LangMini /></div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-2xl">
          <h1 className="text-[22px] leading-tight font-semibold tracking-tight">{mode === "signin" ? "Sign in to Anima Sheets" : "Create your Anima Sheets account"}</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1.5">Unified ecosystem login for Drive, Sheets and WhatsAnima.</p>
          {step === "loading" ? (
            <div className="mt-8 mb-4 flex flex-col items-center justify-center gap-3 py-6">
              <LoaderRing />
              <div className="text-[13px] text-[var(--muted)]">{t("auth_checking")}</div>
            </div>
          ) : (
            <form onSubmit={onEmailSubmit} className="mt-6 grid gap-2.5">
              {mode === "signup" && (
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("auth_name")}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" required
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--fg)] outline-none text-[13px] transition-colors" />
                </label>
              )}
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("auth_email")}</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required
                  className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--fg)] outline-none text-[13px] transition-colors" />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Password</span>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required
                  className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--fg)] outline-none text-[13px] transition-colors" />
              </label>
              {error ? <p className="text-sm text-[var(--neg)]">{error}</p> : null}
              <button type="submit" className="mt-1 h-10 rounded-lg bg-[var(--fg)] text-[var(--bg)] font-medium text-[13px] hover:opacity-90 transition-opacity">
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="h-10 rounded-lg border border-[var(--line)] text-[13px]">
                {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function LoaderRing() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 animate-spin" style={{ animationDuration: "900ms" }}>
      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="3" />
      <path d="M20 4 a16 16 0 0 1 16 16" fill="none" stroke="var(--fg)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LangMini() {
  const current = useLang();
  const order = ["en", "de", "es"];
  return (
    <div className="inline-flex items-center gap-0.5 text-[10px] font-semibold tracking-wider text-[var(--muted)]">
      {order.map((c, i) => (
        <React.Fragment key={c}>
          <button onClick={() => setLang(c)} className={`px-1.5 py-1 rounded transition-colors ${current === c ? "text-[var(--fg)]" : "hover:text-[var(--fg)]"}`}>{c.toUpperCase()}</button>
          {i < order.length - 1 && <span className="text-[var(--line-strong)]">|</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ProfileMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const initials = initialsFor(user.name);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="h-9 w-9 rounded-full grid place-items-center font-semibold text-[11px] text-white transition-transform hover:scale-105"
        style={{ background: user.color, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        aria-label="Account menu">
        {initials}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] shadow-2xl p-1.5 z-40 anim-in-fast">
            <div className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-full grid place-items-center text-[13px] font-semibold text-white flex-shrink-0"
                style={{ background: user.color, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold tracking-tight truncate">{user.name}</div>
                <div className="text-[11px] text-[var(--muted)] truncate">{user.email}</div>
              </div>
            </div>
            <div className="h-px bg-[var(--line)] my-1" />
            <button onClick={() => { setOpen(false); onSignOut(); }} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] text-[var(--neg)] hover:bg-[color-mix(in_oklch,var(--neg),transparent_88%)]">
              {t("auth_signout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
