// ============================================================================
// ARCHIVO: pronosticos.js - 34 Partidos (10 Hoy + 24 Historial), Bilingüe y Sin Mantenimiento
// ============================================================================
import { CONFIG } from "./config.js";
import { isUserVipOrAdmin } from "./auth.js";
const DB_KEY = "optacore_master_feed_v35";
const API_SYNC_THROTTLE_MS = 10 * 60 * 1000;
let activeQuickFilter = "ALL";
let currentLang = localStorage.getItem("optacore_lang") || "ES";
localStorage.removeItem("optacore_maintenance_mode");
export function getColombiaDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG?.BRAND?.TIMEZONE || "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
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
    ["Doble Oportunidad (Liverpool o Empate) + Total Goles Más de 1.5", "Double Chance (Liverpool or Draw) + Over 1.5 Total Goals"],
    ["Real Madrid Gana Directo + Más de 1.5 Goles Totales", "Real Madrid Direct Win + Over 1.5 Total Goals"],
    ["Resultado del partido (Gana Real Madrid) y Más de 1.5 Goles", "Match Winner (Real Madrid) & Over 1.5 Goals"],
    ["Total de Goles: Menos de 2.5 (Máximo 2 goles en el partido)", "Total Goals: Under 2.5 (Max 2 goals in match)"],
    ["Boston Celtics Gana Directo (Moneyline)", "Boston Celtics Direct Win (Moneyline)"],
    ["Ganador del Partido (Incluye Prórroga): Boston Celtics", "Match Winner (Incl. OT): Boston Celtics"],
    ["Independiente Medellín Gana Directo (1X2)", "Independiente Medellin Direct Win (1X2)"],
    ["Tiempo Reglamentario: Gana Independiente Medellín", "Regular Time: Independiente Medellin Wins"],
    ["Lazio Gana o Empata (1X) + Más de 1.5 Goles Totales", "Lazio Wins or Draws (1X) + Over 1.5 Total Goals"],
    ["Doble Oportunidad Lazio/Empate y Total de Goles Más de 1.5", "Double Chance Lazio/Draw & Over 1.5 Total Goals"],
    ["Athletic Club Gana o Empata (1X) + Menos de 3.5 Goles", "Athletic Club Wins or Draws (1X) + Under 3.5 Goals"],
    ["Doble Oportunidad (Athletic o Empate) y Menos de 3.5 Goles", "Double Chance (Athletic or Draw) & Under 3.5 Goals"],
    ["Menos de 232.5 Puntos Totales (Línea Protegida)", "Under 232.5 Total Points (Protected Line)"],
    ["Total de Puntos (Incluye Prórroga): Menos de 232.5", "Total Points (Incl. OT): Under 232.5"],
    ["Golden State Warriors Hándicap -2.5 (Línea Corta)", "Golden State Warriors Handicap -2.5 (Short Line)"],
    ["Hándicap del Partido (Incluye Prórroga): Warriors -2.5", "Match Handicap (Incl. OT): Warriors -2.5"],
    ["Los Angeles Lakers Gana Directo + Más de 215.5 Puntos", "LA Lakers Direct Win + Over 215.5 Points"],
    ["Gana LA Lakers y Total de Puntos Más de 215.5", "LA Lakers Win & Total Points Over 215.5"],
    ["⚡ EN ESPERA DE INICIO", "⚡ WAITING FOR KICKOFF"],
    ["🔒 EXCLUSIVO MIEMBROS VIP", "🔒 VIP MEMBERS EXCLUSIVE"],
    ["Gana Manchester City + Total Goles Más de 1.5", "Man City Wins + Over 1.5 Total Goals"],
    ["Manchester City Gana + Más de 1.5 Goles Totales", "Manchester City Wins + Over 1.5 Total Goals"],
    ["Línea de Goles: Más de 2.5 (3 goles o más en total)", "Goal Line: Over 2.5 (3 or more total goals)"],
    ["Más de 2.5 Goles Totales (Mínimo 3 goles)", "Over 2.5 Total Goals (Min. 3 goals)"],
    ["Hándicap -1.5 (Barcelona gana por 2 o más goles)", "Handicap -1.5 (Barcelona wins by 2+ goals)"],
    ["Barcelona Gana por 2 o más goles (Hándicap -1.5)", "Barcelona Wins by 2+ goals (Handicap -1.5)"],
    ["Doble Oportunidad X2 (Empate o Junior) + Más de 1.5 Goles", "Double Chance X2 (Draw or Junior) + Over 1.5 Goals"],
    ["Junior Gana o Empata (X2) + Más de 1.5 Goles", "Junior Wins or Draws (X2) + Over 1.5 Goals"],
    ["Línea Alternativa de Puntos Totales: Más de 214.5", "Alt Total Points Line: Over 214.5"],
    ["Más de 214.5 Puntos Totales (Línea Protegida)", "Over 214.5 Total Points (Protected Line)"],
    ["Apuesta Sin Empate (DNB Bucaramanga)", "Draw No Bet (DNB Bucaramanga)"],
    ["Bucaramanga Empate No Acción (DNB)", "Bucaramanga Draw No Bet (DNB)"],
    ["Total Puntos Combinados: Más de 227.5", "Combined Total Points: Over 227.5"],
    ["Más de 227.5 Puntos Totales Combinados", "Over 227.5 Combined Total Points"],
    ["Menos de 2.5 Goles Totales", "Under 2.5 Total Goals"],
    ["Leverkusen Gana + Más de 2.5 Goles", "Leverkusen Wins + Over 2.5 Goals"],
    ["Doble Oportunidad 1X + Más de 1.5 Goles", "Double Chance 1X + Over 1.5 Goals"],
    ["América Gana o Empata (1X) + Más de 1.5 Goles", "America Wins or Draws (1X) + Over 1.5 Goals"],
    ["Hándicap Sacramento Kings -6.5", "Sacramento Kings Handicap -6.5"],
    ["Sacramento Kings Hándicap -6.5", "Sacramento Kings Handicap -6.5"],
    ["Alavés Gana 1T / Final", "Alaves Wins HT / FT"],
    ["Alavés Gana Descanso / Final", "Alaves Wins HT / FT"],
    ["Puntos Jugador: Kevin Durant Más de 24.5", "Player Points: Kevin Durant Over 24.5"],
    ["Kevin Durant Más de 24.5 Puntos", "Kevin Durant Over 24.5 Points"],
    ["Hándicap Warriors -4.5", "Warriors Handicap -4.5"],
    ["Warriors Gana -4.5 Hándicap", "Warriors Win -4.5 Handicap"],
    ["Total Goles Junior: Más de 0.5", "Junior Total Goals: Over 0.5"],
    ["Junior Más de 0.5 Goles en Casa", "Junior Over 0.5 Home Goals"],
    ["Ganador 1X2: PSG", "1X2 Winner: PSG"],
    ["Victoria Directa PSG", "PSG Direct Win"],
    ["Más de 2.5 Goles Totales", "Over 2.5 Total Goals"],
    ["Más de 1.5 Goles Totales", "Over 1.5 Total Goals"],
    ["Total Córners: Más de 9.5", "Total Corners: Over 9.5"],
    ["Más de 9.5 Córners Totales", "Over 9.5 Total Corners"],
    ["Puntos Nikola Jokic Más de 23.5", "Nikola Jokic Points Over 23.5"],
    ["Nikola Jokic Más de 23.5 Puntos", "Nikola Jokic Over 23.5 Points"],
    ["Apuesta Sin Empate DNB Tolima", "Draw No Bet DNB Tolima"],
    ["Tolima Empate No Acción (DNB)", "Tolima Draw No Bet (DNB)"],
    ["Ambos Equipos Anotan Gol (Sí)", "Both Teams To Score (Yes)"],
    ["Ambos Marcan Gol (Sí)", "Both Teams To Score (Yes)"],
    ["Victoria Directa RB Leipzig", "RB Leipzig Direct Win"],
    ["Doble Oportunidad 1X (Villa o Empate)", "Double Chance 1X (Villa or Draw)"],
    ["Aston Villa Gana o Empata (1X)", "Aston Villa Wins or Draws (1X)"],
    ["Jaguares Gana o Empata (1X) + Más de 1.5 Goles", "Jaguares Wins or Draws (1X) + Over 1.5 Goals"],
    ["✔ OBJETIVO CUMPLIDO: Ganó 3-1", "✔ TARGET HIT: Won 3-1"],
    ["✔ OBJETIVO CUMPLIDO: 5 goles (3-2)", "✔ TARGET HIT: 5 goals (3-2)"],
    ["✔ OBJETIVO CUMPLIDO: Ganó 2-0", "✔ TARGET HIT: Won 2-0"],
    ["✖ NO SE COMPLETÓ (Llaneros ganó 3-2)", "✖ MISSED (Llaneros won 3-2)"],
    ["✔ OBJETIVO CUMPLIDO: 232 puntos anotados", "✔ TARGET HIT: 232 points scored"],
    ["por partido", "per match"],
    ["pts esperados", "expected pts"],
    ["al arco", "on target"],
    ["Ritmo rápido", "Fast pace"],
    ["Puntos", "Points"],
    ["Córners", "Corners"]
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
  const badgeEl = document.getElementById("user-role-badge");
  if (badgeEl) {
    const txt = badgeEl.textContent.trim();
    if (currentLang === "EN" && txt.includes("ACCESO LIBRE")) badgeEl.textContent = "FREE ACCESS // 4 FREE PICKS TODAY";
    else if (currentLang === "ES" && txt.includes("FREE ACCESS")) badgeEl.textContent = "ACCESO LIBRE // 4 JUGADAS GRATIS HOY";
    else if (currentLang === "EN" && txt.includes("MODO ADMINISTRADOR")) badgeEl.textContent = "ADMIN MODE ACTIVE";
    else if (currentLang === "ES" && txt.includes("ADMIN MODE")) badgeEl.textContent = "MODO ADMINISTRADOR ACTIVO";
    else if (currentLang === "EN" && txt.includes("MEMBRESÍA VIP ACTIVA")) badgeEl.textContent = "ACTIVE VIP MEMBERSHIP";
    else if (currentLang === "ES" && txt.includes("ACTIVE VIP MEMBERSHIP")) badgeEl.textContent = "MEMBRESÍA VIP ACTIVA";
  }
  const liveInd = document.querySelector(".animate-pulse")?.parentElement;
  if (liveInd && liveInd.lastChild) {
    liveInd.lastChild.nodeValue = currentLang === "EN" ? " LIVE SYSTEM" : " SISTEMA EN VIVO";
  }
}
function injectLanguageSwitcher() {
  if (document.getElementById("optacore-lang-switcher")) return;
  const box = document.createElement("div");
  box.id = "optacore-lang-switcher";
  box.className = "fixed top-1.5 right-3 z-50 flex items-center gap-1 bg-[#05070a]/95 border border-[#1b2432] p-1 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-mono text-[10px]";
  box.innerHTML = `
    <button id="btn-lang-es" onclick="window.setAppLanguage('ES')" class="px-2 py-0.5 font-black uppercase transition flex items-center gap-1">
      <span>🇪🇸</span><span>ES</span>
    </button>
    <button id="btn-lang-en" onclick="window.setAppLanguage('EN')" class="px-2 py-0.5 font-black uppercase transition flex items-center gap-1">
      <span>🇺🇸</span><span>EN</span>
    </button>
  `;
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
  "Alianza FC": "https://media.api-sports.io/football/teams/1128.png",
  "SS Lazio": "https://media.api-sports.io/football/teams/487.png",
  "Cagliari Calcio": "https://media.api-sports.io/football/teams/490.png",
  "Athletic Club": "https://media.api-sports.io/football/teams/531.png",
  "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
  "Brooklyn Nets": "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg",
  "Los Angeles Lakers": "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
  "Toronto Raptors": "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg",
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Bayern Múnich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Deportivo Alavés": "https://media.ap
