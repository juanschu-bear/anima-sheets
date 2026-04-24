/**
 * Anima Sheets CFO — single-file React component
 * ================================================
 *
 * Drop this file into a Vite / CRA / Next project. It is self-contained
 * except for these peer deps:
 *
 *   npm i react react-dom recharts
 *
 * Tailwind CSS is expected to be set up in the host project with
 * `darkMode: "class"` in `tailwind.config.js`. Paste the CSS block inside
 * `<GlobalStyles />` below into your global stylesheet if you prefer,
 * or leave it as-is and it will be injected at runtime.
 *
 * Optional: if `window.claude.complete` is available, the NLQ ("Ask")
 * panel uses it to parse natural-language questions into filter specs.
 * Without it, the panel shows a friendly error and the rest of the app
 * works as usual.
 *
 * Usage:
 *
 *   import AnimaSheetsCFO from "./AnimaSheetsCFO";
 *   export default function App() { return <AnimaSheetsCFO />; }
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Fragment,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ================================================================
   1. i18n — dictionary + hooks
   ================================================================ */

const I18N = {
  app_tagline:       { en: "CFO System",             de: "CFO System",             es: "Sistema CFO" },
  tab_dashboard:     { en: "Dashboard",              de: "Dashboard",              es: "Panel" },
  tab_spreadsheet:   { en: "Spreadsheet",            de: "Spreadsheet",            es: "Hoja" },
  tab_import:        { en: "Import",                 de: "Import",                 es: "Importar" },

  overview:          { en: "Overview",               de: "Finanzübersicht",        es: "Resumen" },
  greet_morning:     { en: "Good morning, Jana.",    de: "Guten Morgen, Jana.",    es: "Buenos días, Jana." },
  dash_sub:          { en: "Your current state for {m}. All figures sync live from your Anima Sheets ledger.",
                       de: "Hier ist dein aktueller Stand für {m}. Alle Zahlen sind live aus deinem Anima Sheets Ledger synchronisiert.",
                       es: "Tu estado actual para {m}. Todas las cifras se sincronizan en vivo desde tu libro Anima Sheets." },

  kpi_income:        { en: "Income",                 de: "Einnahmen",              es: "Ingresos" },
  kpi_expenses:      { en: "Expenses",               de: "Ausgaben",               es: "Gastos" },
  kpi_net:           { en: "Net Income",             de: "Net Income",             es: "Beneficio neto" },
  kpi_vs_prev:       { en: "vs. previous month",     de: "vs. Vormonat",           es: "vs. mes anterior" },
  kpi_margin:        { en: "Margin {p}%",            de: "Marge {p}%",             es: "Margen {p}%" },
  kpi_profit:        { en: "Profit",                 de: "Gewinn",                 es: "Beneficio" },
  kpi_loss:          { en: "Loss",                   de: "Verlust",                es: "Pérdida" },

  chart_income_vs:   { en: "Income vs. Expenses",    de: "Einnahmen vs. Ausgaben", es: "Ingresos vs. Gastos" },
  chart_last_6:      { en: "Last 6 months",          de: "Letzte 6 Monate",        es: "Últimos 6 meses" },

  cats_title:        { en: "Categories",             de: "Kategorien",             es: "Categorías" },
  cats_donut_sub:    { en: "April, expense breakdown", de: "April, Ausgaben Breakdown", es: "Abril, desglose de gastos" },
  cats_of_total:     { en: "of {t}",                 de: "von {t}",                es: "de {t}" },

  tbl_category:      { en: "Category",               de: "Kategorie",              es: "Categoría" },
  tbl_amount:        { en: "Amount",                 de: "Betrag",                 es: "Importe" },
  tbl_share:         { en: "Share",                  de: "Anteil",                 es: "Cuota" },
  tbl_active_sort:   { en: "{n} active, sortable",   de: "{n} aktiv, sortierbar",  es: "{n} activas, ordenable" },

  recent_title:      { en: "Recent Transactions",    de: "Letzte Transaktionen",   es: "Movimientos recientes" },
  recent_sub:        { en: "5 latest entries",       de: "5 neueste Buchungen",    es: "5 últimos asientos" },
  see_all:           { en: "See all",                de: "Alle anzeigen",          es: "Ver todo" },

  new_tx:            { en: "New Transaction",        de: "Neue Transaktion",       es: "Nueva transacción" },
  import_btn:        { en: "Import",                 de: "Import",                 es: "Importar" },
  prev_month:        { en: "Previous month",         de: "Vorheriger Monat",       es: "Mes anterior" },
  next_month:        { en: "Next month",             de: "Nächster Monat",         es: "Mes siguiente" },

  search_placeholder:{ en: "Search by description, note, category...", de: "Suchen nach Beschreibung, Notiz, Kategorie...", es: "Buscar por descripción, nota o categoría..." },
  filter:            { en: "Filter",                 de: "Filter",                 es: "Filtrar" },
  export_:           { en: "Export",                 de: "Export",                 es: "Exportar" },
  new_row:           { en: "New row",                de: "Neue Zeile",             es: "Nueva fila" },
  col_date:          { en: "Date",                   de: "Datum",                  es: "Fecha" },
  col_desc:          { en: "Description",            de: "Beschreibung",           es: "Descripción" },
  col_cat:           { en: "Category",               de: "Kategorie",              es: "Categoría" },
  col_note:          { en: "Note",                   de: "Notiz",                  es: "Nota" },
  col_amount:        { en: "Amount (\u20AC)",        de: "Betrag (\u20AC)",        es: "Importe (\u20AC)" },
  col_counterparty:  { en: "Counterparty",           de: "Gegenkonto",             es: "Contraparte" },
  col_payment:       { en: "Payment method",         de: "Zahlungsart",            es: "Método de pago" },
  col_ref:           { en: "Reference",              de: "Referenz",               es: "Referencia" },
  col_vat:           { en: "VAT %",                  de: "USt. %",                 es: "IVA %" },
  col_status:        { en: "Status",                 de: "Status",                 es: "Estado" },

  rows_count:        { en: "{n} rows",               de: "{n} Zeilen",             es: "{n} filas" },
  income_total:      { en: "Income",                 de: "Einnahmen",              es: "Ingresos" },
  expense_total:     { en: "Expenses",               de: "Ausgaben",               es: "Gastos" },
  net_total:         { en: "Net",                    de: "Netto",                  es: "Neto" },

  kbd_navigate:      { en: "Navigate",               de: "Navigieren",             es: "Navegar" },
  kbd_edit:          { en: "Edit",                   de: "Bearbeiten",             es: "Editar" },
  kbd_next_cell:     { en: "Next cell",              de: "Nächste Zelle",          es: "Siguiente celda" },
  kbd_cancel:        { en: "Cancel",                 de: "Abbrechen",              es: "Cancelar" },
  kbd_delete:        { en: "Delete",                 de: "Löschen",                es: "Eliminar" },

  sheet_new:         { en: "New sheet",              de: "Neue Tabelle",           es: "Nueva hoja" },
  sheet_rename:      { en: "Rename",                 de: "Umbenennen",             es: "Renombrar" },
  sheet_duplicate:   { en: "Duplicate",              de: "Duplizieren",            es: "Duplicar" },
  sheet_delete:      { en: "Delete sheet",           de: "Tabelle löschen",        es: "Eliminar hoja" },

  status_cleared:    { en: "Cleared",                de: "Gebucht",                es: "Conciliado" },
  status_pending:    { en: "Pending",                de: "Ausstehend",             es: "Pendiente" },
  status_draft:      { en: "Draft",                  de: "Entwurf",                es: "Borrador" },

  pay_sepa:          { en: "SEPA",                   de: "SEPA",                   es: "SEPA" },
  pay_card:          { en: "Card",                   de: "Karte",                  es: "Tarjeta" },
  pay_cash:          { en: "Cash",                   de: "Bar",                    es: "Efectivo" },
  pay_paypal:        { en: "PayPal",                 de: "PayPal",                 es: "PayPal" },
  pay_transfer:      { en: "Transfer",               de: "Überweisung",            es: "Transferencia" },

  no_results:        { en: "No transactions found.", de: "Keine Transaktionen gefunden.", es: "Sin movimientos." },

  drop_title:        { en: "Drop a bank export here", de: "Bank-Export hier ablegen", es: "Suelta tu exportación bancaria aquí" },
  drop_sub:          { en: "or choose a file, CSV, XLSX (max. 10 MB)", de: "oder Datei auswählen, CSV, XLSX (max. 10 MB)", es: "o elige un archivo, CSV, XLSX (máx. 10 MB)" },
  drop_p1:           { en: "Your data stays on your device", de: "Keine Daten verlassen dein Gerät", es: "Tus datos no salen de tu dispositivo" },
  drop_p2:           { en: "Automatic categorization", de: "Automatische Kategorisierung", es: "Categorización automática" },
  drop_p3:           { en: "Duplicate detection",    de: "Duplikat Erkennung",     es: "Detección de duplicados" },

  upload_reading:    { en: "Reading file",           de: "Datei wird gelesen",     es: "Leyendo archivo" },
  upload_cat:        { en: "Detecting categories",   de: "Kategorien erkennen",    es: "Detectando categorías" },
  upload_done:       { en: "Done",                   de: "Fertig",                 es: "Listo" },
  upload_progress:   { en: "Importing {f}...",       de: "Importiere {f}...",      es: "Importando {f}..." },

  sources_title:     { en: "Supported sources",      de: "Unterstützte Quellen",   es: "Orígenes soportados" },
  sources_sub:       { en: "Import works from any common bank export.", de: "Import funktioniert aus jeder gängigen Bank Exportdatei.", es: "Funciona con cualquier exportación bancaria común." },
  how_it_works:      { en: "How it works",           de: "So funktioniert es",     es: "Cómo funciona" },
  how_1:             { en: "Upload CSV",             de: "CSV hochladen",          es: "Subir CSV" },
  how_2:             { en: "Map columns, confirm categories", de: "Spalten zuordnen, Kategorien bestätigen", es: "Asigna columnas, confirma categorías" },
  how_3:             { en: "Commit transactions to ledger", de: "Transaktionen ins Ledger übernehmen", es: "Aplica los movimientos al libro" },

  step_upload:       { en: "Upload file",            de: "Datei hochladen",        es: "Subir archivo" },
  step_map:          { en: "Map & review",           de: "Zuordnen & prüfen",      es: "Asignar y revisar" },
  step_commit:       { en: "Commit",                 de: "Übernehmen",             es: "Aplicar" },

  map_columns:       { en: "Map columns",            de: "Spalten zuordnen",       es: "Asignar columnas" },
  from_file:         { en: "From {f}",               de: "Aus {f}",                es: "De {f}" },
  auto_detected:     { en: "Auto detected",          de: "Automatisch erkannt",    es: "Detección automática" },
  preview_title:     { en: "Preview transactions",   de: "Transaktionen vorschauen", es: "Vista previa" },
  preview_sub:       { en: "Apply {n} of {t}, review category", de: "{n} von {t} übernehmen, Kategorie prüfen", es: "Aplicar {n} de {t}, revisa la categoría" },
  select_all:        { en: "Select all",             de: "Alle auswählen",         es: "Seleccionar todo" },
  select_none:       { en: "None",                   de: "Keine",                  es: "Ninguno" },
  summary:           { en: "Summary",                de: "Zusammenfassung",        es: "Resumen" },
  read_n:            { en: "{n} transactions read",  de: "{n} Transaktionen gelesen", es: "{n} movimientos leídos" },
  auto_cat_n:        { en: "{n} auto categorized",   de: "{n} automatisch kategorisiert", es: "{n} categorizados" },
  dup_n:             { en: "0 duplicates detected",  de: "0 Duplikate erkannt",    es: "0 duplicados detectados" },
  commit_n:          { en: "Commit {n} transactions", de: "{n} Transaktionen übernehmen", es: "Aplicar {n} movimientos" },
  cancel:            { en: "Cancel",                 de: "Abbrechen",              es: "Cancelar" },

  imp_done_title:    { en: "Import complete",        de: "Import abgeschlossen",   es: "Importación completa" },
  imp_done_sub:      { en: "{n} transactions from {f} have been added to the ledger.", de: "{n} Transaktionen aus {f} wurden ins Ledger übernommen.", es: "{n} movimientos de {f} se han añadido al libro." },
  imp_again:         { en: "Start another import",   de: "Weiteren Import starten", es: "Iniciar otra importación" },

  footer_text:       { en: "Anima Sheets, CFO Financial Management", de: "Anima Sheets, CFO Finanzmanagement", es: "Anima Sheets, gestión financiera CFO" },
  last_sync:         { en: "Last synced, {t}",       de: "Zuletzt synchronisiert, {t}", es: "Última sincronización, {t}" },

  sheet_operating:   { en: "Operating 2026",         de: "Betrieb 2026",            es: "Operaciones 2026" },
  sheet_personal:    { en: "Personal",               de: "Persönlich",              es: "Personal" },
  sheet_project:     { en: "Client: Nexa",           de: "Kunde: Nexa",             es: "Cliente: Nexa" },

  r_inv_2847:        { en: "Client invoice 2847",    de: "Kundenrechnung 2847",     es: "Factura cliente 2847" },
  r_freelancer:      { en: "Freelancer payment",     de: "Freelancer Zahlung",      es: "Pago freelancer" },
  r_workshop:        { en: "Workshop fee",           de: "Workshop Honorar",        es: "Honorario taller" },
  r_team_payroll:    { en: "Team payroll",           de: "Lohn Team",               es: "Nómina equipo" },
  r_rent_apr:        { en: "Office rent, April",     de: "Büro Miete April",        es: "Alquiler oficina, abril" },
  r_linkedin_ads:    { en: "LinkedIn Ads",           de: "LinkedIn Ads",            es: "LinkedIn Ads" },
  r_inv_2846:        { en: "Client invoice 2846",    de: "Kundenrechnung 2846",     es: "Factura cliente 2846" },
  r_figma_org:       { en: "Figma Org",              de: "Figma Org",               es: "Figma Org" },
  r_hotel_berlin:    { en: "Hotel Berlin",           de: "Hotel Berlin",            es: "Hotel Berlín" },
  r_train_berlin:    { en: "Train ICE Berlin",       de: "Bahn ICE Berlin",         es: "Tren ICE Berlín" },
  r_client_meal:     { en: "Client meal",            de: "Kundenessen",             es: "Comida cliente" },
  r_adobe_cc:        { en: "Adobe Creative Cloud",   de: "Adobe Creative Cloud",    es: "Adobe Creative Cloud" },
  r_tax_q2:          { en: "Tax prepayment Q2",      de: "Steuervorauszahlung Q2",  es: "Anticipo impuestos Q2" },
  r_liability_ins:   { en: "Liability insurance",    de: "Berufshaftpflicht",       es: "Seguro de responsabilidad" },
  r_notion_team:     { en: "Notion Team",            de: "Notion Team",             es: "Notion Team" },
  r_paper_toner:     { en: "Paper and toner",        de: "Papier und Toner",        es: "Papel y tóner" },
  r_inv_2845:        { en: "Client invoice 2845",    de: "Kundenrechnung 2845",     es: "Factura cliente 2845" },
  r_meta_ads:        { en: "Meta Ads",               de: "Meta Ads",                es: "Meta Ads" },
  r_gworkspace:      { en: "Google Workspace",       de: "Google Workspace",        es: "Google Workspace" },
  r_team_breakfast:  { en: "Team breakfast",         de: "Team Frühstück",          es: "Desayuno equipo" },
  r_telekom:         { en: "Telekom Business",       de: "Telekom Business",        es: "Telekom Business" },
  r_github:          { en: "GitHub Team",            de: "GitHub Team",             es: "GitHub Team" },
  r_electronics:     { en: "Small electronics",      de: "Kleinteile Elektro",      es: "Electrónica menor" },
  r_bank_bonus:      { en: "Bank opening bonus",     de: "Kontoeröffnung Bonus",    es: "Bonus apertura banco" },
  r_zapier:          { en: "Zapier Plan",            de: "Zapier Plan",             es: "Plan Zapier" },
  r_coworking:       { en: "Coworking day pass",     de: "Coworking Tagespass",     es: "Pase coworking diario" },
  r_inv_2849_draft:  { en: "Client invoice 2849 (draft)", de: "Kundenrechnung 2849 (Entwurf)", es: "Factura cliente 2849 (borrador)" },
  r_supermarket:     { en: "Supermarket",            de: "Supermarkt",              es: "Supermercado" },
  r_electricity:     { en: "Electricity",            de: "Strom",                   es: "Electricidad" },
  r_rent_apartment:  { en: "Rent apartment",         de: "Wohnungsmiete",           es: "Alquiler piso" },
  r_gym:             { en: "Gym membership",         de: "Fitnessstudio",           es: "Gimnasio" },
  r_train_munich:    { en: "Train ticket Munich",    de: "Bahnticket München",      es: "Tren Múnich" },
  r_salary_as:       { en: "Salary Anima Sheets",    de: "Gehalt Anima Sheets",     es: "Salario Anima Sheets" },
  r_kickoff_inv:     { en: "Kickoff invoice",        de: "Kickoff Rechnung",        es: "Factura de inicio" },
  r_designer_fee:    { en: "Designer fee",           de: "Designer Honorar",        es: "Honorario diseñador" },
  r_photography:     { en: "Photography session",    de: "Fotoshooting",            es: "Sesión fotográfica" },
  r_print_mockups:   { en: "Print mockups",          de: "Druck Mockups",           es: "Maquetas impresas" },
  r_fonts_license:   { en: "Fonts license",          de: "Schriften Lizenz",        es: "Licencia fuentes" },

  n_retainer_q2:     { en: "Retainer Q2",            de: "Retainer Q2",             es: "Retainer Q2" },
  n_contract_04_26:  { en: "Contract 04/26",         de: "Kontrakt 04/26",          es: "Contrato 04/26" },
  n_berlin_2d:       { en: "Berlin, 2 days",         de: "Berlin, 2 Tage",          es: "Berlín, 2 días" },
  n_3_emp:           { en: "3 employees",            de: "3 Mitarbeiter",           es: "3 empleados" },
  n_standing_order:  { en: "Standing order",         de: "Dauerauftrag",            es: "Orden permanente" },
  n_q2_campaign:     { en: "Q2 campaign",            de: "Q2 Kampagne",             es: "Campaña Q2" },
  n_retainer:        { en: "Retainer",               de: "Retainer",                es: "Retainer" },
  n_annual:          { en: "Annual plan",            de: "Jahresabo",               es: "Plan anual" },
  n_2_nights:        { en: "2 nights",               de: "2 Nächte",                es: "2 noches" },
  n_return_trip:     { en: "Return trip",            de: "Hin und zurück",          es: "Ida y vuelta" },
  n_3_persons:       { en: "3 persons",              de: "3 Personen",              es: "3 personas" },
  n_monthly:         { en: "Monthly",                de: "Monatlich",               es: "Mensual" },
  n_vat_prep:        { en: "VAT prepayment",         de: "USt-VA",                  es: "Anticipo IVA" },
  n_bhv:             { en: "Professional liability", de: "BHV",                     es: "Responsabilidad pro." },
  n_5_seats:         { en: "5 seats",                de: "5 Seats",                 es: "5 usuarios" },
  n_restock:         { en: "Restock",                de: "Nachbestellung",          es: "Reposición" },
  n_consulting:      { en: "Consulting",             de: "Beratung",                es: "Consultoría" },
  n_retargeting:     { en: "Retargeting",            de: "Retargeting",             es: "Retargeting" },
  n_basic_1seat:     { en: "Basic, 1 seat",          de: "Basic, 1 Seat",           es: "Basic, 1 usuario" },
  n_monday_sync:     { en: "Monday sync",            de: "Montag Sync",             es: "Sync lunes" },
  n_line:            { en: "Line subscription",      de: "Anschluss",               es: "Línea" },
  n_4_seats:         { en: "4 seats",                de: "4 Seats",                 es: "4 usuarios" },
  n_cables:          { en: "Cables, adapters",       de: "Kabel, Adapter",          es: "Cables, adaptadores" },
  n_promo:           { en: "Promotion",              de: "Aktion",                  es: "Promoción" },
  n_pro_plan:        { en: "Professional",           de: "Professional",            es: "Professional" },
  n_guest_pass:      { en: "Guest pass",             de: "Gastnutzung",             es: "Pase invitado" },
  n_awaiting:        { en: "Awaiting approval",      de: "Wartet auf Freigabe",     es: "Esperando aprobación" },
  n_weekly_shop:     { en: "Weekly shop",            de: "Wochenkauf",              es: "Compra semanal" },
  n_apartment:       { en: "Apartment",              de: "Wohnung",                 es: "Piso" },
  n_visit_family:    { en: "Visit family",           de: "Familienbesuch",          es: "Visita familia" },
  n_april:           { en: "April",                  de: "April",                   es: "Abril" },
  n_50_upfront:      { en: "50% upfront",            de: "50% im Voraus",           es: "50% por adelantado" },
  n_week_1:          { en: "Week 1",                 de: "Woche 1",                 es: "Semana 1" },
  n_shoot_day:       { en: "Shoot day",              de: "Shooting Tag",            es: "Día de rodaje" },
  n_a3_samples:      { en: "A3 samples",             de: "A3 Muster",               es: "Muestras A3" },
  n_gt_alpina:       { en: "GT Alpina",              de: "GT Alpina",               es: "GT Alpina" },

  auth_title:        { en: "Sign in to Anima Sheets",   de: "Bei Anima Sheets anmelden",    es: "Inicia sesión en Anima Sheets" },
  auth_sub:          { en: "Your financial system, ready in seconds.", de: "Dein Finanzsystem, in Sekunden bereit.", es: "Tu sistema financiero, listo en segundos." },
  auth_google:       { en: "Continue with Google",      de: "Mit Google fortfahren",        es: "Continuar con Google" },
  auth_apple:        { en: "Continue with Apple",       de: "Mit Apple fortfahren",         es: "Continuar con Apple" },
  auth_microsoft:    { en: "Continue with Microsoft",   de: "Mit Microsoft fortfahren",     es: "Continuar con Microsoft" },
  auth_or:           { en: "or",                        de: "oder",                         es: "o" },
  auth_email:        { en: "Work email",                de: "Arbeits E-Mail",               es: "Email profesional" },
  auth_name:         { en: "Full name",                 de: "Vollständiger Name",           es: "Nombre completo" },
  auth_continue:     { en: "Continue with email",       de: "Mit E-Mail fortfahren",        es: "Continuar con email" },
  auth_privacy:      { en: "By continuing you agree to our Terms and Privacy Policy.", de: "Mit Fortfahren akzeptierst du unsere AGB und Datenschutzerklärung.", es: "Al continuar aceptas nuestros Términos y Política de Privacidad." },
  auth_checking:     { en: "Signing you in, one moment.",de: "Du wirst angemeldet, einen Moment.", es: "Iniciando sesión, un momento." },
  auth_signout:      { en: "Sign out",                  de: "Abmelden",                     es: "Cerrar sesión" },
  auth_settings:     { en: "Settings",                  de: "Einstellungen",                es: "Ajustes" },
  auth_profile:      { en: "Profile",                   de: "Profil",                       es: "Perfil" },

  greet_morning_x:   { en: "Good morning, {name}.",     de: "Guten Morgen, {name}.",        es: "Buenos días, {name}." },
  greet_afternoon_x: { en: "Good afternoon, {name}.",   de: "Guten Tag, {name}.",           es: "Buenas tardes, {name}." },
  greet_evening_x:   { en: "Good evening, {name}.",     de: "Guten Abend, {name}.",         es: "Buenas noches, {name}." },

  nlq_button:        { en: "Ask",                       de: "Fragen",                       es: "Preguntar" },
  nlq_title:         { en: "Ask anything",              de: "Frag einfach",                 es: "Pregunta lo que sea" },
  nlq_sub:           { en: "Query your ledger in plain language.", de: "Frag dein Ledger in normaler Sprache.", es: "Consulta tu libro en lenguaje natural." },
  nlq_placeholder:   { en: "e.g. How much did I spend on software in March?", de: "z.B. Wie viel habe ich im März für Software ausgegeben?", es: "p.ej. ¿Cuánto gasté en software en marzo?" },
  nlq_thinking:      { en: "Thinking",                  de: "Denke nach",                   es: "Pensando" },
  nlq_suggest:       { en: "Try asking",                de: "Frag doch mal",                es: "Prueba con" },
  nlq_q1:            { en: "How much did I spend on insurance this month?", de: "Wie viel habe ich diesen Monat für Versicherungen ausgegeben?", es: "¿Cuánto gasté en seguros este mes?" },
  nlq_q2:            { en: "Show me all expenses over 500 euro",          de: "Zeig mir alle Ausgaben über 500 Euro",           es: "Muéstrame todos los gastos mayores a 500 euros" },
  nlq_q3:            { en: "Compare my monthly income trends",            de: "Vergleiche meine monatlichen Einnahmen Trends",  es: "Compara mis tendencias de ingresos mensuales" },
  nlq_q4:            { en: "Top 3 expense categories",                    de: "Top 3 Ausgabenkategorien",                       es: "Top 3 categorías de gasto" },
  nlq_matching:      { en: "{n} matching rows",         de: "{n} passende Zeilen",          es: "{n} filas encontradas" },
  nlq_csv:           { en: "Download CSV",              de: "Als CSV herunterladen",        es: "Descargar CSV" },
  nlq_copy:          { en: "Copy",                      de: "Kopieren",                     es: "Copiar" },
  nlq_error:         { en: "Something went wrong, try again.", de: "Etwas ist schiefgelaufen, bitte erneut.", es: "Algo salió mal, inténtalo de nuevo." },
  nlq_empty:         { en: "No rows matched your question.", de: "Keine Zeilen passen zu deiner Frage.", es: "Ninguna fila coincide con tu pregunta." },

  cat_einnahmen:         { en: "Income",                 de: "Einnahmen",              es: "Ingresos" },
  cat_ausgaben:          { en: "Expenses (total)",       de: "Ausgaben (gesamt)",      es: "Gastos (total)" },
  cat_gehaelter:         { en: "Salaries",               de: "Gehälter",               es: "Salarios" },
  cat_software:          { en: "Software / Licenses",    de: "Software / Lizenzen",    es: "Software / Licencias" },
  cat_marketing:         { en: "Marketing",              de: "Marketing",              es: "Marketing" },
  cat_miete:             { en: "Rent",                   de: "Miete",                  es: "Alquiler" },
  cat_reisekosten:       { en: "Travel",                 de: "Reisekosten",            es: "Viajes" },
  cat_steuern:           { en: "Taxes",                  de: "Steuern",                es: "Impuestos" },
  cat_versicherungen:    { en: "Insurance",              de: "Versicherungen",         es: "Seguros" },
  cat_bewirtung:         { en: "Entertainment",          de: "Bewirtung",              es: "Manutención" },
  cat_sonstiges:         { en: "Other",                  de: "Sonstiges",              es: "Otros" },
  cat_buerobedarf:       { en: "Office supplies",        de: "Bürobedarf",             es: "Material oficina" },
  cat_telekommunikation: { en: "Telecoms",               de: "Telekommunikation",      es: "Telecom" },
  cat_abschreibungen:    { en: "Depreciation",           de: "Abschreibungen",         es: "Amortización" },
  cat_beratung:          { en: "Consulting",             de: "Beratung",               es: "Consultoría" },
  cat_fahrzeugkosten:    { en: "Vehicle",                de: "Fahrzeugkosten",         es: "Vehículo" },
};

