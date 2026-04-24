// Auth components for Anima Sheets.
import React, { useState, useEffect, useCallback } from "react";
import { t, useLang, setLang } from "./i18n.js";

const STORAGE_KEY = "anima_sheets_session_v1";

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

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u || !u.name || !u.email) return null;
    return u;
  } catch {
    return null;
  }
}

function saveSession(u) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {} }
function clearSession() { try { localStorage.removeItem(STORAGE_KEY); } catch {} }

export function useAuth() {
  const [user, setUser] = useState(() => loadSession());
  const signIn = useCallback((u) => {
    const full = {
      name: u.name,
      email: u.email,
      provider: u.provider || "email",
      color: avatarFor(u.email || u.name),
      since: Date.now(),
    };
    saveSession(full);
    setUser(full);
  }, []);
  const signOut = useCallback(() => { clearSession(); setUser(null); }, []);
  return { user, signIn, signOut };
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.44 2.16-1.16 2.93-.82.88-2.13 1.56-3.24 1.47-.13-1.11.43-2.27 1.14-3.02.8-.85 2.18-1.5 3.26-1.51v.13zM20.92 17.27c-.58 1.33-.85 1.93-1.59 3.11-1.04 1.63-2.5 3.66-4.31 3.68-1.61.02-2.03-1.04-4.21-1.03-2.18.01-2.64 1.05-4.25 1.03-1.81-.02-3.19-1.85-4.23-3.48C-.27 16.84-.58 10.93 2.14 7.84 4.11 5.6 7.03 4.83 9.47 4.83c1.74 0 3.36.96 4.74.96 1.35 0 3.2-1 5.3-1 .8 0 3.1.04 4.58 2.37-4.01 2.2-3.34 7.95-.17 10.11z"/>
    </svg>
  );
}
function MicrosoftGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <rect x="1"  y="1"  width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1"  width="10" height="10" fill="#7FBA00"/>
      <rect x="1"  y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

export function AuthGate({ onSignIn }) {
  useLang();
  const [step, setStep] = useState("idle");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const finish = (provider, nm, em) => {
    setStep("loading");
    setTimeout(() => onSignIn({ name: nm, email: em, provider }), 1100);
  };
  const onSocial = (provider) => {
    const DEMO = {
      google:    { name: "Lena Weiss", email: "lena.weiss@animasheets.io" },
      apple:     { name: "Lena Weiss", email: "lena.weiss@icloud.com" },
      microsoft: { name: "Lena Weiss", email: "lena.weiss@outlook.com" },
    };
    const d = DEMO[provider];
    finish(provider, d.name, d.email);
  };
  const onEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    finish("email", name.trim(), email.trim());
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
          <h1 className="text-[22px] leading-tight font-semibold tracking-tight">{t("auth_title")}</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1.5">{t("auth_sub")}</p>
          {step === "loading" ? (
            <div className="mt-8 mb-4 flex flex-col items-center justify-center gap-3 py-6">
              <LoaderRing />
              <div className="text-[13px] text-[var(--muted)]">{t("auth_checking")}</div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-2">
                <SocialButton onClick={() => onSocial("google")} glyph={<GoogleGlyph />} label={t("auth_google")} />
                <SocialButton onClick={() => onSocial("apple")} glyph={<AppleGlyph />} label={t("auth_apple")} />
                <SocialButton onClick={() => onSocial("microsoft")} glyph={<MicrosoftGlyph />} label={t("auth_microsoft")} />
              </div>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                <div className="h-px flex-1 bg-[var(--line)]" /><span>{t("auth_or")}</span><div className="h-px flex-1 bg-[var(--line)]" />
              </div>
              <form onSubmit={onEmailSubmit} className="grid gap-2.5">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("auth_name")}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" required
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--fg)] outline-none text-[13px] transition-colors" />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">{t("auth_email")}</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="name@studio.com"
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line)] focus:border-[var(--fg)] outline-none text-[13px] transition-colors" />
                </label>
                <button type="submit" className="mt-1 h-10 rounded-lg bg-[var(--fg)] text-[var(--bg)] font-medium text-[13px] hover:opacity-90 transition-opacity">
                  {t("auth_continue")}
                </button>
              </form>
            </>
          )}
          <p className="mt-5 text-[11px] text-[var(--muted)] leading-relaxed">{t("auth_privacy")}</p>
        </div>
      </div>
    </div>
  );
}

function SocialButton({ onClick, glyph, label }) {
  return (
    <button onClick={onClick} type="button"
      className="h-10 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--surface2)] transition-colors inline-flex items-center justify-center gap-2.5 text-[13px] font-medium">
      {glyph}<span>{label}</span>
    </button>
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
            <MenuItem icon="user" label={t("auth_profile")} />
            <MenuItem icon="settings" label={t("auth_settings")} />
            <div className="h-px bg-[var(--line)] my-1" />
            <MenuItem icon="signout" label={t("auth_signout")} onClick={() => { setOpen(false); onSignOut(); }} danger />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  const icons = {
    user: <path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    signout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
  };
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] transition-colors ${danger ? "text-[var(--neg)] hover:bg-[color-mix(in_oklch,var(--neg),transparent_88%)]" : "hover:bg-[var(--surface2)]"}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[icon]}</svg>
      {label}
    </button>
  );
}
