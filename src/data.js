// Shared data + utilities for Anima Sheets CFO System.

export const CATEGORY_DEFS = [
  { key: "einnahmen",         kind: "income",  amount: 12450 },
  { key: "ausgaben",          kind: "summary", amount: 8320 },
  { key: "gehaelter",         kind: "expense", amount: 3200 },
  { key: "software",          kind: "expense", amount: 1800 },
  { key: "marketing",         kind: "expense", amount: 1100 },
  { key: "miete",             kind: "expense", amount: 950 },
  { key: "reisekosten",       kind: "expense", amount: 620 },
  { key: "steuern",           kind: "expense", amount: 480 },
  { key: "versicherungen",    kind: "expense", amount: 350 },
  { key: "bewirtung",         kind: "expense", amount: 210 },
  { key: "sonstiges",         kind: "expense", amount: 201 },
  { key: "buerobedarf",       kind: "expense", amount: 120 },
  { key: "telekommunikation", kind: "expense", amount: 89 },
  { key: "abschreibungen",    kind: "expense", amount: 0 },
  { key: "beratung",          kind: "expense", amount: 0 },
  { key: "fahrzeugkosten",    kind: "expense", amount: 0 },
];

export const CATEGORY_HUE = {
  einnahmen: 145, ausgaben: 25, gehaelter: 14, software: 34, marketing: 58,
  miete: 120, reisekosten: 160, steuern: 200, versicherungen: 230, bewirtung: 260,
  sonstiges: 290, buerobedarf: 320, telekommunikation: 350,
  abschreibungen: 80, beratung: 180, fahrzeugkosten: 300,
};

import { tCat } from "./i18n.js";

export const catColor = (key) => `oklch(0.72 0.14 ${CATEGORY_HUE[key] ?? 280})`;
export const catLabel = (key) => tCat(key);

export const MONTHS = [
  { key: "nov", income: 8200,  expenses: 6100 },
  { key: "dec", income: 9100,  expenses: 7300 },
  { key: "jan", income: 10800, expenses: 7900 },
  { key: "feb", income: 11200, expenses: 8100 },
  { key: "mar", income: 11900, expenses: 7800 },
  { key: "apr", income: 12450, expenses: 8320 },
];