// Language state + event bus (module-scoped; survives across components).
const LANG_LISTENERS = new Set();
let _lang =
  (typeof localStorage !== "undefined" && localStorage.getItem("as_lang")) || "en";

function setLang(l) {
  _lang = l;
  try { localStorage.setItem("as_lang", l); } catch {}
  LANG_LISTENERS.forEach((fn) => fn(l));
}
function getLang() { return _lang; }

function t(key, vars) {
  const entry = I18N[key];
  if (!entry) return key;
  let s = entry[_lang] || entry.en || key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}
function tCat(key) { return t("cat_" + key); }
function tRow(row) {
  return {
    desc: row.descKey ? t(row.descKey) : (row.desc || ""),
    note: row.noteKey ? (row.noteKey === "" ? "" : t(row.noteKey)) : (row.note || ""),
    counterparty: row.counterparty || "",
  };
}
function tSheetName(sheet) {
  if (sheet.nameKey) return t(sheet.nameKey);
  return sheet.name || sheet.id;
}
function useLang() {
  const [l, setL] = useState(_lang);
  useEffect(() => {
    LANG_LISTENERS.add(setL);
    return () => { LANG_LISTENERS.delete(setL); };
  }, []);
  return l;
}

const MONTH_LABEL_MAP = {
  nov: { en: "Nov 2025", de: "Nov 2025", es: "Nov 2025" },
  dec: { en: "Dec 2025", de: "Dez 2025", es: "Dic 2025" },
  jan: { en: "Jan 2026", de: "Jan 2026", es: "Ene 2026" },
  feb: { en: "Feb 2026", de: "Feb 2026", es: "Feb 2026" },
  mar: { en: "Mar 2026", de: "Mär 2026", es: "Mar 2026" },
  apr: { en: "Apr 2026", de: "Apr 2026", es: "Abr 2026" },
};
function localizedMonthLabel(key) {
  return (MONTH_LABEL_MAP[key] && MONTH_LABEL_MAP[key][_lang]) || key;
}
function localeString() {
  return _lang === "de" ? "de-DE" : _lang === "es" ? "es-ES" : "en-GB";
}

