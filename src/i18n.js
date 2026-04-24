// i18n dictionary + helpers, ES module.
import React from "react";

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
  nlq_hint:          { en: "Press ",                    de: "Drücke ",                      es: "Pulsa " },
  nlq_empty:         { en: "No rows matched your question.", de: "Keine Zeilen passen zu deiner Frage.", es: "Ninguna fila coincide con tu pregunta." },
  nlq_unavailable:   { en: "AI query is unavailable in this build. Configure window.claude.complete() to enable.",
                       de: "KI-Abfrage ist in diesem Build nicht verfügbar. Konfiguriere window.claude.complete() um sie zu aktivieren.",
                       es: "La consulta por IA no está disponible en esta versión. Configura window.claude.complete() para habilitarla." },

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

let LANG = (typeof localStorage !== "undefined" && localStorage.getItem("as_lang")) || "en";
const listeners = new Set();

export function setLang(l) {
  LANG = l;
  try { localStorage.setItem("as_lang", l); } catch {}
  listeners.forEach(fn => fn(l));
}

export function getLang() { return LANG; }

export function t(key, vars) {
  const entry = I18N[key];
  if (!entry) return key;
  let s = entry[LANG] || entry.en || key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

export function tCat(key) { return t("cat_" + key); }

export function tRow(row) {
  return {
    desc: row.descKey ? t(row.descKey) : (row.desc || ""),
    note: row.noteKey ? (row.noteKey === "" ? "" : t(row.noteKey)) : (row.note || ""),
    counterparty: row.counterparty || "",
  };
}

export function tSheetName(sheet) {
  if (sheet.nameKey) return t(sheet.nameKey);
  return sheet.name || sheet.id;
}

export function useLang() {
  const [l, setL] = React.useState(LANG);
  React.useEffect(() => {
    const fn = (v) => setL(v);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return l;
}

export function localizedMonthLabel(key) {
  const map = {
    nov: { en: "Nov 2025", de: "Nov 2025", es: "Nov 2025" },
    dec: { en: "Dec 2025", de: "Dez 2025", es: "Dic 2025" },
    jan: { en: "Jan 2026", de: "Jan 2026", es: "Ene 2026" },
    feb: { en: "Feb 2026", de: "Feb 2026", es: "Feb 2026" },
    mar: { en: "Mar 2026", de: "Mär 2026", es: "Mar 2026" },
    apr: { en: "Apr 2026", de: "Apr 2026", es: "Abr 2026" },
  };
  return (map[key] && map[key][LANG]) || key;
}