export const LEDGER_MAIN = [
  { id: 1,  date: "2026-04-23", descKey: "r_inv_2847",    counterparty: "Müller GmbH",          payment: "transfer", ref: "INV-2847",  vat: 19, status: "cleared", amount:  4200.00, cat: "einnahmen",         noteKey: "n_retainer_q2" },
  { id: 2,  date: "2026-04-22", descKey: "r_freelancer",  counterparty: "Arik Tashi",           payment: "sepa",     ref: "OUT-0401",  vat: 0,  status: "cleared", amount:  3500.00, cat: "einnahmen",         noteKey: "n_contract_04_26" },
  { id: 3,  date: "2026-04-22", descKey: "r_workshop",    counterparty: "Siemens AG",           payment: "transfer", ref: "INV-2848",  vat: 19, status: "cleared", amount:  1750.00, cat: "einnahmen",         noteKey: "n_berlin_2d" },
  { id: 4,  date: "2026-04-19", descKey: "r_team_payroll",counterparty: "Payroll",              payment: "sepa",     ref: "SAL-0419",  vat: 0,  status: "cleared", amount: -3200.00, cat: "gehaelter",         noteKey: "n_3_emp" },
  { id: 5,  date: "2026-04-18", descKey: "r_rent_apr",    counterparty: "Hauptstr. 14 GbR",     payment: "sepa",     ref: "RENT-0418", vat: 19, status: "cleared", amount:  -950.00, cat: "miete",             noteKey: "n_standing_order" },
  { id: 6,  date: "2026-04-17", descKey: "r_linkedin_ads",counterparty: "LinkedIn Ireland",     payment: "card",     ref: "CC-0417",   vat: 19, status: "cleared", amount:  -480.00, cat: "marketing",         noteKey: "n_q2_campaign" },
  { id: 7,  date: "2026-04-16", descKey: "r_inv_2846",    counterparty: "Studio Noir",          payment: "transfer", ref: "INV-2846",  vat: 19, status: "cleared", amount:  2800.00, cat: "einnahmen",         noteKey: "n_retainer" },
  { id: 8,  date: "2026-04-15", descKey: "r_figma_org",   counterparty: "Figma Inc.",           payment: "card",     ref: "CC-0415",   vat: 19, status: "cleared", amount:  -225.00, cat: "software",          noteKey: "n_annual" },
  { id: 9,  date: "2026-04-14", descKey: "r_hotel_berlin",counterparty: "Mercure Hotel",        payment: "card",     ref: "CC-0414a",  vat: 7,  status: "cleared", amount:  -340.00, cat: "reisekosten",       noteKey: "n_2_nights" },
  { id: 10, date: "2026-04-14", descKey: "r_train_berlin",counterparty: "DB Fernverkehr",       payment: "card",     ref: "CC-0414b",  vat: 7,  status: "cleared", amount:  -189.00, cat: "reisekosten",       noteKey: "n_return_trip" },
  { id: 11, date: "2026-04-13", descKey: "r_client_meal", counterparty: "Restaurant Borchardt", payment: "card",     ref: "CC-0413",   vat: 19, status: "cleared", amount:  -142.50, cat: "bewirtung",         noteKey: "n_3_persons" },
  { id: 12, date: "2026-04-12", descKey: "r_adobe_cc",    counterparty: "Adobe Systems IE",     payment: "card",     ref: "CC-0412",   vat: 19, status: "cleared", amount:   -59.99, cat: "software",          noteKey: "n_monthly" },
  { id: 13, date: "2026-04-11", descKey: "r_tax_q2",      counterparty: "Finanzamt München",    payment: "transfer", ref: "TAX-0411",  vat: 0,  status: "cleared", amount:  -480.00, cat: "steuern",           noteKey: "n_vat_prep" },
  { id: 14, date: "2026-04-10", descKey: "r_liability_ins",counterparty:"Allianz SE",           payment: "sepa",     ref: "INS-0410",  vat: 0,  status: "cleared", amount:  -195.00, cat: "versicherungen",    noteKey: "n_bhv" },
  { id: 15, date: "2026-04-09", descKey: "r_notion_team", counterparty: "Notion Labs",          payment: "card",     ref: "CC-0409",   vat: 19, status: "cleared", amount:  -120.00, cat: "software",          noteKey: "n_5_seats" },
  { id: 16, date: "2026-04-08", descKey: "r_paper_toner", counterparty: "Viking Direkt",        payment: "card",     ref: "CC-0408",   vat: 19, status: "cleared", amount:   -78.40, cat: "buerobedarf",       noteKey: "n_restock" },
  { id: 17, date: "2026-04-07", descKey: "r_inv_2845",    counterparty: "Bora GmbH",            payment: "transfer", ref: "INV-2845",  vat: 19, status: "cleared", amount:  1200.00, cat: "einnahmen",         noteKey: "n_consulting" },
  { id: 18, date: "2026-04-06", descKey: "r_meta_ads",    counterparty: "Meta Platforms IE",    payment: "card",     ref: "CC-0406",   vat: 19, status: "cleared", amount:  -620.00, cat: "marketing",         noteKey: "n_retargeting" },
  { id: 19, date: "2026-04-05", descKey: "r_gworkspace",  counterparty: "Google Ireland",       payment: "card",     ref: "CC-0405",   vat: 19, status: "cleared", amount:   -12.00, cat: "software",          noteKey: "n_basic_1seat" },
  { id: 20, date: "2026-04-04", descKey: "r_team_breakfast",counterparty:"Cafe Kranzler",       payment: "cash",     ref: "CSH-0404",  vat: 7,  status: "cleared", amount:   -67.50, cat: "bewirtung",         noteKey: "n_monday_sync" },
  { id: 21, date: "2026-04-03", descKey: "r_telekom",     counterparty: "Deutsche Telekom",     payment: "sepa",     ref: "TEL-0403",  vat: 19, status: "cleared", amount:   -89.00, cat: "telekommunikation", noteKey: "n_line" },
  { id: 22, date: "2026-04-02", descKey: "r_github",      counterparty: "GitHub Inc.",          payment: "card",     ref: "CC-0402a",  vat: 19, status: "cleared", amount:  -160.00, cat: "software",          noteKey: "n_4_seats" },
  { id: 23, date: "2026-04-02", descKey: "r_electronics", counterparty: "Conrad Electronic",    payment: "card",     ref: "CC-0402b",  vat: 19, status: "cleared", amount:   -41.60, cat: "buerobedarf",       noteKey: "n_cables" },
  { id: 24, date: "2026-04-01", descKey: "r_bank_bonus",  counterparty: "Qonto Bank",           payment: "transfer", ref: "BNK-0401",  vat: 0,  status: "cleared", amount:  1000.00, cat: "einnahmen",         noteKey: "n_promo" },
  { id: 25, date: "2026-04-25", descKey: "r_zapier",      counterparty: "Zapier Inc.",          payment: "card",     ref: "CC-0425",   vat: 19, status: "pending", amount:   -49.00, cat: "software",          noteKey: "n_pro_plan" },
  { id: 26, date: "2026-04-25", descKey: "r_coworking",   counterparty: "Factory Berlin",       payment: "card",     ref: "CC-0425b",  vat: 19, status: "pending", amount:   -29.00, cat: "miete",             noteKey: "n_guest_pass" },
  { id: 27, date: "2026-04-26", descKey: "r_inv_2849_draft",counterparty:"Nexa Studios",        payment: "transfer", ref: "INV-2849",  vat: 19, status: "draft",   amount:  2200.00, cat: "einnahmen",         noteKey: "n_awaiting" },
];