/* ================================================================
   2. Data — categories, months, seed ledgers
   ================================================================ */

const CATEGORY_DEFS = [
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

const CATEGORY_HUE = {
  einnahmen: 145, ausgaben: 25, gehaelter: 14, software: 34, marketing: 58,
  miete: 120, reisekosten: 160, steuern: 200, versicherungen: 230, bewirtung: 260,
  sonstiges: 290, buerobedarf: 320, telekommunikation: 350,
  abschreibungen: 80, beratung: 180, fahrzeugkosten: 300,
};
const catColor = (key) => `oklch(0.72 0.14 ${CATEGORY_HUE[key] ?? 280})`;
const catLabel = (key) => tCat(key);

const MONTHS = [
  { key: "nov", income: 8200,  expenses: 6100 },
  { key: "dec", income: 9100,  expenses: 7300 },
  { key: "jan", income: 10800, expenses: 7900 },
  { key: "feb", income: 11200, expenses: 8100 },
  { key: "mar", income: 11900, expenses: 7800 },
  { key: "apr", income: 12450, expenses: 8320 },
];

const LEDGER_MAIN = [
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

const LEDGER_PERSONAL = [
  { id: 1, date: "2026-04-24", descKey: "r_supermarket",     counterparty: "REWE",             payment: "card",     ref: "CC-P24",  vat: 7,  status: "cleared", amount:  -84.20, cat: "sonstiges",    noteKey: "n_weekly_shop" },
  { id: 2, date: "2026-04-20", descKey: "r_electricity",     counterparty: "Vattenfall",       payment: "sepa",     ref: "UTL-P20", vat: 19, status: "cleared", amount:  -72.00, cat: "sonstiges",    noteKey: "n_monthly" },
  { id: 3, date: "2026-04-18", descKey: "r_rent_apartment",  counterparty: "Hausverwaltung",   payment: "sepa",     ref: "RENT-P18",vat: 0,  status: "cleared", amount:-1150.00, cat: "miete",        noteKey: "n_apartment" },
  { id: 4, date: "2026-04-10", descKey: "r_gym",             counterparty: "Urban Sports",     payment: "card",     ref: "CC-P10",  vat: 19, status: "cleared", amount:  -39.00, cat: "sonstiges",    noteKey: "" },
  { id: 5, date: "2026-04-05", descKey: "r_train_munich",    counterparty: "DB Fernverkehr",   payment: "card",     ref: "CC-P05",  vat: 7,  status: "cleared", amount:  -89.00, cat: "reisekosten",  noteKey: "n_visit_family" },
  { id: 6, date: "2026-04-01", descKey: "r_salary_as",       counterparty: "Anima Sheets GbR", payment: "sepa",     ref: "SAL-P01", vat: 0,  status: "cleared", amount: 3200.00, cat: "einnahmen",    noteKey: "n_april" },
];

const LEDGER_PROJECT = [
  { id: 1, date: "2026-04-22", descKey: "r_kickoff_inv",   counterparty: "Nexa Studios",  payment: "transfer", ref: "P-001", vat: 19, status: "cleared", amount: 5000.00, cat: "einnahmen",    noteKey: "n_50_upfront" },
  { id: 2, date: "2026-04-20", descKey: "r_designer_fee",  counterparty: "Luca Romano",   payment: "sepa",     ref: "P-002", vat: 0,  status: "cleared", amount:-1800.00, cat: "gehaelter",    noteKey: "n_week_1" },
  { id: 3, date: "2026-04-19", descKey: "r_photography",   counterparty: "Elsa Braun",    payment: "transfer", ref: "P-003", vat: 19, status: "cleared", amount: -950.00, cat: "beratung",     noteKey: "n_shoot_day" },
  { id: 4, date: "2026-04-17", descKey: "r_print_mockups", counterparty: "Saxoprint",     payment: "card",     ref: "P-004", vat: 19, status: "cleared", amount: -220.00, cat: "buerobedarf",  noteKey: "n_a3_samples" },
  { id: 5, date: "2026-04-14", descKey: "r_fonts_license", counterparty: "Grilli Type",   payment: "card",     ref: "P-005", vat: 19, status: "cleared", amount: -395.00, cat: "software",     noteKey: "n_gt_alpina" },
];

const SHEETS_SEED = [
  { id: "main",     nameKey: "sheet_operating", rows: LEDGER_MAIN },
  { id: "personal", nameKey: "sheet_personal",  rows: LEDGER_PERSONAL },
  { id: "project",  nameKey: "sheet_project",   rows: LEDGER_PROJECT },
];

// Utilities
const euro = (n, opts = {}) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  }).format(n);
const euroNum = (n, decimals = 2) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

