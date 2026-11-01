// ============================================================================
// ARCHIVO: pronosticos.js - Motor en Vivo, 10 Pronósticos de Hoy y 24 Históricos
// ============================================================================
const DB_KEY = "optacore_master_feed_v100";
const API_SYNC_THROTTLE_MS = 5 * 60 * 1000;
let activeQuickFilter = "ALL";
let currentLang = localStorage.getItem("optacore_lang") || "ES";
localStorage.removeItem("optacore_maintenance_mode");
const SAFE_CONFIG = {
  TIMEZONE: "America/Bogota",
  SPORTS_API_HOST: "v3.football.api-sports.io",
  SPORTS_API_KEY: "0d242e4cfb0ebf2bca5b089f6bfe2b92",
  WHATSAPP_LINK: "https://wa.me/573332861551?text=Hola%20equipo%20OptaCore,%20deseo%20activar%20mi%20membres%C3%ADa%20VIP",
  ADMIN_EMAIL: "admin@optacore.com",
  PROMO_CODES: [
    { code: "PROMO20", discountPct: 20, promoter: "Campaña General" },
    { code: "VIP20", discountPct: 20, promoter: "Canal VIP" }
  ]
};
function checkUserVipOrAdmin() {
  const role = localStorage.getItem("optacore_user_role");
  const email = (localStorage.getItem("optacore_user_email") || "").toLowerCase();
  if (role === "ADMIN" || role === "VIP" || email === SAFE_CONFIG.ADMIN_EMAIL) return true;
  const exp = parseInt(localStorage.getItem("optacore_vip_expires_timestamp") || "0", 10);
  return exp > Date.now();
}
function getColombiaDateString() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: SAFE_CONFIG.TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  } catch (e) {
    return "2026-11-01";
  }
}
const STATIC_I18N = {
  "PRONÓSTICOS DE ALTA PROBABILIDAD": "HIGH PROBABILITY PREDICTIONS",
  "FÚTBOL & NBA": "FOOTBALL & NBA",
  "Pronósticos Hoy": "Today's Picks",
  "Resultados Hoy": "Today's Results",
  "Historial & Aciertos": "History & Win Rate",
  "Planes VIP & Cuentas": "VIP Plans & Accounts",
  "Mi Licencia & Referidos": "My License & Referrals",
  "⚙️ Panel Admin": "⚙️ Admin Panel",
  "🔑 Canjear Llave": "🔑 Redeem Key",
  "Prueba 24h": "24h Trial",
  "Registrarse": "Sign Up",
  "Entrar": "Log In",
  "Salir": "Log Out",
  "💰 Calculadora de Ganancia en Tiempo Real": "💰 Real-Time Profit Calculator",
  "Ingresa cuánto deseas invertir para ver el cobro exacto en cada tarjeta:": "Enter your stake amount to see the exact payout on every card:",
  "Inversión ($ COP):": "Stake ($ COP):",
  "Cartelera Oficial del Día": "Official Daily Matchday Card",
  "Todos": "All",
  "⚽ Solo Fútbol": "⚽ Football Only",
  "🏀 Solo NBA": "🏀 NBA Only",
  "🔓 Solo Gratis": "🔓 Free Only",
  "🔴 En Vivo Ahora": "🔴 Live Now",
  "Auditoría de Resultados del Día": "Daily Results Audit",
  "Calificación transparente de los partidos finalizados y generador de tickets de victoria.": "Transparent grading of finished matches and win ticket generator.",
  "Curva de Rendimiento Acumulado": "Cumulative Performance Curve",
  "AUDITORÍA CRONOLÓGICA": "CHRONOLOGICAL AUDIT",
  "Historial de Partidos (Desde el Más Reciente)": "Match History (Newest First)",
  "Toca cualquier fila para ver el análisis completo o generar Ticket": "Tap any row to view full analysis or generate Win Ticket",
  "Fecha": "Date",
  "Deporte / Liga": "Sport / League",
  "Partido": "Match",
  "Pronóstico": "Prediction",
  "Cuota": "Odds",
  "Marcador": "Score",
  "Resultado": "Outcome",
  "Acción": "Action",
  "Planes de Membresía VIP": "VIP Membership Plans",
  "Precios en COP y USDT.": "Prices in COP and USDT.",
  "🎟️ ¿Tienes código de promotor (-20%)?": "🎟️ Have a promoter code (-20%)?",
  "Sin aplicar": "Not applied",
  "Aplicar": "Apply",
  "Medios de Pago Oficiales": "Official Payment Methods",
  "Activación Inmediata": "Instant Activation",
  "Transfiere a Nequi, Bancolombia o Binance y reporta el comprobante por WhatsApp:": "Transfer via Nequi, Bancolombia or Binance and send your receipt via WhatsApp:",
  "WHATSAPP OFICIAL:": "OFFICIAL WHATSAPP:",
  "Enviar Comprobante por WhatsApp": "Send Receipt via WhatsApp",
  "Estado de tu Licencia": "Your License Status",
  "🔑 CANJEAR LLAVE DE ACCESO": "🔑 REDEEM ACCESS KEY",
  "Ingresa tu llave de cortesía para activar tus días de acceso VIP:": "Enter your courtesy key to activate your VIP access days:",
  "CÓDIGO DE LA LLAVE": "KEY CODE",
  "CANJEAR Y ACTIVAR DÍAS VIP": "REDEEM & ACTIVATE VIP DAYS",
  "REGISTRO DE USUARIO": "USER REGISTRATION",
  "INICIAR SESIÓN": "LOG IN",
  "CORREO ELECTRÓNICO OFICIAL": "OFFICIAL EMAIL ADDRESS",
  "CONTRASEÑA (MÍNIMO 6 CARACTERES)": "PASSWORD (MIN. 6 CHARACTERS)",
  "CREAR CUENTA": "CREATE ACCOUNT",
  "CREAR MI CUENTA": "CREATE MY ACCOUNT",
  "ENTRAR A MI CUENTA": "LOG INTO MY ACCOUNT",
  "¿Ya tienes cuenta? Inicia sesión aquí": "Already have an account? Log in here",
  "¿No tienes cuenta aún? Regístrate aquí": "Don't have an account yet? Sign up here",
  "OPTACORE.QUANT © 2026 — Inteligencia Estadística para Pronósticos Deportivos (+18).": "OPTACORE.QUANT © 2026 — Statistical Intelligence for Sports Predictions (+18).",
  "⚙️ Consola de Administración en Vivo": "⚙️ Live Admin Console",
  "Actualiza marcadores, sincroniza resultados en lote, agrega partidos y promotores.": "Update scores, batch-sync results, add matches and promoters.",
  "⚡ Sincronizar API (1 Crédito)": "⚡ Sync API (1 Credit)",
  "Restaurar Base": "Reset Database",
  "+ Generar Llave de Acceso": "+ Generate Access Key",
  "Guardar Llave Activa": "Save Active Key",
  "+ Registrar Promotor (-20%)": "+ Register Promoter (-20%)",
  "Activar Promotor": "Activate Promoter",
  "Auditoría de Ventas por Promotor": "Promoter Sales Audit",
  "+ Agregar Nuevo Pronóstico": "+ Add New Prediction",
  "Publicar Pronóstico Ahora": "Publish Prediction Now",
  "Editar Marcadores y Estados": "Edit Scores & Statuses",
  "Cartelera": "Picks",
  "Resultados": "Results",
  "Historial": "History",
  "Planes": "Plans",
  "Cuenta": "Account"
};
const REVERSE_STATIC_I18N = Object.fromEntries(Object.entries(STATIC_I18N).map(([k, v]) => [v, k]));
function trText(str) {
  if (!str || currentLang === "ES") return str || "";
  let s = String(str);
  const exactMap = {
    "FÚTBOL": "FOOTBALL",
    "FINALIZADO": "FINISHED",
    "PROGRAMADO": "SCHEDULED",
    "EN_VIVO": "LIVE",
    "ACIERTO": "WIN",
    "FALLO": "LOSS",
    "PENDIENTE": "PENDING",
    "EXIGENCIA MEDIA": "MEDIUM STRAIN",
    "🔥 CALOR EXTREMO / DESGASTE RIVAL": "🔥 EXTREME HEAT / RIVAL FATIGUE",
    "⛰️ AHOGO POR ALTURA (+1.400m)": "⛰️ HIGH ALTITUDE HYPOXIA (+1,400m)",
    "⚡ CÉSPED RÁPIDO / ALTA VELOCIDAD": "⚡ FAST PITCH / HIGH PACE",
    "5 ESTRELLAS": "5 STARS",
    "4 ESTRELLAS": "4 STARS",
    "3 ESTRELLAS": "3 STARS"
  };
  if (exactMap[s]) return exactMap[s];
  const replacements = [
    ["Liverpool Gana o Empata (1X) + Más de 1.5 Goles Totales", "Liverpool Wins or Draws (1X) + Over 1.5 Total Goals"],
    ["Real Madrid Gana Directo + Más de 1.5 Goles Totales", "Real Madrid Direct Win + Over 1.5 Total Goals"],
    ["Menos de 2.5 Goles Totales", "Under 2.5 Total Goals"],
    ["Boston Celtics Gana Directo (Moneyline)", "Boston Celtics Direct Win (Moneyline)"],
    ["Independiente Medellín Gana Directo (1X2)", "Independiente Medellin Direct Win (1X2)"],
    ["Lazio Gana o Empata (1X) + Más de 1.5 Goles Totales", "Lazio Wins or Draws (1X) + Over 1.5 Total Goals"],
    ["Athletic Club Gana o Empata (1X) + Menos de 3.5 Goles", "Athletic Club Wins or Draws (1X) + Under 3.5 Goals"],
    ["Menos de 232.5 Puntos Totales (Línea Protegida)", "Under 232.5 Total Points (Protected Line)"],
    ["Golden State Warriors Hándicap -2.5 (Línea Corta)", "Golden State Warriors Handicap -2.5 (Short Line)"],
    ["Los Angeles Lakers Gana Directo + Más de 215.5 Puntos", "LA Lakers Direct Win + Over 215.5 Points"],
    ["⚡ EN ESPERA DE INICIO", "⚡ WAITING FOR KICKOFF"],
    ["🔒 EXCLUSIVO MIEMBROS VIP", "🔒 VIP MEMBERS EXCLUSIVE"]
  ];
  for (const [es, en] of replacements) {
    if (s.includes(es)) s = s.replaceAll(es, en);
  }
  return s;
}
function applyStaticDomTranslation() {
  const dict = currentLang === "EN" ? STATIC_I18N : REVERSE_STATIC_I18N;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    const raw = node.nodeValue.trim();
    if (raw && dict[raw]) {
      node.nodeValue = node.nodeValue.replace(raw, dict[raw]);
    }
  }
  const searchIn = document.getElementById("search-input");
  if (searchIn) searchIn.placeholder = currentLang === "EN" ? "Search team or league..." : "Buscar equipo o liga...";
  const promoIn = document.getElementById("input-promo-code");
  if (promoIn) promoIn.placeholder = currentLang === "EN" ? "Ex: PROMO20" : "Ej: PROMO20";
  const keyIn = document.getElementById("input-license-key");
  if (keyIn) keyIn.placeholder = currentLang === "EN" ? "Ex: PRUEBA3D" : "Ej: PRUEBA3D";
  const emailIn = document.getElementById("auth-email");
  if (emailIn) emailIn.placeholder = currentLang === "EN" ? "you@email.com" : "tu@correo.com";
  const timerEl = document.getElementById("cart-closing-timer");
  if (timerEl) timerEl.textContent = currentLang === "EN" ? "⏳ Free card closes in: 02h:14m" : "⏳ Cierre cartelera libre: 02h:14m";
}
function injectLanguageSwitcher() {
  if (document.getElementById("optacore-lang-switcher")) return;
  const box = document.createElement("div");
  box.id = "optacore-lang-switcher";
  box.className = "fixed top-1.5 right-3 z-50 flex items-center gap-1 bg-[#05070a]/95 border border-[#1b2432] p-1 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-mono text-[10px]";
  box.innerHTML = `<button id="btn-lang-es" onclick="window.setAppLanguage('ES')" class="px-2 py-0.5 font-black uppercase transition flex items-center gap-1"><span>🇪🇸</span><span>ES</span></button><button id="btn-lang-en" onclick="window.setAppLanguage('EN')" class="px-2 py-0.5 font-black uppercase transition flex items-center gap-1"><span>🇺🇸</span><span>EN</span></button>`;
  document.body.appendChild(box);
  updateLangButtonsStyle();
}
function updateLangButtonsStyle() {
  const btnEs = document.getElementById("btn-lang-es");
  const btnEn = document.getElementById("btn-lang-en");
  if (!btnEs || !btnEn) return;
  if (currentLang === "ES") {
    btnEs.className = "px-2 py-0.5 font-black uppercase transition flex items-center gap-1 bg-[#10b981] text-slate-950 border border-[#10b981]";
    btnEn.className = "px-2 py-0.5 font-bold uppercase transition flex items-center gap-1 bg-[#0a0e14] text-slate-400 hover:text-white border border-transparent";
  } else {
    btnEn.className = "px-2 py-0.5 font-black uppercase transition flex items-center gap-1 bg-[#06b6d4] text-slate-950 border border-[#06b6d4]";
    btnEs.className = "px-2 py-0.5 font-bold uppercase transition flex items-center gap-1 bg-[#0a0e14] text-slate-400 hover:text-white border border-transparent";
  }
}
window.setAppLanguage = (lang) => {
  currentLang = lang === "EN" ? "EN" : "ES";
  localStorage.setItem("optacore_lang", currentLang);
  updateLangButtonsStyle();
  applyStaticDomTranslation();
  renderLiveTickerAndStreak();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
  if (window.renderAdminPanel) window.renderAdminPanel();
  const waBtn = document.getElementById("btn-wa-floating");
  if (waBtn) {
    waBtn.innerHTML = `<span>💬 ${currentLang === "EN" ? "VIP WhatsApp (+57 333 286 1551)" : "WhatsApp VIP (+57 333 286 1551)"}</span>`;
  }
};
function getStars(prob = 90) {
  const tag5 = currentLang === "EN" ? "5 STARS" : "5 ESTRELLAS";
  const tag4 = currentLang === "EN" ? "4 STARS" : "4 ESTRELLAS";
  const tag3 = currentLang === "EN" ? "3 STARS" : "3 ESTRELLAS";
  if (prob >= 90) return { stars: "⭐⭐⭐⭐⭐", tag: tag5, badge: "border-cyan-400 bg-cyan-500/15 text-cyan-300" };
  if (prob >= 85) return { stars: "⭐⭐⭐⭐", tag: tag4, badge: "border-emerald-400 bg-emerald-500/15 text-emerald-300" };
  return { stars: "⭐⭐⭐", tag: tag3, badge: "border-slate-600 bg-slate-800 text-slate-300" };
}
function getPitchFeverBar(altitudeM = 100, weatherDesc = "") {
  const w = String(weatherDesc || "").toLowerCase();
  let stressScore = 45;
  let label = currentLang === "EN" ? "MEDIUM STRAIN" : "EXIGENCIA MEDIA";
  let color = "bg-cyan-400";
  if (w.includes("31°c") || w.includes("33°c") || w.includes("30°c") || w.includes("27°c") || w.includes("calor") || w.includes("humed")) {
    stressScore = 92;
    label = currentLang === "EN" ? "🔥 EXTREME HEAT / RIVAL FATIGUE" : "🔥 CALOR EXTREMO / DESGASTE RIVAL";
    color = "bg-amber-500";
  } else if (Number(altitudeM) >= 1400) {
    stressScore = 88;
    label = currentLang === "EN" ? "⛰️ HIGH ALTITUDE HYPOXIA (+1,400m)" : "⛰️ AHOGO POR ALTURA (+1.400m)";
    color = "bg-emerald-400";
  } else if (w.includes("10°c") || w.includes("11°c") || w.includes("12°c") || w.includes("frío") || w.includes("frio") || w.includes("fresco")) {
    stressScore = 65;
    label = currentLang === "EN" ? "⚡ FAST PITCH / HIGH PACE" : "⚡ CÉSPED RÁPIDO / ALTA VELOCIDAD";
    color = "bg-[#06b6d4]";
  }
  return { stressScore, label, color };
}
const LOGOS = {
  "Liverpool FC": "https://media.api-sports.io/football/teams/40.png",
  "Arsenal FC": "https://media.api-sports.io/football/teams/42.png",
  "Racing de Santander": "https://media.api-sports.io/football/teams/726.png",
  "Getafe CF": "https://media.api-sports.io/football/teams/546.png",
  "Sevilla FC": "https://media.api-sports.io/football/teams/536.png",
  "Orlando Magic": "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg",
  "Boston Celtics": "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg",
  "Independiente Medellín": "https://media.api-sports.io/football/teams/1138.png",
  "Alianza FC": "https://media.api-sports.io/football/teams/1128.png",
  "SS Lazio": "https://media.api-sports.io/football/teams/487.png",
  "Cagliari Calcio": "https://media.api-sports.io/football/teams/490.png",
  "Athletic Club": "https://media.api-sports.io/football/teams/531.png",
  "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
  "Indiana Pacers": "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg",
  "Brooklyn Nets": "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg",
  "Golden State Warriors": "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
  "LA Clippers": "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg",
  "Los Angeles Lakers": "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
  "Toronto Raptors": "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg",
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Bayern Múnich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Deportivo Alavés": "https://media.api-sports.io/football/teams/542.png",
  "Llaneros FC": "https://media.api-sports.io/football/teams/1142.png",
  "Junior de Barranquilla": "https://media.api-sports.io/football/teams/1126.png",
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png"
};
function getLogo(name) {
  return LOGOS[name] || "https://media.api-sports.io/football/teams/default.png";
}
function seedMasterRecords() {
  const today = getColombiaDateString();
  const cached = localStorage.getItem(DB_KEY);
  if (cached) {
    try {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length >= 34) return list;
    } catch (e) {}
  }
  const makeIso = (d, hhmm) => `${d}T${hhmm}:00-05:00`;
  const records = [
    // --- 10 PRONÓSTICOS DE HOY (1 DE NOVIEMBRE DE 2026) ---
    {
      id: "20261101-01",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Premier League (Inglaterra)",
      homeTeam: "Liverpool FC",
      awayTeam: "Arsenal FC",
      marketEquivalent: "Doble Oportunidad (Liverpool o Empate) + Total Goles Más de 1.5",
      liveOddDrop: "@1.68 ➔ @1.52",
      predictionText: "Liverpool Gana o Empata (1X) + Más de 1.5 Goles Totales",
      odds: 1.52,
      probability: 93.8,
      isFree: true,
      altitudeM: 70,
      weatherDesc: "Clima fresco (11°C)",
      homeAvgGoals: "2.6 por partido",
      awayAvgGoals: "1.9 por partido",
      liveStats: { possession: "58% - 42%", shots: "16 (7 al arco) - 10 (4 al arco)", corners: "7 - 4", fouls: "11 - 12" },
      pickProgressPct: 100,
      pickProgressLabel: "✔ FINALIZADO (2-2)",
      explanation: "Liverpool en Anfield propuso ritmo alto y empató 2-2 en un partido de ida y vuelta que cubrió con holgura el 1X y la línea de goles.",
      liveScore: "2 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
      simulatedDurationMinutes: 115
    },
    {
      id: "20261101-02",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "10:15"),
      kickoffLabel: "10:15 COL",
      league: "LaLiga (España)",
      homeTeam: "Racing de Santander",
      awayTeam: "Real Madrid",
      marketEquivalent: "Resultado del partido (Gana Real Madrid) y Más de 1.5 Goles",
      liveOddDrop: "@1.60 ➔ @1.48",
      predictionText: "Real Madrid Gana Directo + Más de 1.5 Goles Totales",
      odds: 1.48,
      probability: 94.2,
      isFree: true,
      altitudeM: 15,
      weatherDesc: "Templado (17°C)",
      homeAvgGoals: "1.1 por partido",
      awayAvgGoals: "2.8 por partido",
      liveStats: { possession: "34% - 66%", shots: "6 (2 al arco) - 18 (9 al arco)", corners: "3 - 8", fouls: "15 - 7" },
      pickProgressPct: 100,
      pickProgressLabel: "✔ FINALIZADO (0-3)",
      explanation: "Jerarquía individual total del Real Madrid en El Sardinero para llevarse la victoria 0-3 con doblete al contraataque.",
      liveScore: "0 - 3",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
      simulatedDurationMinutes: 115
    },
    {
      id: "20261101-03",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "08:00"),
      kickoffLabel: "08:00 COL",
      league: "LaLiga (España)",
      homeTeam: "Getafe CF",
      awayTeam: "Sevilla FC",
      marketEquivalent: "Total de Goles: Menos de 2.5 (Máximo 2 goles en el partido)",
      liveOddDrop: "@1.62 ➔ @1.50",
      predictionText: "Menos de 2.5 Goles Totales",
      odds: 1.50,
      probability: 88.5,
      isFree: true,
      altitudeM: 620,
      weatherDesc: "Templado (15°C)",
      homeAvgGoals: "0.9 por partido",
      awayAvgGoals: "1.0 por partido",
      liveStats: { possession: "48% - 52%", shots: "7 (2 al arco) - 8 (3 al arco)", corners: "4 - 4", fouls: "19 - 16" },
      pickProgressPct: 100,
      pickProgressLabel: "✔ FINALIZADO (1-0)",
      explanation: "Partido cerrado y de fricción táctica característico en el Coliseum que culminó 1-0 a favor del local.",
      liveScore: "1 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
      simulatedDurationMinutes: 115
    },
    {
      id: "20261101-04",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: today,
      kickoffIso: makeIso(today, "15:30"),
      kickoffLabel: "15:30 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Orlando Magic",
      awayTeam: "Boston Celtics",
      marketEquivalent: "Ganador del Partido (Incluye Prórroga): Boston Celtics",
      liveOddDrop: "@1.65 ➔ @1.55",
      predictionText: "Boston Celtics Gana Directo (Moneyline)",
      odds: 1.55,
      probability: 89.0,
      isFree: true,
      altitudeM: 25,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "107 pts esperados",
      awayAvgGoals: "118 pts esperados",
      liveStats: { possession: "Ritmo rápido", shots: "44% TC - 51% TC", corners: "-", fouls: "18 - 15" },
      pickProgressPct: 100,
      pickProgres