export const LEDGER_PERSONAL = [
  { id: 1, date: "2026-04-24", descKey: "r_supermarket",     counterparty: "REWE",             payment: "card",     ref: "CC-P24",  vat: 7,  status: "cleared", amount:  -84.20, cat: "sonstiges",    noteKey: "n_weekly_shop" },
  { id: 2, date: "2026-04-20", descKey: "r_electricity",     counterparty: "Vattenfall",       payment: "sepa",     ref: "UTL-P20", vat: 19, status: "cleared", amount:  -72.00, cat: "sonstiges",    noteKey: "n_monthly" },
  { id: 3, date: "2026-04-18", descKey: "r_rent_apartment",  counterparty: "Hausverwaltung",   payment: "sepa",     ref: "RENT-P18",vat: 0,  status: "cleared", amount:-1150.00, cat: "miete",        noteKey: "n_apartment" },
  { id: 4, date: "2026-04-10", descKey: "r_gym",             counterparty: "Urban Sports",     payment: "card",     ref: "CC-P10",  vat: 19, status: "cleared", amount:  -39.00, cat: "sonstiges",    noteKey: "" },
  { id: 5, date: "2026-04-05", descKey: "r_train_munich",    counterparty: "DB Fernverkehr",   payment: "card",     ref: "CC-P05",  vat: 7,  status: "cleared", amount:  -89.00, cat: "reisekosten",  noteKey: "n_visit_family" },
  { id: 6, date: "2026-04-01", descKey: "r_salary_as",       counterparty: "Anima Sheets GbR", payment: "sepa",     ref: "SAL-P01", vat: 0,  status: "cleared", amount: 3200.00, cat: "einnahmen",    noteKey: "n_april" },
];

export const LEDGER_PROJECT = [
  { id: 1, date: "2026-04-22", descKey: "r_kickoff_inv",   counterparty: "Nexa Studios",  payment: "transfer", ref: "P-001", vat: 19, status: "cleared", amount: 5000.00, cat: "einnahmen",    noteKey: "n_50_upfront" },
  { id: 2, date: "2026-04-20", descKey: "r_designer_fee",  counterparty: "Luca Romano",   payment: "sepa",     ref: "P-002", vat: 0,  status: "cleared", amount:-1800.00, cat: "gehaelter",    noteKey: "n_week_1" },
  { id: 3, date: "2026-04-19", descKey: "r_photography",   counterparty: "Elsa Braun",    payment: "transfer", ref: "P-003", vat: 19, status: "cleared", amount: -950.00, cat: "beratung",     noteKey: "n_shoot_day" },
  { id: 4, date: "2026-04-17", descKey: "r_print_mockups", counterparty: "Saxoprint",     payment: "card",     ref: "P-004", vat: 19, status: "cleared", amount: -220.00, cat: "buerobedarf",  noteKey: "n_a3_samples" },
  { id: 5, date: "2026-04-14", descKey: "r_fonts_license", counterparty: "Grilli Type",   payment: "card",     ref: "P-005", vat: 19, status: "cleared", amount: -395.00, cat: "software",     noteKey: "n_gt_alpina" },
];

export const SHEETS_SEED = [
  { id: "main",     nameKey: "sheet_operating", rows: LEDGER_MAIN },
  { id: "personal", nameKey: "sheet_personal",  rows: LEDGER_PERSONAL },
  { id: "project",  nameKey: "sheet_project",   rows: LEDGER_PROJECT },
];

export const SHEETS = SHEETS_SEED;
export const LEDGER = LEDGER_MAIN;

export const euro = (n, opts = {}) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  }).format(n);

export const euroNum = (n, decimals = 2) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