/* ================================================================
   3. Auth — local session, gate screen, profile menu
   ================================================================ */

const AUTH_STORAGE_KEY = "anima_sheets_session_v1";

function avatarFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `oklch(0.72 0.13 ${h % 360})`;
}
function initialsFor(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u || !u.name || !u.email) return null;
    return u;
  } catch { return null; }
}
function saveSession(u) { try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u)); } catch {} }
function clearSession() { try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {} }

function useAuth() {
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

function AuthGate({ onSignIn }) {
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[var(--as-bg)] text-[var(--as-fg)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="as-orb as-orb-a" />
        <div className="as-orb as-orb-b" />
        <div className="as-grid-fade" />
      </div>
      <div className="relative z-10 w-full max-w-[420px] mx-4 as-anim-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[var(--as-fg)] text-[var(--as-bg)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M5 19 L12 5 L19 19" /><path d="M8 14 H16" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight text-[17px]">Anima Sheets</span>
            <span className="text-[var(--as-muted)] text-[12px]">, CFO</span>
          </div>
          <div className="ml-auto"><LangMini /></div>
        </div>

        <div className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-7 shadow-2xl">
          <h1 className="text-[22px] leading-tight font-semibold tracking-tight">{t("auth_title")}</h1>
          <p className="text-[13px] text-[var(--as-muted)] mt-1.5">{t("auth_sub")}</p>

          {step === "loading" ? (
            <div className="mt-8 mb-4 flex flex-col items-center justify-center gap-3 py-6">
              <LoaderRing />
              <div className="text-[13px] text-[var(--as-muted)]">{t("auth_checking")}</div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-2">
                <SocialButton onClick={() => onSocial("google")} glyph={<GoogleGlyph />} label={t("auth_google")} />
                <SocialButton onClick={() => onSocial("apple")} glyph={<AppleGlyph />} label={t("auth_apple")} />
                <SocialButton onClick={() => onSocial("microsoft")} glyph={<MicrosoftGlyph />} label={t("auth_microsoft")} />
              </div>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--as-muted)]">
                <div className="h-px flex-1 bg-[var(--as-line)]" />
                <span>{t("auth_or")}</span>
                <div className="h-px flex-1 bg-[var(--as-line)]" />
              </div>
              <form onSubmit={onEmailSubmit} className="grid gap-2.5">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--as-muted)]">{t("auth_name")}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" required
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--as-bg)] border border-[var(--as-line)] focus:border-[var(--as-fg)] outline-none text-[13px] transition-colors" />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--as-muted)]">{t("auth_email")}</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="name@studio.com"
                    className="mt-1 w-full h-10 px-3 rounded-lg bg-[var(--as-bg)] border border-[var(--as-line)] focus:border-[var(--as-fg)] outline-none text-[13px] transition-colors" />
                </label>
                <button type="submit" className="mt-1 h-10 rounded-lg bg-[var(--as-fg)] text-[var(--as-bg)] font-medium text-[13px] hover:opacity-90 transition-opacity">
                  {t("auth_continue")}
                </button>
              </form>
            </>
          )}
          <p className="mt-5 text-[11px] text-[var(--as-muted)] leading-relaxed">{t("auth_privacy")}</p>
        </div>
      </div>
    </div>
  );
}
function SocialButton({ onClick, glyph, label }) {
  return (
    <button onClick={onClick} type="button"
      className="h-10 rounded-lg border border-[var(--as-line)] bg-[var(--as-bg)] hover:bg-[var(--as-surface2)] transition-colors inline-flex items-center justify-center gap-2.5 text-[13px] font-medium">
      {glyph}<span>{label}</span>
    </button>
  );
}
function LoaderRing() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 animate-spin" style={{ animationDuration: "900ms" }}>
      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--as-line)" strokeWidth="3" />
      <path d="M20 4 a16 16 0 0 1 16 16" fill="none" stroke="var(--as-fg)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function LangMini() {
  const current = useLang();
  const order = ["en", "de", "es"];
  return (
    <div className="inline-flex items-center gap-0.5 text-[10px] font-semibold tracking-wider text-[var(--as-muted)]">
      {order.map((c, i) => (
        <Fragment key={c}>
          <button onClick={() => setLang(c)} className={`px-1.5 py-1 rounded transition-colors ${current === c ? "text-[var(--as-fg)]" : "hover:text-[var(--as-fg)]"}`}>{c.toUpperCase()}</button>
          {i < order.length - 1 && <span className="text-[var(--as-line-strong)]">|</span>}
        </Fragment>
      ))}
    </div>
  );
}

function ProfileMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const initials = initialsFor(user.name);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 rounded-full grid place-items-center font-semibold text-[11px] text-white transition-transform hover:scale-105"
        style={{ background: user.color, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        aria-label="Account menu">
        {initials}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--as-line-strong)] bg-[var(--as-bg)] shadow-2xl p-1.5 z-40 as-anim-in-fast">
            <div className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-full grid place-items-center text-[13px] font-semibold text-white flex-shrink-0"
                style={{ background: user.color, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold tracking-tight truncate">{user.name}</div>
                <div className="text-[11px] text-[var(--as-muted)] truncate">{user.email}</div>
              </div>
            </div>
            <div className="h-px bg-[var(--as-line)] my-1" />
            <ProfileMenuItem icon="user" label={t("auth_profile")} />
            <ProfileMenuItem icon="settings" label={t("auth_settings")} />
            <div className="h-px bg-[var(--as-line)] my-1" />
            <ProfileMenuItem icon="signout" label={t("auth_signout")} onClick={() => { setOpen(false); onSignOut(); }} danger />
          </div>
        </>
      )}
    </div>
  );
}
function ProfileMenuItem({ icon, label, onClick, danger }) {
  const icons = {
    user: <path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>,
    settings: (
      <>
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </>
    ),
    signout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <path d="M16 17l5-5-5-5"/>
        <path d="M21 12H9"/>
      </>
    ),
  };
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] transition-colors ${danger ? "text-[var(--as-neg)] hover:bg-[color-mix(in_oklch,var(--as-neg),transparent_88%)]" : "hover:bg-[var(--as-surface2)]"}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[icon]}</svg>
      {label}
    </button>
  );
}


/* ================================================================
   4. Spreadsheet — multi-sheet editable ledger grid
   ================================================================ */

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

const emptyRow = () => ({
  id: Math.random().toString(36).slice(2, 9),
  date: new Date().toISOString().slice(0, 10),
  desc: "", counterparty: "", cat: "", payment: "card", ref: "", vat: 19,
  status: "draft", note: "", amount: 0,
});

function Spreadsheet() {
  useLang();
  const [sheets, setSheets] = useState(() =>
    SHEETS_SEED.map((s) => ({
      id: s.id,
      name: s.nameKey ? t(s.nameKey) : s.name,
      nameKey: s.nameKey,
      rows: s.rows.map((r) => ({ ...r, desc: tRow(r).desc, note: tRow(r).note })),
    }))
  );
  const [activeId, setActiveId] = useState(sheets[0].id);
  const [edit, setEdit] = useState(null);
  const [selected, setSelected] = useState({ rowIdx: 0, colIdx: 0 });
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState(null);

  const activeSheet = sheets.find((s) => s.id === activeId) || sheets[0];
  const rows = activeSheet.rows;
  const COLUMNS = columnDefs();

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      (r.desc || "").toLowerCase().includes(q) ||
      (r.note || "").toLowerCase().includes(q) ||
      (r.counterparty || "").toLowerCase().includes(q) ||
      catLabel(r.cat).toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totals = useMemo(() => {
    let inc = 0, exp = 0;
    for (const r of filtered) {
      if (r.amount > 0) inc += r.amount; else exp += Math.abs(r.amount);
    }
    return { inc, exp, net: inc - exp, count: filtered.length };
  }, [filtered]);

  const updateRows = (fn) =>
    setSheets((prev) => prev.map((s) => (s.id === activeId ? { ...s, rows: fn(s.rows) } : s)));
  const updateCell = (rowId, col, value) =>
    updateRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, [col]: value } : r)));
  const addRow = () => {
    updateRows((rs) => [emptyRow(), ...rs]);
    setSelected({ rowIdx: 0, colIdx: 0 });
    setTimeout(() => setEdit({ rowIdx: 0, colIdx: 1 }), 80);
  };
  const deleteRow = (id) => updateRows((rs) => rs.filter((r) => r.id !== id));

  const addSheet = () => {
    const id = "sheet-" + Math.random().toString(36).slice(2, 7);
    setSheets((prev) => [...prev, { id, name: "Untitled " + (prev.length + 1), rows: [] }]);
    setActiveId(id);
    setTimeout(() => setRenaming(id), 50);
  };
  const renameSheet = (id, name) =>
    setSheets((prev) => prev.map((s) => (s.id === id ? { ...s, name, nameKey: undefined } : s)));
  const duplicateSheet = (id) => {
    const src = sheets.find((s) => s.id === id);
    if (!src) return;
    const newId = "sheet-" + Math.random().toString(36).slice(2, 7);
    setSheets((prev) => [
      ...prev,
      {
        id: newId,
        name: (src.nameKey ? t(src.nameKey) : src.name) + " (copy)",
        rows: src.rows.map((r) => ({ ...r, id: Math.random().toString(36).slice(2, 9) })),
      },
    ]);
    setActiveId(newId);
  };
  const deleteSheet = (id) => {
    if (sheets.length <= 1) return;
    setSheets((prev) => prev.filter((s) => s.id !== id));
    if (id === activeId) setActiveId(sheets.find((s) => s.id !== id).id);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (edit) return;
      if (document.activeElement && ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)) return;
      const maxRow = filtered.length - 1, maxCol = COLUMNS.length - 1;
      let { rowIdx, colIdx } = selected;
      if (e.key === "ArrowDown") { e.preventDefault(); rowIdx = Math.min(maxRow, rowIdx + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); rowIdx = Math.max(0, rowIdx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); colIdx = Math.min(maxCol, colIdx + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); colIdx = Math.max(0, colIdx - 1); }
      else if (e.key === "Enter") { e.preventDefault(); setEdit({ rowIdx, colIdx }); return; }
      else if (e.key === "Tab") { e.preventDefault(); colIdx = e.shiftKey ? Math.max(0, colIdx - 1) : Math.min(maxCol, colIdx + 1); }
      else return;
      setSelected({ rowIdx, colIdx });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, edit, filtered.length]);

  const totalWidth = COLUMNS.reduce((s, c) => s + c.width, 0) + 48 + 48;

  return (
    <div className="as-anim-in">
      <SheetTabs sheets={sheets} activeId={activeId} setActiveId={setActiveId}
        renaming={renaming} setRenaming={setRenaming}
        onRename={renameSheet} onAdd={addSheet} onDuplicate={duplicateSheet} onDelete={deleteSheet} />
      <SheetToolbar query={query} setQuery={setQuery} onAdd={addRow} />

      <div className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] overflow-hidden relative">
        <div className="overflow-auto" style={{ maxHeight: "62vh" }}>
          <div className="grid text-[11px] uppercase tracking-[0.14em] text-[var(--as-muted)] font-medium border-b border-[var(--as-line)] bg-[var(--as-surface2)]/70 backdrop-blur sticky top-0 z-20"
            style={{ gridTemplateColumns: `48px ${COLUMNS.map((c) => `${c.width}px`).join(" ")} 48px`, minWidth: totalWidth }}>
            <div className="px-3 py-2.5 text-center">#</div>
            {COLUMNS.map((c) => (
              <div key={c.key} className={`px-3 py-2.5 ${c.type === "amount" || c.type === "vat" ? "text-right" : ""}`}>{c.label}</div>
            ))}
            <div />
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--as-muted)] text-[13px]">{t("no_results")}</div>
          )}
          {filtered.map((row, rowIdx) => (
            <SheetRow key={row.id} row={row} rowIdx={rowIdx} columns={COLUMNS} totalWidth={totalWidth}
              selected={selected} setSelected={setSelected} edit={edit} setEdit={setEdit}
              updateCell={updateCell} onDelete={() => deleteRow(row.id)} />
          ))}
        </div>
        <div className="grid border-t border-[var(--as-line)] bg-[var(--as-surface2)]/60 text-[12px]"
          style={{ gridTemplateColumns: "48px 1fr 130px 48px", minWidth: totalWidth }}>
          <div />
          <div className="px-3 py-2.5 text-[var(--as-muted)]">
            {t("rows_count", { n: totals.count })}{" \u00B7 "}
            {t("income_total")} <span className="font-semibold text-[var(--as-pos)] tabular-nums">{"\u20AC" + euroNum(totals.inc)}</span>
            {" \u00B7 "}
            {t("expense_total")} <span className="font-semibold text-[var(--as-neg)] tabular-nums">{"\u20AC" + euroNum(totals.exp)}</span>
          </div>
          <div className="px-3 py-2.5 text-right tabular-nums font-semibold"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: totals.net >= 0 ? "var(--as-pos)" : "var(--as-neg)" }}>
            {totals.net >= 0 ? "+" : "\u2212"}{"\u20AC" + euroNum(Math.abs(totals.net))}
          </div>
          <div />
        </div>
      </div>

      <div className="mt-3 text-[11.5px] text-[var(--as-muted)] flex items-center gap-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5"><Kbd>{"\u2191"}</Kbd><Kbd>{"\u2193"}</Kbd><Kbd>{"\u2190"}</Kbd><Kbd>{"\u2192"}</Kbd> {t("kbd_navigate")}</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>Enter</Kbd> {t("kbd_edit")}</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>Tab</Kbd> {t("kbd_next_cell")}</span>
        <span className="inline-flex items-center gap-1.5"><Kbd>Esc</Kbd> {t("kbd_cancel")}</span>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return <kbd className="px-1.5 py-0.5 rounded border border-[var(--as-line-strong)] bg-[var(--as-surface)] text-[10.5px] font-medium tabular-nums">{children}</kbd>;
}

function SheetTabs({ sheets, activeId, setActiveId, renaming, setRenaming, onRename, onAdd, onDuplicate, onDelete }) {
  return (
    <div className="flex items-end gap-1 mb-4 border-b border-[var(--as-line)] overflow-x-auto as-scroll-none">
      {sheets.map((s) => {
        const active = s.id === activeId;
        const displayName = s.nameKey ? t(s.nameKey) : s.name;
        return (
          <div key={s.id} className="relative group">
            <button onClick={() => setActiveId(s.id)} onDoubleClick={() => setRenaming(s.id)}
              className={`relative flex items-center gap-2 px-3.5 h-9 rounded-t-lg text-[12.5px] font-medium transition-all border border-b-0 ${active ? "bg-[var(--as-surface)] border-[var(--as-line)] text-[var(--as-fg)]" : "bg-transparent border-transparent text-[var(--as-muted)] hover:text-[var(--as-fg)]"}`}>
              <span className="h-1.5 w-1.5 rounded-full transition-all" style={{ background: active ? "var(--as-pos)" : "var(--as-line-strong)" }} />
              {renaming === s.id ? (
                <input autoFocus defaultValue={displayName}
                  onBlur={(e) => { onRename(s.id, e.target.value || displayName); setRenaming(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { onRename(s.id, e.target.value || displayName); setRenaming(null); }
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent focus:outline-none min-w-0 w-28" />
              ) : <span>{displayName}</span>}
              <span className="text-[10px] text-[var(--as-muted)] tabular-nums">{s.rows.length}</span>
              {active && <span className="absolute -bottom-px left-2 right-2 h-px bg-[var(--as-surface)]" />}
            </button>
            {active && sheets.length > 1 && (
              <SheetMenu onRename={() => setRenaming(s.id)} onDuplicate={() => onDuplicate(s.id)} onDelete={() => onDelete(s.id)} />
            )}
          </div>
        );
      })}
      <button onClick={onAdd}
        className="h-9 w-9 grid place-items-center rounded-t-lg text-[var(--as-muted)] hover:text-[var(--as-fg)] hover:bg-[var(--as-surface2)] transition-colors" title={t("sheet_new")}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  );
}

function SheetMenu({ onRename, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute right-1 top-1.5 z-10">
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="h-6 w-6 grid place-items-center rounded text-[var(--as-muted)] hover:text-[var(--as-fg)] hover:bg-[var(--as-surface2)]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 rounded-lg border border-[var(--as-line-strong)] bg-[var(--as-bg)] shadow-xl p-1 z-40 as-anim-in-fast">
            <SheetMenuItem onClick={() => { onRename(); setOpen(false); }}>{t("sheet_rename")}</SheetMenuItem>
            <SheetMenuItem onClick={() => { onDuplicate(); setOpen(false); }}>{t("sheet_duplicate")}</SheetMenuItem>
            <div className="h-px bg-[var(--as-line)] my-1" />
            <SheetMenuItem danger onClick={() => { onDelete(); setOpen(false); }}>{t("sheet_delete")}</SheetMenuItem>
          </div>
        </>
      )}
    </div>
  );
}
function SheetMenuItem({ children, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-2.5 py-1.5 rounded text-[12px] transition-colors ${danger ? "text-[var(--as-neg)] hover:bg-[var(--as-neg)]/10" : "hover:bg-[var(--as-surface2)]"}`}>
      {children}
    </button>
  );
}

function SheetToolbar({ query, setQuery, onAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-1 max-w-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--as-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" strokeLinecap="round"/>
          </svg>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full h-10 pl-9 pr-3 rounded-full border border-[var(--as-line)] bg-[var(--as-surface)] text-[13px] focus:outline-none focus:border-[var(--as-line-strong)] transition-colors" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--as-line)] bg-[var(--as-surface)] hover:bg-[var(--as-surface2)] text-[13px] font-medium transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          {t("filter")}
        </button>
        <button className="inline-flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--as-line)] bg-[var(--as-surface)] hover:bg-[var(--as-surface2)] text-[13px] font-medium transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v12M6 9l6 6 6-6M4 21h16"/></svg>
          {t("export_")}
        </button>
        <button onClick={onAdd} className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--as-fg)] text-[var(--as-bg)] hover:opacity-90 text-[13px] font-medium transition-opacity">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          {t("new_row")}
        </button>
      </div>
    </div>
  );
}

function SheetRow({ row, rowIdx, columns, totalWidth, selected, setSelected, edit, setEdit, updateCell, onDelete }) {
  return (
    <div className="grid border-b border-[var(--as-line)] hover:bg-[var(--as-surface2)]/40 transition-colors group"
      style={{
        gridTemplateColumns: `48px ${columns.map((c) => `${c.width}px`).join(" ")} 48px`,
        minWidth: totalWidth,
        animation: `as-row-in 320ms ${rowIdx * 14}ms backwards cubic-bezier(.2,.7,.2,1)`,
      }}>
      <div className="px-3 py-0 text-[11px] text-[var(--as-muted)] tabular-nums grid place-items-center">{rowIdx + 1}</div>
      {columns.map((col, colIdx) => (
        <TableCell key={col.key} col={col} row={row}
          isSelected={selected.rowIdx === rowIdx && selected.colIdx === colIdx}
          isEditing={edit?.rowIdx === rowIdx && edit?.colIdx === colIdx}
          onSelect={() => setSelected({ rowIdx, colIdx })}
          onEditStart={() => setEdit({ rowIdx, colIdx })}
          onEditEnd={() => setEdit(null)}
          onChange={(v) => updateCell(row.id, col.key, v)} />
      ))}
      <div className="grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDelete} className="h-7 w-7 grid place-items-center rounded hover:bg-[var(--as-neg)]/15 text-[var(--as-muted)] hover:text-[var(--as-neg)] transition-colors" aria-label={t("kbd_delete")}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg>
        </button>
      </div>
    </div>
  );
}

function TableCell({ col, row, isSelected, isEditing, onSelect, onEditStart, onEditEnd, onChange }) {
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
  const ring = isSelected ? "outline outline-2 outline-[var(--as-fg)] outline-offset-[-2px] z-10 bg-[var(--as-bg)]" : "";

  if (!isEditing) {
    return (
      <div className={`${base} ${ring}`} onClick={onSelect} onDoubleClick={onEditStart} tabIndex={-1}>
        <CellDisplay col={col} value={value} />
      </div>
    );
  }
  const commit = (v) => { onChange(v); onEditEnd(); };
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onEditEnd(); }
    else if (e.key === "Enter" && col.type !== "cat" && col.type !== "status" && col.type !== "payment") {
      e.preventDefault(); commit(e.target.value);
    }
  };
  if (col.type === "cat" || col.type === "status" || col.type === "payment") {
    const options =
      col.type === "cat"
        ? CATEGORY_DEFS.filter((c) => c.kind !== "summary").map((c) => ({ value: c.key, label: catLabel(c.key) }))
        : col.type === "status"
        ? [["cleared", t("status_cleared")], ["pending", t("status_pending")], ["draft", t("status_draft")]].map(([v, l]) => ({ value: v, label: l }))
        : [["sepa", t("pay_sepa")], ["card", t("pay_card")], ["cash", t("pay_cash")], ["paypal", t("pay_paypal")], ["transfer", t("pay_transfer")]].map(([v, l]) => ({ value: v, label: l }));
    return (
      <div className={`${base} ${ring} p-0`}>
        <select ref={inputRef} value={value || ""} onChange={(e) => commit(e.target.value)} onBlur={() => onEditEnd()} onKeyDown={onKey}
          className="w-full h-full px-3 py-2.5 bg-transparent text-[13px] focus:outline-none appearance-none cursor-pointer">
          <option value="">{"\u2014"}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
          className="w-full h-full px-3 py-2.5 bg-transparent text-[13px] tabular-nums text-right focus:outline-none"
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
    if (!value) return <span className="text-[var(--as-muted)]">{"\u2014"}</span>;
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
    return <span className="text-[12px] text-[var(--as-muted)]">{labels[value] || "\u2014"}</span>;
  }
  if (col.type === "vat") {
    if (value == null || value === 0) return <span className="text-[var(--as-muted)]">0%</span>;
    return <span className="tabular-nums text-[var(--as-muted)]">{value}%</span>;
  }
  if (col.type === "amount") {
    const pos = value > 0;
    return (
      <span style={{
        color: pos ? "var(--as-pos)" : value < 0 ? "var(--as-fg)" : "var(--as-muted)",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 500,
      }}>
        {pos ? "+" : value < 0 ? "\u2212" : ""}{"\u20AC" + euroNum(Math.abs(value))}
      </span>
    );
  }
  if (col.type === "date") {
    if (!value) return <span className="text-[var(--as-muted)]">{"\u2014"}</span>;
    const d = new Date(value);
    return (
      <span className="tabular-nums text-[var(--as-muted)]">
        {d.toLocaleDateString(localeString(), { day: "2-digit", month: "short", year: "2-digit" })}
      </span>
    );
  }
  if (!value) return <span className="text-[var(--as-muted)]">{"\u2014"}</span>;
  return <span className="truncate block">{value}</span>;
}


/* ================================================================
   5. Import — CSV dropzone, mapping, preview, commit
   ================================================================ */

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
  if (/papier|toner|b\u00FCro|buero/.test(d)) return "buerobedarf";
  if (/re |rechnung|eingang|freelancer|kunden/.test(d)) return "einnahmen";
  return "sonstiges";
}

function ImportView() {
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

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    startUpload(f?.name ?? "bank-export-april-2026.csv");
  };
  const pickFile = () => fileInputRef.current?.click();
  const onFilePicked = (e) => { const f = e.target.files?.[0]; if (!f) return; startUpload(f.name); };
  const commit = () => setStage("committed");
  const reset = () => { setStage("idle"); setRows([]); setProgress(0); setFileName(""); };

  if (stage === "committed") return <SuccessScreen n={rows.filter((r) => r.include).length} fileName={fileName} onReset={reset} />;
  if (stage === "preview") {
    return <PreviewStep rows={rows} setRows={setRows} mapping={mapping} setMapping={setMapping} fileName={fileName} onBack={reset} onCommit={commit} />;
  }
  return (
    <div className="as-anim-in grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Dropzone dragging={dragging} uploading={uploading} progress={progress} fileName={fileName}
          onPick={pickFile}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop} />
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFilePicked} />
      </div>
      <aside className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-5">
        <h3 className="text-[14px] font-semibold tracking-tight">{t("sources_title")}</h3>
        <p className="text-[12px] text-[var(--as-muted)] mt-1">{t("sources_sub")}</p>
        <ul className="mt-4 space-y-2.5">
          {["Sparkasse, CSV", "Deutsche Bank, CSV", "N26, CSV / XLSX", "Kontist, CSV", "DATEV, CSV", "Generic CSV"].map((s) => (
            <li key={s} className="flex items-center gap-2.5 text-[13px]">
              <span className="h-6 w-6 rounded-md bg-[var(--as-surface2)] grid place-items-center">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--as-muted)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>
              </span>
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-5 pt-5 border-t border-[var(--as-line)]">
          <h4 className="text-[12px] font-semibold">{t("how_it_works")}</h4>
          <ol className="mt-2 space-y-2 text-[12.5px] text-[var(--as-muted)]">
            <li><span className="font-semibold text-[var(--as-fg)]">1.</span>&nbsp; {t("how_1")}</li>
            <li><span className="font-semibold text-[var(--as-fg)]">2.</span>&nbsp; {t("how_2")}</li>
            <li><span className="font-semibold text-[var(--as-fg)]">3.</span>&nbsp; {t("how_3")}</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Dropzone({ dragging, uploading, progress, fileName, onPick, onDragOver, onDragLeave, onDrop }) {
  return (
    <div onClick={!uploading ? onPick : undefined} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className={`relative rounded-2xl border-2 border-dashed p-10 md:p-14 text-center transition-all cursor-pointer overflow-hidden ${dragging ? "border-[var(--as-fg)] bg-[var(--as-surface2)]" : "border-[var(--as-line-strong)] bg-[var(--as-surface)] hover:bg-[var(--as-surface2)]/60"}`}
      style={{ minHeight: 360 }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--as-fg) 1px, transparent 0)", backgroundSize: "18px 18px" }} />
      {!uploading ? (
        <div className="relative flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--as-surface2)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 18a4 4 0 0 1-.8-7.9 5 5 0 0 1 9.7-1.2 4.5 4.5 0 0 1 2.6 8.1"/>
              <path d="M12 12v9M8.5 15.5L12 12l3.5 3.5"/>
            </svg>
          </div>
          <div>
            <div className="text-[18px] font-semibold tracking-tight">{t("drop_title")}</div>
            <div className="text-[13px] text-[var(--as-muted)] mt-1.5">{t("drop_sub")}</div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--as-muted)]">
            <span className="h-1 w-1 rounded-full bg-[var(--as-muted)]" /><span>{t("drop_p1")}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--as-muted)]" /><span>{t("drop_p2")}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--as-muted)]" /><span>{t("drop_p3")}</span>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[var(--as-surface2)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-7 w-7 animate-spin" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3a9 9 0 1 1-6.4 2.6"/></svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold">{t("upload_progress", { f: fileName })}</div>
            <div className="text-[12px] text-[var(--as-muted)] mt-1 tabular-nums">
              {progress < 60 ? t("upload_reading") : progress < 95 ? t("upload_cat") : t("upload_done")}
            </div>
          </div>
          <div className="w-full max-w-md h-1.5 rounded-full bg-[var(--as-surface2)] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200" style={{ width: `${progress}%`, background: "var(--as-fg)" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewStep({ rows, setRows, mapping, setMapping, fileName, onBack, onCommit }) {
  const included = rows.filter((r) => r.include);
  const totals = useMemo(() => {
    let inc = 0, exp = 0;
    for (const r of included) { if (r.amount > 0) inc += r.amount; else exp += Math.abs(r.amount); }
    return { inc, exp, net: inc - exp };
  }, [included.length]);
  const toggle = (id) => setRows((prev) => prev.map((r) => r.id === id ? { ...r, include: !r.include } : r));
  const changeCat = (id, cat) => setRows((prev) => prev.map((r) => r.id === id ? { ...r, cat, confidence: 1 } : r));

  return (
    <div className="as-anim-in">
      <Steps active={2} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold tracking-tight">{t("map_columns")}</h3>
                <p className="text-[11.5px] text-[var(--as-muted)] mt-0.5">{t("from_file", { f: fileName })}</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--as-pos)]/15 text-[var(--as-pos)] font-medium">{t("auto_detected")}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ key: "date", label: t("col_date") }, { key: "desc", label: t("col_desc") }, { key: "amount", label: t("col_amount") }].map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] uppercase tracking-[0.14em] text-[var(--as-muted)]">{f.label}</label>
                  <select value={mapping[f.key]} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                    className="mt-1 w-full h-9 px-3 rounded-lg border border-[var(--as-line)] bg-[var(--as-bg)] text-[13px] focus:outline-none focus:border-[var(--as-line-strong)]">
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

          <div className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--as-line)] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold tracking-tight">{t("preview_title")}</h3>
                <p className="text-[11.5px] text-[var(--as-muted)] mt-0.5">{t("preview_sub", { n: included.length, t: rows.length })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: true })))} className="text-[12px] text-[var(--as-muted)] hover:text-[var(--as-fg)]">{t("select_all")}</button>
                <span className="text-[var(--as-muted)]">{"\u00B7"}</span>
                <button onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: false })))} className="text-[12px] text-[var(--as-muted)] hover:text-[var(--as-fg)]">{t("select_none")}</button>
              </div>
            </div>
            <div className="max-h-[52vh] overflow-auto">
              {rows.map((r, i) => (
                <div key={r.id}
                  className={`grid items-center gap-3 px-5 py-2.5 border-b border-[var(--as-line)] last:border-b-0 text-[13px] transition-colors ${r.include ? "" : "opacity-45"} hover:bg-[var(--as-surface2)]/50`}
                  style={{ gridTemplateColumns: "28px 92px 1fr 200px 120px", animation: `as-row-in 400ms ${i * 24}ms backwards cubic-bezier(.2,.7,.2,1)` }}>
                  <input type="checkbox" checked={r.include} onChange={() => toggle(r.id)} className="h-4 w-4 rounded border-[var(--as-line-strong)] accent-[var(--as-fg)]" />
                  <div className="tabular-nums text-[var(--as-muted)] text-[12px]">
                    {new Date(r.date).toLocaleDateString(localeString(), { day: "2-digit", month: "short" })}
                  </div>
                  <div className="truncate font-medium">{r.desc}</div>
                  <div className="flex items-center gap-2">
                    <CatSelect value={r.cat} onChange={(v) => changeCat(r.id, v)} />
                    {r.confidence < 0.85 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--as-neg)]/15 text-[var(--as-neg)] font-medium whitespace-nowrap">?</span>}
                  </div>
                  <div className="text-right tabular-nums font-medium" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color: r.amount > 0 ? "var(--as-pos)" : "var(--as-fg)" }}>
                    {r.amount > 0 ? "+" : "\u2212"}{"\u20AC" + euroNum(Math.abs(r.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-5 h-fit lg:sticky lg:top-20">
          <h3 className="text-[14px] font-semibold tracking-tight">{t("summary")}</h3>
          <div className="mt-4 space-y-3">
            <SumRow label={t("income_total")} value={`+\u20AC${euroNum(totals.inc)}`} color="var(--as-pos)" />
            <SumRow label={t("expense_total")} value={`\u2212\u20AC${euroNum(totals.exp)}`} color="var(--as-neg)" />
            <div className="h-px bg-[var(--as-line)] my-1" />
            <SumRow label={t("net_total")} value={`${totals.net >= 0 ? "+" : "\u2212"}\u20AC${euroNum(Math.abs(totals.net))}`} color={totals.net >= 0 ? "var(--as-pos)" : "var(--as-neg)"} big />
          </div>
          <div className="mt-5 pt-5 border-t border-[var(--as-line)] space-y-2 text-[12px]">
            <div className="flex items-center gap-2 text-[var(--as-muted)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--as-pos)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>
              {t("read_n", { n: rows.length })}
            </div>
            <div className="flex items-center gap-2 text-[var(--as-muted)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--as-pos)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg>
              {t("auto_cat_n", { n: rows.filter((r) => r.confidence >= 0.85).length })}
            </div>
            <div className="flex items-center gap-2 text-[var(--as-muted)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--as-muted)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              {t("dup_n")}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={onCommit} className="h-11 rounded-full bg-[var(--as-fg)] text-[var(--as-bg)] hover:opacity-90 text-[13px] font-medium transition-opacity">
              {t("commit_n", { n: included.length })}
            </button>
            <button onClick={onBack} className="h-10 rounded-full border border-[var(--as-line)] bg-[var(--as-surface)] hover:bg-[var(--as-surface2)] text-[13px] font-medium transition-colors">{t("cancel")}</button>
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
        {CATEGORY_DEFS.filter((c) => c.kind !== "summary").map((c) => <option key={c.key} value={c.key}>{catLabel(c.key)}</option>)}
      </select>
      <svg viewBox="0 0 24 24" className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color }}><path d="M6 9l6 6 6-6"/></svg>
    </div>
  );
}

function SumRow({ label, value, color, big }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12.5px] text-[var(--as-muted)]">{label}</span>
      <span className={`tabular-nums ${big ? "text-[18px] font-semibold" : "text-[13px] font-medium"}`}
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", color }}>{value}</span>
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
          <Fragment key={it.n}>
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full grid place-items-center text-[11px] font-semibold tabular-nums transition-all ${done ? "bg-[var(--as-pos)] text-[var(--as-bg)]" : current ? "bg-[var(--as-fg)] text-[var(--as-bg)]" : "bg-[var(--as-surface2)] text-[var(--as-muted)]"}`}>
                {done ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4 10-10"/></svg> : it.n}
              </div>
              <span className={`text-[12.5px] ${current ? "font-medium" : "text-[var(--as-muted)]"}`}>{it.label}</span>
            </div>
            {i < items.length - 1 && <div className="h-px bg-[var(--as-line)] flex-1 min-w-8 max-w-16" />}
          </Fragment>
        );
      })}
    </div>
  );
}

function SuccessScreen({ n, fileName, onReset }) {
  return (
    <div className="as-anim-in flex items-center justify-center py-16">
      <div className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-10 text-center max-w-md w-full">
        <div className="mx-auto h-14 w-14 rounded-full bg-[var(--as-pos)]/15 grid place-items-center">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--as-pos)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-10"/></svg>
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-tight">{t("imp_done_title")}</h3>
        <p className="text-[13px] text-[var(--as-muted)] mt-2">{t("imp_done_sub", { n, f: fileName })}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={onReset} className="h-10 px-4 rounded-full border border-[var(--as-line)] bg-[var(--as-surface)] hover:bg-[var(--as-surface2)] text-[13px] font-medium transition-colors">{t("imp_again")}</button>
        </div>
      </div>
    </div>
  );
}


/* ================================================================
   6. NLQ — Ask in plain language (DE / EN)
   ================================================================ */

const SUGGESTIONS = () => [
  { de: "Wieviel hab ich im M\u00E4rz f\u00FCr Marketing ausgegeben?", en: "How much did I spend on marketing in March?" },
  { de: "Zeig meine Top 5 Kunden nach Umsatz.",                          en: "Show my top 5 clients by revenue." },
  { de: "Cash-Runway bei aktueller Burn-Rate?",                          en: "Cash runway at current burn rate?" },
  { de: "Vergleich Q1 2026 mit Q1 2025.",                                en: "Compare Q1 2026 with Q1 2025." },
];

const ANSWERS = (lang) => ({
  marketing: lang === "de"
    ? { intro: "Im M\u00E4rz 2026 gingen \u20AC3.250 in Marketing.", chart: "marketing" }
    : { intro: "In March 2026 you spent \u20AC3,250 on marketing.",    chart: "marketing" },
  topclients: lang === "de"
    ? { intro: "Hier deine f\u00FCnf gr\u00F6\u00DFten Kunden nach Umsatz YTD.", chart: "topclients" }
    : { intro: "Here are your top five clients by revenue, YTD.",        chart: "topclients" },
  runway: lang === "de"
    ? { intro: "Bei aktueller Burn-Rate reicht dein Cash bis Dezember 2026 \u2014 etwa 11 Monate.", chart: "runway" }
    : { intro: "At your current burn rate, cash lasts through December 2026 \u2014 about 11 months.", chart: "runway" },
});

function classify(q) {
  const s = q.toLowerCase();
  if (/market|werb|anzeig/.test(s)) return "marketing";
  if (/kunde|client|umsatz|revenue|top/.test(s)) return "topclients";
  if (/runway|cash|burn|liquidit/.test(s)) return "runway";
  return "marketing";
}

function NLQ() {
  useLang();
  const [query, setQuery] = useState("");
  const [thread, setThread] = useState([]);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef(null);
  const threadRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { threadRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [thread, thinking]);

  const ask = (q) => {
    if (!q.trim()) return;
    const userMsg = { role: "user", text: q, id: Date.now() };
    setThread((p) => [...p, userMsg]); setQuery(""); setThinking(true);
    setTimeout(() => {
      const kind = classify(q);
      const answer = ANSWERS(getLang())[kind];
      setThread((p) => [...p, { role: "assistant", text: answer.intro, chart: answer.chart, id: Date.now() + 1 }]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="as-anim-in max-w-4xl mx-auto">
      <div ref={threadRef} className="min-h-[56vh] max-h-[64vh] overflow-auto pb-4">
        {thread.length === 0 && !thinking && (
          <div className="flex flex-col items-center justify-center text-center pt-10">
            <div className="h-14 w-14 rounded-2xl bg-[var(--as-surface2)] grid place-items-center">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 2a8 8 0 0 1 8 8v2a8 8 0 0 1-8 8h-1l-4 3v-3.5A8 8 0 0 1 4 12v-2a8 8 0 0 1 8-8z"/><path d="M8 11h8M8 14h5"/></svg>
            </div>
            <h3 className="mt-5 text-[22px] font-semibold tracking-tight">{t("nlq_empty_title")}</h3>
            <p className="mt-2 text-[13px] text-[var(--as-muted)] max-w-md">{t("nlq_empty_sub")}</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-2xl">
              {SUGGESTIONS().map((s, i) => {
                const text = getLang() === "de" ? s.de : s.en;
                return (
                  <button key={i} onClick={() => ask(text)}
                    className="px-3.5 py-2 rounded-full border border-[var(--as-line)] bg-[var(--as-surface)] hover:bg-[var(--as-surface2)] text-[12.5px] text-left transition-all hover:-translate-y-px"
                    style={{ animation: `as-row-in 420ms ${i * 70}ms backwards cubic-bezier(.2,.7,.2,1)` }}>
                    {text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {thread.map((m) => m.role === "user" ? <UserBubble key={m.id} text={m.text} /> : <AIBubble key={m.id} text={m.text} chart={m.chart} />)}
        {thinking && <ThinkingBubble />}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(query); }}
        className="sticky bottom-2 mt-3 rounded-2xl border border-[var(--as-line-strong)] bg-[var(--as-surface)] p-2 flex items-end gap-2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.18)]">
        <textarea ref={inputRef} rows={1} value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(query); } }}
          placeholder={t("nlq_placeholder")}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-[14px] focus:outline-none min-h-[44px] max-h-[140px]" />
        <button type="submit" disabled={!query.trim() || thinking}
          className="h-10 px-4 rounded-xl bg-[var(--as-fg)] text-[var(--as-bg)] hover:opacity-90 disabled:opacity-40 text-[13px] font-medium transition-opacity inline-flex items-center gap-2">
          {t("ask")}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </form>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end my-3 as-anim-in-fast">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[var(--as-fg)] text-[var(--as-bg)] px-4 py-2.5 text-[13.5px]">{text}</div>
    </div>
  );
}

function AIBubble({ text, chart }) {
  return (
    <div className="flex gap-3 my-3 as-anim-in">
      <div className="h-8 w-8 rounded-full bg-[var(--as-surface2)] grid place-items-center flex-shrink-0 text-[11px] font-bold">AS</div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-[var(--as-surface)] border border-[var(--as-line)] p-4">
        <p className="text-[13.5px] leading-relaxed">{text}</p>
        {chart && <div className="mt-3"><ChartPanel kind={chart} /></div>}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3 my-3 as-anim-in-fast">
      <div className="h-8 w-8 rounded-full bg-[var(--as-surface2)] grid place-items-center flex-shrink-0 text-[11px] font-bold">AS</div>
      <div className="rounded-2xl rounded-tl-md bg-[var(--as-surface)] border border-[var(--as-line)] px-4 py-3 inline-flex items-center gap-2 text-[12px] text-[var(--as-muted)]">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--as-muted)]" style={{ animation: `as-dot 1s ${i * 0.18}s infinite` }} />)}
        </span>
        {t("thinking")}
      </div>
    </div>
  );
}

function ChartPanel({ kind }) {
  if (kind === "marketing") {
    const data = [
      { label: "Jan", v: 2100 }, { label: "Feb", v: 2800 }, { label: "Mar", v: 3250 },
      { label: "Apr", v: 1950 }, { label: "May", v: 2300 }, { label: "Jun", v: 2600 },
    ];
    const max = 3500;
    return (
      <div className="rounded-xl bg-[var(--as-surface2)]/60 p-4">
        <div className="flex items-end gap-3 h-28">
          {data.map((d) => {
            const isMarch = d.label === "Mar";
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full rounded-t-md transition-all" style={{
                  height: `${(d.v / max) * 100}%`,
                  background: isMarch ? "var(--as-fg)" : "var(--as-line-strong)",
                  animation: `as-grow-up 720ms cubic-bezier(.2,.7,.2,1) backwards`,
                }} />
                <span className={`text-[10px] ${isMarch ? "font-semibold" : "text-[var(--as-muted)]"}`}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (kind === "topclients") {
    const clients = [
      { name: "Mueller GmbH", v: 42800 }, { name: "Nexa Studio", v: 28400 },
      { name: "Aether Capital", v: 19200 }, { name: "Brandt Solo", v: 14600 }, { name: "Keller & Co.", v: 9800 },
    ];
    const max = 45000;
    return (
      <div className="rounded-xl bg-[var(--as-surface2)]/60 p-4 space-y-2">
        {clients.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="text-[10.5px] w-5 text-center text-[var(--as-muted)] font-semibold tabular-nums">{i + 1}</span>
            <span className="text-[12px] w-36 truncate font-medium">{c.name}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--as-line)] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${(c.v / max) * 100}%`, background: "var(--as-pos)",
                animation: `as-grow-right 900ms ${i * 90}ms cubic-bezier(.2,.7,.2,1) backwards`,
              }} />
            </div>
            <span className="tabular-nums text-[11.5px] font-semibold w-20 text-right" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{"\u20AC" + euroNum(c.v)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "runway") {
    return (
      <div className="rounded-xl bg-[var(--as-surface2)]/60 p-4">
        <div className="flex items-end justify-between mb-2">
          <div><div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--as-muted)]">{t("runway_cash")}</div><div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>\u20AC148.200</div></div>
          <div className="text-right"><div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--as-muted)]">{t("runway_burn")}</div><div className="text-[14px] font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>\u20AC13.400</div></div>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--as-line)] overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "92%", background: "linear-gradient(90deg, var(--as-pos), var(--as-attn))", animation: "as-grow-right 900ms cubic-bezier(.2,.7,.2,1)" }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--as-muted)] tabular-nums">
          <span>{t("runway_today")}</span><span className="font-semibold text-[var(--as-fg)]">Dec 2026</span><span>11 mo</span>
        </div>
      </div>
    );
  }
  return null;
}


/* ================================================================
   7. Dashboard / Insights
   ================================================================ */

function Dashboard() {
  useLang();
  return (
    <div className="as-anim-in space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard label={t("kpi_balance")} value="\u20AC148.200" delta="+4.2%" positive />
        <KpiCard label={t("kpi_mtd_in")} value="\u20AC18.600" delta="+12%" positive />
        <KpiCard label={t("kpi_mtd_out")} value="\u20AC7.210" delta="\u22123%" positive />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[14px] font-semibold tracking-tight">{t("cash_chart_title")}</h3>
            <span className="text-[11px] text-[var(--as-muted)]">Jan\u2013Dec 2026</span>
          </div>
          <CashChart />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">{t("cat_breakdown")}</h3>
          <CategoryBars />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, positive }) {
  return (
    <div className="rounded-2xl border border-[var(--as-line)] bg-[var(--as-surface)] p-5">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--as-muted)]">{label}</div>
      <div className="mt-2 text-[28px] font-semibold tabular-nums tracking-tight" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{value}</div>
      <div className="mt-1 text-[12px] tabular-nums" style={{ color: positive ? "var(--as-pos)" : "var(--as-neg)" }}>{delta} {t("vs_last")}</div>
    </div>
  );
}

function CashChart() {
  const pts = [92, 98, 110, 118, 128, 134, 131, 138, 142, 148, 148, 148];
  const max = 160, min = 80;
  const scaleY = (v) => 140 - ((v - min) / (max - min)) * 130;
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * 600} ${scaleY(v)}`).join(" ");
  const area = path + ` L 600 150 L 0 150 Z`;
  return (
    <svg viewBox="0 0 600 160" className="w-full mt-4 h-48 overflow-visible">
      <defs>
        <linearGradient id="cash-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--as-pos)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--as-pos)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cash-grad)" style={{ animation: "as-fade-in 900ms both" }} />
      <path d={path} fill="none" stroke="var(--as-pos)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: "as-draw 1400ms cubic-bezier(.2,.7,.2,1) forwards" }} />
      {pts.map((v, i) => (
        <circle key={i} cx={(i / (pts.length - 1)) * 600} cy={scaleY(v)} r="3" fill="var(--as-surface)" stroke="var(--as-pos)" strokeWidth="1.5"
          style={{ opacity: 0, animation: `as-fade-in 400ms ${600 + i * 40}ms forwards` }} />
      ))}
    </svg>
  );
}

function CategoryBars() {
  const cats = [
    { key: "marketing", v: 3250 }, { key: "software", v: 1840 }, { key: "reisekosten", v: 1210 },
    { key: "bewirtung", v: 620 }, { key: "miete", v: 950 }, { key: "sonstiges", v: 480 },
  ];
  const max = Math.max(...cats.map((c) => c.v));
  return (
    <div className="mt-4 space-y-3">
      {cats.map((c, i) => {
        const color = catColor(c.key);
        return (
          <div key={c.key} className="flex items-center gap-3">
            <span className="text-[12px] w-28 truncate font-medium">{catLabel(c.key)}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--as-line)] overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${(c.v / max) * 100}%`, background: color,
                animation: `as-grow-right 900ms ${i * 80}ms cubic-bezier(.2,.7,.2,1) backwards`,
              }} />
            </div>
            <span className="tabular-nums text-[11.5px] font-semibold w-16 text-right" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{"\u20AC" + euroNum(c.v)}</span>
          </div>
        );
      })}
    </div>
  );
}


/* ================================================================
   8. Shell / Main App
   ================================================================ */

function App() {
  const [lang, setLang] = useState(getLang());
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("sheet");
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => { setLang(lang); }, [lang]);
  useEffect(() => { document.documentElement.classList.toggle("as-dark", dark); }, [dark]);

  const tabs = [
    { id: "sheet",     label: t("tab_sheet"),     icon: "sheet" },
    { id: "import",    label: t("tab_import"),    icon: "upload" },
    { id: "nlq",       label: t("tab_nlq"),       icon: "msg" },
    { id: "dashboard", label: t("tab_dashboard"), icon: "chart" },
  ];

  return (
    <div className="min-h-screen as-root">
      <header className="sticky top-0 z-40 border-b border-[var(--as-line)] bg-[var(--as-bg)]/80 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center gap-4">
          <button className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-[var(--as-surface2)]" onClick={() => setMobileNav((v) => !v)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <Logo />
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`relative h-9 px-3.5 inline-flex items-center gap-2 rounded-lg text-[13px] font-medium transition-colors ${tab === tb.id ? "text-[var(--as-fg)] bg-[var(--as-surface2)]" : "text-[var(--as-muted)] hover:text-[var(--as-fg)]"}`}>
                <TabIcon kind={tb.icon} />{tb.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitch lang={lang} setLang={setLang} />
            <button onClick={() => setDark((d) => !d)} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-[var(--as-surface2)] text-[var(--as-muted)] hover:text-[var(--as-fg)] transition-colors" aria-label="Toggle theme">
              {dark ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-[var(--as-fg)] text-[var(--as-bg)] grid place-items-center text-[11px] font-semibold">AS</div>
          </div>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-[var(--as-line)] px-2 py-2 flex gap-1 overflow-x-auto">
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => { setTab(tb.id); setMobileNav(false); }}
                className={`h-9 px-3 rounded-lg text-[13px] font-medium whitespace-nowrap ${tab === tb.id ? "bg-[var(--as-surface2)]" : "text-[var(--as-muted)]"}`}>
                {tb.label}
              </button>
            ))}
          </div>
        )}
      </header>
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {tab === "sheet" && (<>
          <PageHeader title={t("page_sheet_title")} sub={t("page_sheet_sub")} />
          <Spreadsheet />
        </>)}
        {tab === "import" && (<>
          <PageHeader title={t("page_import_title")} sub={t("page_import_sub")} />
          <ImportView />
        </>)}
        {tab === "nlq" && (<>
          <PageHeader title={t("page_nlq_title")} sub={t("page_nlq_sub")} />
          <NLQ />
        </>)}
        {tab === "dashboard" && (<>
          <PageHeader title={t("page_dash_title")} sub={t("page_dash_sub")} />
          <Dashboard />
        </>)}
      </main>
      <footer className="border-t border-[var(--as-line)] mt-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between text-[11.5px] text-[var(--as-muted)]">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--as-pos)] animate-pulse" />
            <span>{t("footer_sync")}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{t("footer_privacy")}</span>
            <span>{t("footer_gobd")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-7 w-7">
        <div className="absolute inset-0 rounded-lg bg-[var(--as-fg)]" />
        <svg viewBox="0 0 24 24" className="absolute inset-0 text-[var(--as-bg)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <path d="M5 10h14M10 10v9" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="text-[14px] font-semibold tracking-tight">AnimaSheets</div>
        <div className="text-[9.5px] uppercase tracking-[0.18em] text-[var(--as-muted)] mt-0.5">CFO</div>
      </div>
    </div>
  );
}

function TabIcon({ kind }) {
  const C = "h-4 w-4";
  if (kind === "sheet") return <svg viewBox="0 0 24 24" className={C} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M9 10v9M14 10v9"/></svg>;
  if (kind === "upload") return <svg viewBox="0 0 24 24" className={C} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 16V4M8 8l4-4 4 4M4 20h16"/></svg>;
  if (kind === "msg") return <svg viewBox="0 0 24 24" className={C} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  if (kind === "chart") return <svg viewBox="0 0 24 24" className={C} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 3v18h18M7 15l4-4 3 3 5-6"/></svg>;
  return null;
}

function LangSwitch({ lang, setLang }) {
  return (
    <div className="hidden sm:inline-flex items-center rounded-full border border-[var(--as-line)] overflow-hidden text-[11px] font-semibold tracking-wide">
      {["de", "en"].map((l) => (
        <button key={l} onClick={() => setLang(l)} className={`px-2.5 h-7 uppercase transition-colors ${lang === l ? "bg-[var(--as-fg)] text-[var(--as-bg)]" : "text-[var(--as-muted)] hover:text-[var(--as-fg)]"}`}>{l}</button>
      ))}
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-[26px] md:text-[32px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-[13.5px] text-[var(--as-muted)] max-w-xl">{sub}</p>
      </div>
    </div>
  );
}

/* ================================================================
   9. Export
   ================================================================ */

export default App;
