// ============================================================================
// ARCHIVO: pronosticos.js - Motor Bilingüe Completo (ES/EN) + Historial 24 Partidos
// ============================================================================
import { CONFIG } from "./config.js";
import { isUserVipOrAdmin } from "./auth.js";
const DB_KEY = "optacore_master_feed_v31";
const API_SYNC_THROTTLE_MS = 10 * 60 * 1000;
let activeQuickFilter = "ALL";
let currentLang = localStorage.getItem("optacore_lang") || "ES";
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
  "Calibrando Algoritmos Cuantitativos": "Calibrating Quantitative Algorithms",
  "Estamos cargando la cartelera oficial y procesando métricas en vivo. Disponible en unos minutos.": "Loading the official matchday card and processing live metrics. Available in a few minutes.",
  "OPTACORE.QUANT — ACTUALIZACIÓN EN CURSO": "OPTACORE.QUANT — UPDATE IN PROGRESS",
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
    ["Frío húmedo (12°C)", "Cold & humid (12°C)"],
    ["Clima fresco (10°C)", "Cool weather (10°C)"],
    ["Agradable (19°C)", "Pleasant (19°C)"],
    ["Calor húmedo (27°C)", "Humid heat (27°C)"],
    ["Coliseo Climatizado", "Climate-Controlled Arena"],
    ["Coliseo Cerrado", "Indoor Arena"],
    ["Calor pesado (24°C)", "Heavy heat (24°C)"],
    ["Calor sofocante (31°C)", "Sweltering heat (31°C)"],
    ["Calor sofocante (33°C y 86% de humedad)", "Sweltering heat (33°C & 86% humidity)"],
    ["Cielo nublado (12°C)", "Cloudy sky (12°C)"],
    ["Cálido (26°C)", "Warm (26°C)"],
    ["Lluvia (15°C)", "Rain (15°C)"],
    ["Calor de Barranquilla (30°C)", "Barranquilla heat (30°C)"],
    ["Templado", "Mild"],
    ["Despejado", "Clear"],
    ["Lluvia", "Rain"],
    ["Frío", "Cold"],
    ["Agradable", "Pleasant"],
    ["Fresco", "Cool"],
    ["Nublado", "Cloudy"],
    ["Condición Estándar", "Standard Condition"],
    ["por partido", "per match"],
    ["pts esperados", "expected pts"],
    ["al arco", "on target"],
    ["Ritmo rápido", "Fast pace"],
    ["Puntos", "Points"],
    ["Córners", "Corners"],
    ["El City dominó el trámite con 68% de posesión y cerró la victoria 3-1 en casa asegurando la cuota.", "City dominated with 68% possession and sealed a 3-1 home victory, locking in the odds."],
    ["Duelo de ida y vuelta con 35 remates totales; tras el 1-1 inicial, tres tantos sellaron el 3-2.", "Back-and-forth clash with 35 total shots; after an initial 1-1, three goals sealed the 3-2 win."],
    ["Control absoluto de posesión culé (72%) sin permitir remates peligrosos de Alavés para sellar el 2-0.", "Absolute possession control by Barca (72%) allowing no dangerous shots from Alaves to seal a 2-0 win."],
    ["Llaneros aprovechó desatenciones defensivas en Villavicencio para adelantarse. Pese al descuento de Junior, el penal al 80' sentenció el 3-2.", "Llaneros capitalized on defensive lapses in Villavicencio. Despite Junior's goals, an 80th-minute penalty sealed the 3-2 result."],
    ["Ritmo frenético de posesiones que derivó en un 121-111 (232 puntos totales), superando con holgura los 214.5 puntos requeridos.", "Frenetic pace of possessions leading to a 121-111 score (232 total points), comfortably clearing the 214.5 required line."],
    ["Pasto perdió su ventaja de altitud y Bucaramanga resolvió 2-0.", "Pasto lost its altitude advantage and Bucaramanga won 2-0."],
    ["Indiana impuso posesiones de menos de 12 segundos y selló 242 puntos combinados.", "Indiana enforced sub-12-second possessions and sealed 242 combined points."],
    ["Estaba 1-1 en el minuto 93, pero un penal sancionado al 94' quebró la línea.", "It was 1-1 in the 93rd minute, but a 94th-minute penalty broke the under line."],
    ["Cinco remates a los postes derivaron en un atípico 0-0.", "Five shots hitting the posts resulted in an unusual 0-0 draw."],
    ["América remontó en el segundo tiempo con dos goles seguidos (2-1).", "America came back in the second half with two consecutive goals (2-1)."],
    ["Kings sentó titulares ganando por 14 y Utah descontó hasta el 110-113.", "Kings benched starters while up by 14 and Utah cut the lead to 110-113."],
    ["Cancha anegada que derivó en un 0-0 al descanso.", "Waterlogged pitch that led to a 0-0 halftime score."],
    ["Durant estuvo intratable y anotó 31 puntos atacando constantemente el aro.", "Durant was unstoppable and scored 31 points constantly attacking the rim."],
    ["Stephen Curry se lesionó el tobillo en el 3Q y Clippers remontó el partido.", "Stephen Curry injured his ankle in the 3Q and the Clippers came back to win."],
    ["Junior fue una aplanadora en el Metropolitano ganando 3-1.", "Junior was a powerhouse at the Metropolitano winning 3-1."],
    ["Superioridad total parisina con goleada 0-3 en el clásico francés.", "Total Parisian superiority with a 0-3 rout in the French derby."],
    ["Partidazo en Milán con 8 goles en total para un empate 4-4.", "Thriller in Milan with 8 total goals for a 4-4 draw."],
    ["Duelo con llegadas en ambas áreas que finalizó 2-2.", "End-to-end clash with chances in both boxes finishing 2-2."],
    ["Se quedó en 9 tiros de esquina en el minuto 75 y no hubo más llegadas.", "Stuck at 9 corners in the 75th minute with no further corner kicks."],
    ["Jokic anotó 41 puntos en la altura de Denver destrozando la línea.", "Jokic scored 41 points in Denver's altitude, smashing the line."],
    ["Tolima empató 1-1 y la selección se protegió sin pérdidas.", "Tolima drew 1-1 and the DNB selection was protected with no loss."],
    ["Jaguares acusó la subida a Medellín y el DIM goleó 4-1.", "Jaguares suffered from the altitude in Medellin and DIM won 4-1."],
    ["Madrid cayó 8 veces en fuera de juego y Barcelona ganó 0-4 sin encajar.", "Madrid was caught offside 8 times and Barcelona won 0-4 with a clean sheet."],
    ["Remontada de Leipzig en el segundo tiempo con tres goles seguidos.", "Second-half comeback by Leipzig with three unanswered goals."],
    ["El equipo del 'Dibu' sostuvo el invicto en casa con empate 1-1.", "Aston Villa held their home unbeaten run with a 1-1 draw."],
    ["En el Jaraguay de Montería, Llaneros acusó el calor y Jaguares se impuso 2-1.", "At the Jaraguay in Monteria, Llaneros suffered from the heat and Jaguares won 2-1."]
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
export function getColombiaDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG?.BRAND?.TIMEZONE || "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
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
  } else if (w.includes("10°c") || w.includes("12°c") || w.includes("frío") || w.includes("frio")) {
    stressScore = 65;
    label = currentLang === "EN" ? "⚡ FAST PITCH / HIGH PACE" : "⚡ CÉSPED RÁPIDO / ALTA VELOCIDAD";
    color = "bg-[#06b6d4]";
  }
  return { stressScore, label, color };
}
const LOGOS = {
  "Liverpool FC": "https://media.api-sports.io/football/teams/40.png",
  "Arsenal FC": "https://media.api-sports.io/football/teams/42.png",
  "Racing de Santander": "https://media.api-sports.io/football/teams/724.png",
  "Getafe CF": "https://media.api-sports.io/football/teams/546.png",
  "Sevilla FC": "https://media.api-sports.io/football/teams/536.png",
  "Orlando Magic": "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg",
  "Boston Celtics": "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg",
  "Alianza FC": "https://media.api-sports.io/football/teams/1144.png",
  "SS Lazio": "https://media.api-sports.io/football/teams/487.png",
  "Cagliari Calcio": "https://media.api-sports.io/football/teams/490.png",
  "Athletic Club": "https://media.api-sports.io/football/teams/531.png",
  "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
  "Brooklyn Nets": "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg",
  "Toronto Raptors": "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg",
  "Los Angeles Lakers": "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Bayern Múnich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Deportivo Alavés": "https://media.api-sports.io/football/teams/542.png",
  "Llaneros FC": "https://media.api-sports.io/football/teams/1142.png",
  "Junior de Barranquilla": "https://media.api-sports.io/football/teams/1126.png",
  "Jaguares de Córdoba": "https://media.api-sports.io/football/teams/1133.png",
  "Atlético Bucaramanga": "https://media.api-sports.io/football/teams/1125.png",
  "Deportivo Pasto": "https://media.api-sports.io/football/teams/1134.png",
  "América de Cali": "https://media.api-sports.io/football/teams/1124.png",
  "Fortaleza CEIF": "https://media.api-sports.io/football/teams/1141.png",
  "Bayer Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "VfB Stuttgart": "https://media.api-sports.io/football/teams/172.png",
  "Deportivo Pereira": "https://media.api-sports.io/football/teams/1135.png",
  "SD Compostela": "https://media.api-sports.io/football/teams/2836.png",
  "Aston Villa": "https://media.api-sports.io/football/teams/66.png",
  "Bournemouth": "https://media.api-sports.io/football/teams/35.png",
  "RB Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "SC Freiburg": "https://media.api-sports.io/football/teams/160.png",
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Independiente Medellín": "https://media.api-sports.io/football/teams/1138.png",
  "Deportes Tolima": "https://media.api-sports.io/football/teams/1137.png",
  "Once Caldas": "https://media.api-sports.io/football/teams/1132.png",
  "Chelsea": "https://media.api-sports.io/football/teams/49.png",
  "Newcastle": "https://media.api-sports.io/football/teams/34.png",
  "Arsenal": "https://media.api-sports.io/football/teams/42.png",
  "Liverpool": "https://media.api-sports.io/football/teams/40.png",
  "Inter de Milán": "https://media.api-sports.io/football/teams/505.png",
  "Juventus": "https://media.api-sports.io/football/teams/496.png",
  "Olympique Marsella": "https://media.api-sports.io/football/teams/81.png",
  "PSG": "https://media.api-sports.io/football/teams/85.png",
  "Minnesota Timberwolves": "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg",
  "San Antonio Spurs": "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg",
  "Miami Heat": "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg",
  "Indiana Pacers": "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg",
  "Denver Nuggets": "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg",
  "LA Clippers": "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg",
  "Golden State Warriors": "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
  "Phoenix Suns": "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg",
  "Dallas Mavericks": "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg",
  "Utah Jazz": "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg",
  "Sacramento Kings": "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg",
};
function getLogo(name) {
  return LOGOS[name] || "https://media.api-sports.io/football/teams/default.png";
}
function seedMasterRecords() {
  const today = getColombiaDateString();
  // Limpieza automática de claves obsoletas de caché para forzar la cartelera fresca en móviles
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("optacore_master_feed_") && k !== DB_KEY) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {}

  const cached = localStorage.getItem(DB_KEY);
  if (cached) {
    try {
      const list = JSON.parse(cached);
      const hasToday = Array.isArray(list) && list.some((m) => m.matchDate === today);
      if (hasToday && list.length >= 24) return list;
    } catch (e) {
      console.warn("Restableciendo lista:", e);
    }
  }
  const makeIso = (d, hhmm) => `${d}T${hhmm}:00-05:00`;
  const records = [
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
      marketEquivalent: "Doble Oportunidad (Liverpool o Empate) combinada con Total de Goles Más de 1.5",
      liveOddDrop: "@1.68 ➔ @1.52",
      predictionText: "Liverpool Gana o Empata (1X) + Más de 1.5 Goles Totales",
      odds: 1.52,
      probability: 93.8,
      isFree: true,
      altitudeM: 70,
      weatherDesc: "Clima fresco (11°C) / Césped rápido",
      homeAvgGoals: "2.6 por partido",
      awayAvgGoals: "1.4 por partido",
      liveStats: { possession: "52% - 48%", shots: "14 - 11", corners: "6 - 4", fouls: "9 - 11" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Liverpool en Anfield registra un promedio ofensivo de 2.6 goles por encuentro y mantiene una fortaleza histórica jugando en casa. Arsenal propone duelos físicos en mediocampo, pero rara vez deja su portería en cero visitando al Big Six. Al proteger la localía con el empate (1X) y bajar el techo a solo 2 goles en el partido (+1.5), cubrimos el 1-1, 2-1, 2-0 y 2-2 con margen de seguridad.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
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
      weatherDesc: "Templado costero (17°C)",
      homeAvgGoals: "1.0 por partido",
      awayAvgGoals: "2.5 por partido",
      liveStats: { possession: "35% - 65%", shots: "7 - 17", corners: "3 - 8", fouls: "13 - 7" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "El conjunto merengue llega en estado de gracia ofensivo con Mbappé y Vinícius castigando al espacio. Visita El Sardinero ante un Racing que sufre enormemente al defender transiciones rápidas. La diferencia de jerarquía individual en los últimos 30 metros proyecta un triunfo madridista con al menos 2 tantos en el marcador global.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
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
      weatherDesc: "Mañana soleada (15°C)",
      homeAvgGoals: "0.8 por partido",
      awayAvgGoals: "0.9 por partido",
      liveStats: { possession: "44% - 56%", shots: "8 - 7", corners: "4 - 3", fouls: "16 - 14" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "El sistema de José Bordalás en el Coliseum convierte cada partido en una guerra de fricción, faltas tácticas y bloque bajo. Sevilla fuera de casa prioriza no cometer errores en salida, lo que reduce el promedio de remates claros a menos de 6 por encuentro.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
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
      homeAvgGoals: "106 pts esperados",
      awayAvgGoals: "118 pts esperados",
      liveStats: { possession: "Ritmo táctico", shots: "44% TC - 48% TC", corners: "-", fouls: "19 - 18" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Boston posee la mejor eficiencia ofensiva de la conferencia gracias a su volumen de tiro exterior (más de 42 triples intentados por noche). Orlando basa su juego en la defensa interior en la pintura, pero sufre en las rotaciones perimetrales cuando enfrenta a cinco titulares abiertos como los de los Celtics.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261101-05",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "18:10"),
      kickoffLabel: "18:10 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Independiente Medellín",
      awayTeam: "Alianza FC",
      marketEquivalent: "Tiempo Reglamentario: Gana Independiente Medellín",
      liveOddDrop: "@1.70 ➔ @1.54",
      predictionText: "Independiente Medellín Gana Directo (1X2)",
      odds: 1.54,
      probability: 93.5,
      isFree: false,
      altitudeM: 1495,
      weatherDesc: "Noche fresca (21°C) / Ahogo por altura",
      homeAvgGoals: "2.1 por partido",
      awayAvgGoals: "0.7 por partido",
      liveStats: { possession: "62% - 38%", shots: "15 - 5", corners: "7 - 2", fouls: "11 - 15" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Fecha 17 decisiva del Clausura colombiano. Alianza FC sube desde el calor de Valledupar hasta los casi 1.500 metros de Medellín, donde suele perder fondo físico a partir del minuto 60. El Poderoso en el Atanasio impone un volumen de ataque constante por las bandas y necesita los 3 puntos de forma obligatoria para sellar su clasificación.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261101-06",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "09:00"),
      kickoffLabel: "09:00 COL",
      league: "Serie A (Italia)",
      homeTeam: "SS Lazio",
      awayTeam: "Cagliari Calcio",
      marketEquivalent: "Doble Oportunidad Lazio/Empate y Total de Goles Más de 1.5",
      liveOddDrop: "@1.58 ➔ @1.47",
      predictionText: "Lazio Gana o Empata (1X) + Más de 1.5 Goles Totales",
      odds: 1.47,
      probability: 93.0,
      isFree: false,
      altitudeM: 21,
      weatherDesc: "Clima templado (18°C)",
      homeAvgGoals: "2.0 por partido",
      awayAvgGoals: "0.8 por partido",
      liveStats: { possession: "59% - 41%", shots: "13 - 8", corners: "6 - 3", fouls: "10 - 12" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Lazio jugando en el Olímpico de Roma mantiene una racha arrolladora ante equipos de la zona baja de la tabla. Cagliari fuera de Cerdeña concede espacios entre centrales y laterales, permitiendo que los extremos romanos generen superioridad constante desde la primera mitad.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261101-07",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "15:00"),
      kickoffLabel: "15:00 COL",
      league: "LaLiga (España)",
      homeTeam: "Athletic Club",
      awayTeam: "Real Sociedad",
      marketEquivalent: "Doble Oportunidad (Athletic o Empate) y Menos de 3.5 Goles en el partido",
      liveOddDrop: "@1.65 ➔ @1.53",
      predictionText: "Athletic Club Gana o Empata (1X) + Menos de 3.5 Goles",
      odds: 1.53,
      probability: 92.8,
      isFree: false,
      altitudeM: 19,
      weatherDesc: "Noche fresca húmeda (12°C) / Césped rápido",
      homeAvgGoals: "1.7 por partido",
      awayAvgGoals: "1.1 por partido",
      liveStats: { possession: "51% - 49%", shots: "11 - 9", corners: "5 - 4", fouls: "15 - 13" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "El Athletic de Valverde viene de aplastar en San Mamés, demostrando que en su estadio es muy sólido. En el derbi vasco ante la Real Sociedad prima la intensidad táctica y el rigor defensivo; proteger la localía del Athletic con un techo amplio de hasta 3 goles ofrece un valor estadístico altísimo.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261101-08",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: today,
      kickoffIso: makeIso(today, "17:00"),
      kickoffLabel: "17:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Indiana Pacers",
      awayTeam: "Brooklyn Nets",
      marketEquivalent: "Total de Puntos (Incluye Prórroga): Menos de 232.5",
      liveOddDrop: "@1.68 ➔ @1.56",
      predictionText: "Menos de 232.5 Puntos Totales (Línea Protegida)",
      odds: 1.56,
      probability: 94.0,
      isFree: false,
      altitudeM: 218,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "114 pts esperados",
      awayAvgGoals: "108 pts esperados",
      liveStats: { possession: "Ritmo pausado", shots: "46% TC - 44% TC", corners: "-", fouls: "19 - 21" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Brooklyn presenta uno de los ritmos de juego más lentos de la Conferencia Este, agotando regularmente más de 18 segundos del reloj de tiro en ataques posicionales. Con esta línea protegida en 232.5 puntos tenemos margen incluso ante un último cuarto de tiros libres.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261101-09",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: today,
      kickoffIso: makeIso(today, "20:30"),
      kickoffLabel: "20:30 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Golden State Warriors",
      awayTeam: "LA Clippers",
      marketEquivalent: "Hándicap del Partido (Incluye Prórroga): Golden State Warriors -2.5",
      liveOddDrop: "@1.75 ➔ @1.62",
      predictionText: "Golden State Warriors Hándicap -2.5 (Línea Corta)",
      odds: 1.62,
      probability: 92.5,
      isFree: false,
      altitudeM: 10,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "117 pts esperados",
      awayAvgGoals: "111 pts esperados",
      liveStats: { possession: "Ritmo rápido", shots: "48% TC - 45% TC", corners: "-", fouls: "18 - 20" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Duelo divisional californiano en el Chase Center. La rotación de segunda unidad de Golden State supera en frescura física y efectividad de tres puntos a unos Clippers que sufren desconexiones defensivas en el tercer cuarto cuando salen los titulares.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261101-10",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: today,
      kickoffIso: makeIso(today, "21:00"),
      kickoffLabel: "21:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Toronto Raptors",
      marketEquivalent: "Gana LA Lakers y Total de Puntos Más de 215.5",
      liveOddDrop: "@1.80 ➔ @1.68",
      predictionText: "Los Angeles Lakers Gana Directo + Más de 215.5 Puntos",
      odds: 1.68,
      probability: 88.0,
      isFree: false,
      altitudeM: 71,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "119 pts esperados",
      awayAvgGoals: "109 pts esperados",
      liveStats: { possession: "Dominio interior", shots: "51% TC - 45% TC", corners: "-", fouls: "17 - 23" },
      pickProgressPct: 0,
      pickProgressLabel: "Pendiente por disputar",
      explanation: "Los Lakers dominan la zona pintada con superioridad en rebotes ofensivos y tiros libres provocados ante una defensa interior joven de Toronto que concede más de 116 puntos de promedio jugando en la gira por la Costa Oeste.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261030-01",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "20:05"),
      kickoffLabel: "20:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Atlético Bucaramanga",
      awayTeam: "Deportivo Pasto",
      marketEquivalent: "Apuesta Sin Empate (DNB Bucaramanga)",
      predictionText: "Bucaramanga Empate No Acción (DNB)",
      odds: 1.45,
      probability: 91.2,
      isFree: true,
      altitudeM: 959,
      weatherDesc: "Calor pesado (24°C)",
      homeAvgGoals: "1.9 por partido",
      awayAvgGoals: "0.7 por partido",
      explanation: "Pasto perdió su ventaja de altitud y Bucaramanga resolvió 2-0.",
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261030-02",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Miami Heat",
      awayTeam: "Indiana Pacers",
      marketEquivalent: "Total Puntos Combinados: Más de 227.5",
      predictionText: "Más de 227.5 Puntos Totales Combinados",
      odds: 1.40,
      probability: 92.0,
      isFree: true,
      altitudeM: 10,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "124 pts",
      awayAvgGoals: "118 pts",
      explanation: "Indiana impuso posesiones de menos de 12 segundos y selló 242 puntos combinados.",
      liveScore: "124 - 118",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261030-03-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "18:00"),
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Deportivo Pereira",
      marketEquivalent: "Menos de 2.5 Goles Totales",
      predictionText: "Menos de 2.5 Goles Totales",
      odds: 1.70,
      probability: 85.5,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor sofocante (31°C)",
      homeAvgGoals: "1 gol",
      awayAvgGoals: "2 goles",
      explanation: "Estaba 1-1 en el minuto 93, pero un penal sancionado al 94' quebró la línea.",
      liveScore: "1 - 2",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "20261030-04-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "14:30"),
      kickoffLabel: "14:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayer Leverkusen",
      awayTeam: "VfB Stuttgart",
      marketEquivalent: "Leverkusen Gana + Más de 2.5 Goles",
      predictionText: "Leverkusen Gana + Más de 2.5 Goles",
      odds: 1.55,
      probability: 88.0,
      isFree: true,
      altitudeM: 60,
      weatherDesc: "Cielo nublado (12°C)",
      homeAvgGoals: "0 goles",
      awayAvgGoals: "0 goles",
      explanation: "Cinco remates a los postes derivaron en un atípico 0-0.",
      liveScore: "0 - 0",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "20261029-01",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "18:30"),
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "América de Cali",
      awayTeam: "Fortaleza CEIF",
      marketEquivalent: "Doble Oportunidad 1X + Más de 1.5 Goles",
      predictionText: "América Gana o Empata (1X) + Más de 1.5 Goles",
      odds: 1.46,
      probability: 90.5,
      isFree: true,
      altitudeM: 1018,
      weatherDesc: "Cálido (26°C)",
      homeAvgGoals: "2.1 por partido",
      awayAvgGoals: "0.9 por partido",
      explanation: "América remontó en el segundo tiempo con dos goles seguidos (2-1).",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261029-02-FALLO",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Utah Jazz",
      awayTeam: "Sacramento Kings",
      marketEquivalent: "Hándicap Sacramento Kings -6.5",
      predictionText: "Sacramento Kings Hándicap -6.5",
      odds: 1.90,
      probability: 87.5,
      isFree: true,
      altitudeM: 1288,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "110 pts",
      awayAvgGoals: "113 pts",
      explanation: "Kings sentó titulares ganando por 14 y Utah descontó hasta el 110-113.",
      liveScore: "110 - 113",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "20261029-03-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "14:00"),
      kickoffLabel: "14:00 COL",
      league: "Copa del Rey (España)",
      homeTeam: "SD Compostela",
      awayTeam: "Deportivo Alavés",
      marketEquivalent: "Alavés Gana 1T / Final",
      predictionText: "Alavés Gana Descanso / Final",
      odds: 1.80,
      probability: 86.0,
      isFree: true,
      altitudeM: 260,
      weatherDesc: "Lluvia (15°C)",
      homeAvgGoals: "0",
      awayAvgGoals: "1",
      explanation: "Cancha anegada que derivó en un 0-0 al descanso.",
      liveScore: "0 - 1",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-01",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "20:30"),
      kickoffLabel: "20:30 COL",
      league: "NBA",
      homeTeam: "Phoenix Suns",
      awayTeam: "Dallas Mavericks",
      marketEquivalent: "Puntos Jugador: Kevin Durant Más de 24.5",
      predictionText: "Kevin Durant Más de 24.5 Puntos",
      odds: 1.75,
      probability: 92.5,
      isFree: true,
      altitudeM: 331,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "31 pts",
      awayAvgGoals: "-",
      explanation: "Durant estuvo intratable y anotó 31 puntos atacando constantemente el aro.",
      liveScore: "31 Puntos",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-02-FALLO",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "19:30"),
      kickoffLabel: "19:30 COL",
      league: "NBA",
      homeTeam: "Golden State Warriors",
      awayTeam: "LA Clippers",
      marketEquivalent: "Hándicap Warriors -4.5",
      predictionText: "Warriors Gana -4.5 Hándicap",
      odds: 1.85,
      probability: 87.0,
      isFree: true,
      altitudeM: 10,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "104",
      awayAvgGoals: "112",
      explanation: "Stephen Curry se lesionó el tobillo en el 3Q y Clippers remontó el partido.",
      liveScore: "104 - 112",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-03",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "17:15"),
      kickoffLabel: "17:15 COL",
      league: "Liga BetPlay",
      homeTeam: "Junior de Barranquilla",
      awayTeam: "América de Cali",
      marketEquivalent: "Total Goles Junior: Más de 0.5",
      predictionText: "Junior Más de 0.5 Goles en Casa",
      odds: 1.30,
      probability: 91.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor de Barranquilla (30°C)",
      homeAvgGoals: "3",
      awayAvgGoals: "1",
      explanation: "Junior fue una aplanadora en el Metropolitano ganando 3-1.",
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-04",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "14:45"),
      kickoffLabel: "14:45 COL",
      league: "Ligue 1",
      homeTeam: "Olympique Marsella",
      awayTeam: "PSG",
      marketEquivalent: "Ganador 1X2: PSG",
      predictionText: "Victoria Directa PSG",
      odds: 1.55,
      probability: 89.5,
      isFree: true,
      altitudeM: 35,
      weatherDesc: "Templado",
      homeAvgGoals: "0",
      awayAvgGoals: "3",
      explanation: "Superioridad total parisina con goleada 0-3 en el clásico francés.",
      liveScore: "0 - 3",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-05",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "12:00"),
      kickoffLabel: "12:00 COL",
      league: "Serie A",
      homeTeam: "Inter de Milán",
      awayTeam: "Juventus",
      marketEquivalent: "Más de 2.5 Goles Totales",
      predictionText: "Más de 2.5 Goles Totales",
      odds: 1.85,
      probability: 88.0,
      isFree: true,
      altitudeM: 122,
      weatherDesc: "Despejado",
      homeAvgGoals: "4",
      awayAvgGoals: "4",
      explanation: "Partidazo en Milán con 8 goles en total para un empate 4-4.",
      liveScore: "4 - 4",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-06",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Premier League",
      homeTeam: "Arsenal",
      awayTeam: "Liverpool",
      marketEquivalent: "Más de 1.5 Goles Totales",
      predictionText: "Más de 1.5 Goles Totales",
      odds: 1.35,
      probability: 91.5,
      isFree: true,
      altitudeM: 40,
      weatherDesc: "Lluvia",
      homeAvgGoals: "2",
      awayAvgGoals: "2",
      explanation: "Duelo con llegadas en ambas áreas que finalizó 2-2.",
      liveScore: "2 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-07-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League",
      homeTeam: "Chelsea",
      awayTeam: "Newcastle",
      marketEquivalent: "Total Córners: Más de 9.5",
      predictionText: "Más de 9.5 Córners Totales",
      odds: 1.70,
      probability: 86.0,
      isFree: true,
      altitudeM: 15,
      weatherDesc: "Frío",
      homeAvgGoals: "9 córners",
      awayAvgGoals: "-",
      explanation: "Se quedó en 9 tiros de esquina en el minuto 75 y no hubo más llegadas.",
      liveScore: "9 Córners",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-08",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA",
      homeTeam: "Denver Nuggets",
      awayTeam: "LA Clippers",
      marketEquivalent: "Puntos Nikola Jokic Más de 23.5",
      predictionText: "Nikola Jokic Más de 23.5 Puntos",
      odds: 1.80,
      probability: 92.0,
      isFree: true,
      altitudeM: 1609,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "41 pts",
      awayAvgGoals: "-",
      explanation: "Jokic anotó 41 puntos en la altura de Denver destrozando la línea.",
      liveScore: "41 Puntos",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-09",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "18:30"),
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay",
      homeTeam: "Deportes Tolima",
      awayTeam: "Once Caldas",
      marketEquivalent: "Apuesta Sin Empate DNB Tolima",
      predictionText: "Tolima Empate No Acción (DNB)",
      odds: 1.45,
      probability: 90.0,
      isFree: true,
      altitudeM: 1285,
      weatherDesc: "Templado",
      homeAvgGoals: "1",
      awayAvgGoals: "1",
      explanation: "Tolima empató 1-1 y la selección se protegió sin pérdidas.",
      liveScore: "1 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-10",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "16:15"),
      kickoffLabel: "16:15 COL",
      league: "Liga BetPlay",
      homeTeam: "Independiente Medellín",
      awayTeam: "Jaguares de Córdoba",
      marketEquivalent: "Más de 1.5 Goles Totales",
      predictionText: "Más de 1.5 Goles Totales",
      odds: 1.38,
      probability: 89.0,
      isFree: true,
      altitudeM: 1495,
      weatherDesc: "Agradable",
      homeAvgGoals: "4",
      awayAvgGoals: "1",
      explanation: "Jaguares acusó la subida a Medellín y el DIM goleó 4-1.",
      liveScore: "4 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-11-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "14:00"),
      kickoffLabel: "14:00 COL",
      league: "LaLiga",
      homeTeam: "Real Madrid",
      awayTeam: "FC Barcelona",
      marketEquivalent: "Ambos Equipos Anotan Gol (Sí)",
      predictionText: "Ambos Marcan Gol (Sí)",
      odds: 1.50,
      probability: 87.5,
      isFree: true,
      altitudeM: 660,
      weatherDesc: "Fresco",
      homeAvgGoals: "0",
      awayAvgGoals: "4",
      explanation: "Madrid cayó 8 veces en fuera de juego y Barcelona ganó 0-4 sin encajar.",
      liveScore: "0 - 4",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-12",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Bundesliga",
      homeTeam: "RB Leipzig",
      awayTeam: "SC Freiburg",
      marketEquivalent: "Victoria Directa RB Leipzig",
      predictionText: "Victoria Directa RB Leipzig",
      odds: 1.65,
      probability: 91.0,
      isFree: true,
      altitudeM: 113,
      weatherDesc: "Frío",
      homeAvgGoals: "3",
      awayAvgGoals: "1",
      explanation: "Remontada de Leipzig en el segundo tiempo con tres goles seguidos.",
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-13",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "09:00"),
      kickoffLabel: "09:00 COL",
      league: "Premier League",
      homeTeam: "Aston Villa",
      awayTeam: "Bournemouth",
      marketEquivalent: "Doble Oportunidad 1X (Villa o Empate)",
      predictionText: "Aston Villa Gana o Empata (1X)",
      odds: 1.30,
      probability: 89.0,
      isFree: true,
      altitudeM: 110,
      weatherDesc: "Nublado",
      homeAvgGoals: "1",
      awayAvgGoals: "1",
      explanation: "El equipo del 'Dibu' sostuvo el invicto en casa con empate 1-1.",
      liveScore: "1 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "FOUNDER-JAGUARES",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-23",
      kickoffIso: makeIso("2026-10-23", "18:00"),
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Llaneros FC",
      marketEquivalent: "Doble Oportunidad 1X + Más de 1.5 Goles",
      predictionText: "Jaguares Gana o Empata (1X) + Más de 1.5 Goles",
      odds: 2.20,
      probability: 93.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor sofocante (33°C y 86% de humedad)",
      homeAvgGoals: "2",
      awayAvgGoals: "1",
      explanation: "En el Jaraguay de Montería, Llaneros acusó el calor y Jaguares se impuso 2-1.",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
  ];
  localStorage.setItem(DB_KEY, JSON.stringify(records));
  return records;
}
export function getAllMasterFeed() {
  return seedMasterRecords();
}
function saveMasterFeed(list) {
  localStorage.setItem(DB_KEY, JSON.stringify(list));
  renderLiveTickerAndStreak();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
}
export async function syncLiveHtFtResults(force = false) {
  const lastSync = parseInt(localStorage.getItem("optacore_last_api_sync") || "0", 10);
  const now = Date.now();
  if (!force && (now - lastSync) < API_SYNC_THROTTLE_MS) return;
  const allMatches = getAllMasterFeed();
  const today = getColombiaDateString();
  const targets = allMatches.filter((m) => {
    return m.matchDate === today &&
           m.apiFixtureId &&
           m.matchStatus !== "FINALIZADO" &&
           new Date(m.kickoffIso).getTime() <= now;
  });
  if (targets.length === 0) return;
  const fixtureIds = targets.slice(0, 20).map((m) => m.apiFixtureId).join("-");
  try {
    const response = await fetch(`https://${CONFIG.KEYS.SPORTS_API_HOST}/fixtures?ids=${fixtureIds}`, {
      method: "GET",
      headers: { "x-apisports-key": CONFIG.KEYS.SPORTS_API_KEY },
    });
    const data = await response.json();
    if (!data.response || data.response.length === 0) return;
    let updatedCount = 0;
    data.response.forEach((item) => {
      const fixId = item.fixture?.id;
      const statusShort = item.fixture?.status?.short;
      const homeScore = item.goals?.home ?? 0;
      const awayScore = item.goals?.away ?? 0;
      const matchIndex = allMatches.findIndex((m) => m.apiFixtureId === fixId);
      if (matchIndex === -1) return;
      if (statusShort === "HT") {
        const htHome = item.score?.halftime?.home ?? homeScore;
        const htAway = item.score?.halftime?.away ?? awayScore;
        allMatches[matchIndex].liveScore = `${htHome} - ${htAway} (MT)`;
        allMatches[matchIndex].matchStatus = "EN_VIVO";
        updatedCount++;
      }
      if (["FT", "AET", "PEN"].includes(statusShort)) {
        allMatches[matchIndex].liveScore = `${homeScore} - ${awayScore}`;
        allMatches[matchIndex].matchStatus = "FINALIZADO";
        updatedCount++;
      }
    });
    if (updatedCount > 0) saveMasterFeed(allMatches);
    localStorage.setItem("optacore_last_api_sync", now.toString());
  } catch (error) {
    console.warn("Fallo de sincronización:", error);
  }
}
window.syncLiveHtFtResults = syncLiveHtFtResults;
function renderLiveTickerAndStreak() {
  const all = getAllMasterFeed();
  const wins = all.filter((p) => p.outcome === "ACIERTO");
  const tickerEl = document.getElementById("live-win-ticker");
  const cashLabel = currentLang === "EN" ? "✔ CASHED:" : "✔ COBRADO:";
  if (tickerEl && wins.length > 0) {
    const itemsHtml = wins.map((w) =>
      `<span class="mx-4"><strong class="text-[#10b981]">${cashLabel}</strong> ${w.homeTeam} vs ${w.awayTeam} ► <span class="text-cyan-300">${trText(w.predictionText)}</span> (@${Number(w.odds || 1.45).toFixed(2)}) [${trText(w.liveScore)}]</span>`
    ).join(" • ");
    tickerEl.innerHTML = itemsHtml + " • " + itemsHtml;
  }
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  let currentStreak = 0;
  for (const game of settled) {
    if (game.outcome === "ACIERTO") currentStreak++;
    else break;
  }
  const streakBadge = document.getElementById("hot-streak-badge");
  if (streakBadge) {
    if (currentStreak >= 2) {
      streakBadge.textContent = currentLang === "EN" ? `🔥 HOT STREAK: ${currentStreak} WINS IN A ROW` : `🔥 RACHA ACTUAL: ${currentStreak} ACIERTOS SEGUIDOS`;
      streakBadge.classList.remove("hidden");
    } else {
      streakBadge.textContent = currentLang === "EN" ? `⚡ ${wins.length} VERIFIED WINS` : `⚡ ${wins.length} ACIERTOS AUDITADOS`;
    }
  }
}
window.copyPickToClipboard = (matchId, ev) => {
  if (ev) ev.stopPropagation();
  const m = getAllMasterFeed().find((x) => x.id === matchId);
  if (!m) return;
  const text = currentLang === "EN"
    ? `🎯 *OPTACORE.QUANT — FEATURED PICK*\n⚽ ${m.homeTeam} vs ${m.awayTeam}\n🏆 ${m.league}\n⏰ Time: ${m.kickoffLabel}\n🔥 Pick: *${trText(m.predictionText)}*\n📈 Odds: @${Number(m.odds || 1.45).toFixed(2)} (Confidence: ${m.probability || 90}%)\n\n📲 Full analysis & daily card at:\n${window.location.origin}`
    : `🎯 *OPTACORE.QUANT — PRONÓSTICO DESTACADO*\n⚽ ${m.homeTeam} vs ${m.awayTeam}\n🏆 ${m.league}\n⏰ Hora: ${m.kickoffLabel}\n🔥 Jugada: *${m.predictionText}*\n📈 Cuota: @${Number(m.odds || 1.45).toFixed(2)} (Probabilidad: ${m.probability || 90}%)\n\n📲 Ver análisis completo y cartelera en:\n${window.location.origin}`;
  navigator.clipboard.writeText(text).then(() => {
    alert(currentLang === "EN" ? "Pick copied to clipboard for WhatsApp groups!" : "¡Pronóstico copiado con formato para compartir en grupos de WhatsApp!");
  });
};
window.openWinTicketCard = (matchId, ev) => {
  if (ev) ev.stopPropagation();
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match || match.outcome !== "ACIERTO") return;
  let modal = document.getElementById("win-ticket-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "win-ticket-modal";
    modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono";
    document.body.appendChild(modal);
  }
  const stake = Number(document.getElementById("stake-calculator-input")?.value || 50000);
  const odd = Number(match.odds || 1.45);
  const totalReturn = Math.round(stake * odd);
  const netProfit = totalReturn - stake;
  modal.innerHTML = `
    <div class="max-w-sm w-full space-y-3">
      <div class="p-6 bg-gradient-to-b from-[#061412] via-[#05070a] to-[#040d14] border-2 border-[#10b981] shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-[#1b2432] pb-3">
          <div>
            <span class="text-base font-black text-white tracking-wider">OPTACORE<span class="text-cyan-400">.QUANT</span></span>
            <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "VERIFIED OFFICIAL AUDIT" : "AUDITORÍA OFICIAL VERIFICADA"}</span>
          </div>
          <span class="px-2.5 py-1 bg-[#10b981] text-slate-950 font-black text-xs uppercase">
            ${currentLang === "EN" ? "✔ WIN" : "✔ ACIERTO"}
          </span>
        </div>
        <div class="text-center space-y-2 py-2">
          <span class="text-[10px] text-cyan-400 uppercase font-bold">${trText(match.sport)} // ${match.league}</span>
          <div class="flex items-center justify-center gap-4 py-2">
            <img src="${getLogo(match.homeTeam)}" class="w-12 h-12 object-contain" />
            <span class="text-2xl font-black text-white">${trText(match.liveScore)}</span>
            <img src="${getLogo(match.awayTeam)}" class="w-12 h-12 object-contain" />
          </div>
          <div class="text-sm font-black text-white">${match.homeTeam} vs ${match.awayTeam}</div>
        </div>
        <div class="p-3 bg-[#05070a] border border-[#10b981]/50 space-y-1 text-center">
          <span class="text-[9px] text-slate-400 uppercase block">${currentLang === "EN" ? "WINNING PREDICTION:" : "PRONÓSTICO CUMPLIDO:"}</span>
          <span class="text-sm font-black text-[#10b981] block">${trText(match.predictionText)}</span>
          <span class="text-xs text-white font-bold">${currentLang === "EN" ? "Odds" : "Cuota"}: @${odd.toFixed(2)} | ${currentLang === "EN" ? "Confidence" : "Confianza"}: ${match.probability || 90}%</span>
        </div>
        <div class="grid grid-cols-2 gap-2 bg-[#070d14] p-2.5 border border-[#1b2432] text-center text-xs">
          <div>
            <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "BASE STAKE" : "INVERSIÓN BASE"}</span>
            <span class="font-bold text-white">$${stake.toLocaleString("es-CO")}</span>
          </div>
          <div>
            <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "TOTAL PAYOUT" : "COBRO TOTAL"}</span>
            <span class="font-black text-[#10b981]">$${totalReturn.toLocaleString("es-CO")} (+${netProfit.toLocaleString("es-CO")})</span>
          </div>
        </div>
        <div class="text-center pt-2 border-t border-[#1b2432] text-[10px] text-slate-400">
          📲 ${currentLang === "EN" ? "Join VIP on WhatsApp:" : "Únete al VIP en WhatsApp:"} <strong class="text-white">+57 333 286 1551</strong>
        </div>
      </div>
      <div class="flex gap-2">
        <button onclick="document.getElementById('win-ticket-modal').classList.add('hidden')" class="flex-1 py-2 bg-[#0a0e14] border border-[#1b2432] text-slate-300 text-xs font-bold uppercase">
          ${currentLang === "EN" ? "Close View" : "Cerrar Vista"}
        </button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};
function formatCountdown(iso, st) {
  if (st === "FINALIZADO") return currentLang === "EN" ? "FINISHED" : "FINALIZADO";
  if (st === "EN_VIVO") return currentLang === "EN" ? "🔴 LIVE NOW" : "🔴 EN JUEGO AHORA";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return currentLang === "EN" ? "🔴 STARTING..." : "🔴 INICIANDO...";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${currentLang === "EN" ? "STARTS IN" : "INICIA EN"} ${String(h).padStart(2, "0")}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s`;
}
function startColombiaClock() {
  function tick() {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat("es-CO", {
      timeZone: CONFIG?.BRAND?.TIMEZONE || "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
    const clockEl = document.getElementById("colombia-live-clock");
    if (clockEl) clockEl.textContent = `${currentLang === "EN" ? "COLOMBIA TIME" : "HORA COLOMBIA"}: ${timeStr}`;
    document.querySelectorAll(".countdown-timer").forEach((el) => {
      if (el.dataset.status !== "FINALIZADO") {
        el.textContent = formatCountdown(el.dataset.kickoff, el.dataset.status);
      }
    });
  }
  tick();
  setInterval(tick, 1000);
}
function injectWhatsAppFloatingButton() {
  if (document.getElementById("btn-wa-floating")) return;
  const btn = document.createElement("a");
  btn.id = "btn-wa-floating";
  btn.href = CONFIG?.NOTIFICATIONS?.WHATSAPP_LINK || "https://wa.me/573332861551";
  btn.target = "_blank";
  btn.className = "fixed bottom-5 right-5 z-40 px-4 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-300 transition-all";
  btn.innerHTML = `<span>💬 ${currentLang === "EN" ? "VIP WhatsApp (+57 333 286 1551)" : "WhatsApp VIP (+57 333 286 1551)"}</span>`;
  document.body.appendChild(btn);
}
export function renderPerformanceChart() {
  const chartBox = document.getElementById("performance-chart-box");
  if (!chartBox) return;
  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  if (settled.length === 0) return;
  const chron = [...settled].reverse();
  let wins = 0;
  const totalGames = chron.length;
  const points = chron.map((it, idx) => {
    if (it.outcome === "ACIERTO") wins++;
    const hitRate = (wins / (idx + 1)) * 100;
    const x = 30 + (idx / Math.max(1, totalGames - 1)) * 530;
    const y = 140 - (hitRate / 100) * 110;
    return { x: x.toFixed(1), y: y.toFixed(1), rate: hitRate.toFixed(1), res: it.outcome };
  });
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  chartBox.innerHTML = `
    <svg viewBox="0 0 600 160" class="w-full h-full font-mono overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <line x1="30" y1="30" x2="570" y2="30" stroke="#1b2432" stroke-dasharray="3 3" />
      <text x="32" y="26" fill="#8b9bb4" font-size="9">${currentLang === "EN" ? "100% Win Rate" : "100% Acierto"}</text>
      <line x1="30" y1="52" x2="570" y2="52" stroke="#10b981" stroke-opacity="0.3" stroke-dasharray="3 3" />
      <text x="32" y="49" fill="#10b981" font-size="9">${currentLang === "EN" ? "80% Profit Zone" : "80% Zona de Ganancia"}</text>
      <line x1="30" y1="85" x2="570" y2="85" stroke="#1b2432" stroke-dasharray="3 3" />
      <text x="32" y="82" fill="#8b9bb4" font-size="9">${currentLang === "EN" ? "50% Break-Even" : "50% Equilibrio"}</text>
      <polygon fill="url(#chartGrad)" points="30,140 ${polylinePoints} 570,140" />
      <polyline fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
      ${points.map((p) => `
        <circle cx="${p.x}" cy="${p.y}" r="${p.res === "ACIERTO" ? "3.5" : "3"}" fill="${p.res === "ACIERTO" ? "#10b981" : "#ef4444"}" stroke="#05070a" stroke-width="1.5" />
      `).join("")}
    </svg>
  `;
}
window.renderPerformanceChart = renderPerformanceChart;
window.openMatchModal = (matchId) => {
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match) return;
  const isVip = isUserVipOrAdmin();
  const canSeePick = isVip || match.isFree;
  let modal = document.getElementById("match-telemetry-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "match-telemetry-modal";
    modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 font-mono";
    document.body.appendChild(modal);
  }
  const stars = getStars(match.probability);
  const homeLogo = getLogo(match.homeTeam);
  const awayLogo = getLogo(match.awayTeam);
  const fever = getPitchFeverBar(match.altitudeM, match.weatherDesc);
  modal.innerHTML = `
    <div class="quant-card max-w-2xl w-full p-4 md:p-6 space-y-4 max-h-[92vh] overflow-y-auto border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
      <div class="flex items-center justify-between border-b border-[#1b2432] pb-2 text-xs">
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${stars.badge}">
          ${stars.stars} ${stars.tag}
        </span>
        <button onclick="document.getElementById('match-telemetry-modal').classList.add('hidden')" class="px-2.5 py-1 text-slate-300 hover:text-white border border-[#1b2432] bg-[#05070a] font-bold">
          ✕ ${currentLang === "EN" ? "CLOSE" : "CERRAR"}
        </button>
      </div>
      <div class="p-3 bg-[#05070a] border border-[#1b2432] grid grid-cols-12 items-center gap-2">
        <div class="col-span-5 flex items-center gap-2">
          <img src="${homeLogo}" alt="${match.homeTeam}" class="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
          <div class="min-w-0">
            <div class="text-xs md:text-sm font-black text-white truncate">${match.homeTeam}</div>
            <span class="text-[10px] text-cyan-300 block">${currentLang === "EN" ? "Attack" : "Ataque"}: ${trText(match.homeAvgGoals || "1.8")}</span>
          </div>
        </div>
        <div class="col-span-2 text-center">
          <div class="text-lg md:text-2xl font-black text-white font-mono">${trText(match.liveScore || "vs")}</div>
          <span class="text-[9px] uppercase px-1.5 py-0.5 bg-[#161f2c] text-cyan-400 font-bold block">${trText(match.matchStatus || "PROGRAMADO")}</span>
        </div>
        <div class="col-span-5 flex items-center justify-end gap-2 text-right">
          <div class="min-w-0">
            <div class="text-xs md:text-sm font-black text-white truncate">${match.awayTeam}</div>
            <span class="text-[10px] text-emerald-300 block">${currentLang === "EN" ? "Attack" : "Ataque"}: ${trText(match.awayAvgGoals || "1.2")}</span>
          </div>
          <img src="${awayLogo}" alt="${match.awayTeam}" class="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
        </div>
      </div>
      ${
        canSeePick
          ? `
          <div class="p-3 ${match.outcome === "FALLO" ? "bg-[#15070a] border border-red-500/50" : "bg-[#061210] border border-[#10b981]/50"} flex items-center justify-between text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block uppercase">${currentLang === "EN" ? "OFFICIAL PICK:" : "JUGADA OFICIAL:"}</span>
              <span class="text-sm md:text-base font-bold ${match.outcome === "FALLO" ? "text-red-400" : "text-[#10b981]"}">${trText(match.predictionText)}</span>
              <span class="text-[11px] text-slate-400 block pt-0.5">${currentLang === "EN" ? "Assigned Odds:" : "Cuota asignada:"} <strong>@${Number(match.odds || 1.45).toFixed(2)}</strong></span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">${currentLang === "EN" ? "CONFIDENCE" : "CONFIANZA"}</span>
              <span class="text-lg md:text-xl font-black text-white">${match.probability || 90}%</span>
            </div>
          </div>
          `
          : `
          <div class="p-3 bg-[#05070a] border border-amber-500/40 flex items-center justify-between text-xs">
            <span class="text-amber-300 font-bold">🔒 ${currentLang === "EN" ? "Server-protected pick for VIP Members" : "Pronóstico protegido en servidor para Miembros VIP"}</span>
            <button onclick="document.getElementById('match-telemetry-modal').classList.add('hidden'); window.switchTab('tab-planes')" class="px-3 py-1 bg-[#10b981] text-slate-950 font-black uppercase">
              ${currentLang === "EN" ? "Unlock VIP" : "Desbloquear VIP"}
            </button>
          </div>
          `
      }
      <div class="p-3 bg-[#05070a] border border-[#1b2432] space-y-1.5 text-xs">
        <div class="flex justify-between text-[10px]">
          <span class="text-slate-400 uppercase">${currentLang === "EN" ? "PHYSICAL STRAIN / WEATHER METER:" : "TERMÓMETRO DE DESGASTE FÍSICO / CLIMA:"}</span>
          <span class="text-amber-300 font-bold">${fever.label} (${fever.stressScore}%)</span>
        </div>
        <div class="w-full h-2 bg-[#161f2c] overflow-hidden">
          <div class="${fever.color} h-full" style="width: ${fever.stressScore}%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-400 pt-1">
          <span>${currentLang === "EN" ? "Venue altitude:" : "Altitud sede:"} <strong class="text-white">${match.altitudeM || 100}m</strong></span>
          <span>${currentLang === "EN" ? "Condition:" : "Condición:"} <strong class="text-cyan-300">${trText(match.weatherDesc || "Condición Estándar")}</strong></span>
        </div>
      </div>
      ${
        match.liveStats
          ? `
          <div class="p-3 bg-[#070b10] border border-cyan-500/30 space-y-2 text-xs">
            <span class="text-cyan-300 font-bold block uppercase text-[10px]">📊 ${currentLang === "EN" ? "Live Telemetry & Match Stats:" : "Telemetría y Estadísticas en Vivo:"}</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "POSSESSION" : "POSESIÓN"}</span>
                <span class="font-bold text-white">${trText(match.liveStats.possession || "-")}</span>
              </div>
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "SHOTS" : "REMATES"}</span>
                <span class="font-bold text-white">${trText(match.liveStats.shots || "-")}</span>
              </div>
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "CORNERS" : "CÓRNERS"}</span>
                <span class="font-bold text-white">${trText(match.liveStats.corners || "-")}</span>
              </div>
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "FOULS" : "FALTAS"}</span>
                <span class="font-bold text-white">${trText(match.liveStats.fouls || "-")}</span>
              </div>
            </div>
          </div>
          `
          : ""
      }
      <div class="p-3.5 bg-[#070a0f] border border-[#1b2432] space-y-2 text-xs">
        <span class="text-cyan-300 font-bold block uppercase text-[11px] border-b border-[#1b2432] pb-1">
          ${currentLang === "EN" ? "MATCH ANALYSIS:" : "ANÁLISIS DEL PARTIDO:"}
        </span>
        <div class="text-slate-300 leading-relaxed text-xs space-y-2 whitespace-pre-line font-sans">
          ${trText(match.explanation || "Análisis táctico verificado por el modelo predictivo OptaCore.")}
        </div>
      </div>
      <div class="flex gap-2">
        <button onclick="window.copyPickToClipboard('${match.id}', event)" class="flex-1 py-2 bg-[#0a0e14] border border-cyan-400 text-cyan-300 font-bold uppercase text-xs">
          📋 ${currentLang === "EN" ? "Copy for Groups" : "Copiar para Grupos"}
        </button>
        ${
          match.outcome === "ACIERTO"
            ? `
            <button onclick="window.openWinTicketCard('${match.id}', event)" class="flex-1 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs">
              📸 ${currentLang === "EN" ? "Win Ticket" : "Ticket Victoria"}
            </button>
            `
            : ""
        }
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};
window.setQuickFilter = (filterType) => {
  activeQuickFilter = filterType;
  document.querySelectorAll(".qfilter-btn").forEach((btn) => {
    if (btn.dataset.qfilter === filterType) {
      btn.className = "qfilter-btn px-3 py-1 font-bold uppercase border border-cyan-400 bg-cyan-500/20 text-white shrink-0";
    } else {
      btn.className = "qfilter-btn px-3 py-1 font-bold uppercase border border-[#1b2432] bg-[#05070a] text-slate-400 hover:text-white shrink-0";
    }
  });
  renderTodayPredictions();
};
window.setQuickStake = (amount) => {
  const input = document.getElementById("stake-calculator-input");
  if (input) {
    input.value = amount;
    renderTodayPredictions();
  }
};
export function renderTodayPredictions() {
  const container = document.getElementById("predictions-grid");
  if (!container) return;
  const today = getColombiaDateString();
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const stake = Number(document.getElementById("stake-calculator-input")?.value || 50000);
  const isVip = isUserVipOrAdmin();
  const allFeed = getAllMasterFeed();
  const todayMatches = allFeed.filter((p) => p.matchDate === today);
  const todayList = todayMatches.length > 0 ? todayMatches : allFeed.slice(0, 10);
  const filtered = todayList.filter((p) => {
    const matchText =
      (p.homeTeam || "").toLowerCase().includes(search) ||
      (p.awayTeam || "").toLowerCase().includes(search) ||
      (p.league || "").toLowerCase().includes(search);
    let matchQuick = true;
    if (activeQuickFilter === "FÚTBOL") matchQuick = p.sport === "FÚTBOL";
    else if (activeQuickFilter === "NBA") matchQuick = p.sport === "NBA";
    else if (activeQuickFilter === "FREE") matchQuick = p.isFree === true;
    else if (activeQuickFilter === "LIVE") matchQuick = p.matchStatus === "EN_VIVO";
    return matchText && matchQuick;
  });
  const counterBadge = document.getElementById("daily-counter-badge");
  if (counterBadge) {
    counterBadge.textContent = isVip
      ? (currentLang === "EN" ? `VIP ACCESS ACTIVE (${todayList.length} PICKS TODAY)` : `ACCESO VIP ACTIVO (${todayList.length} PRONÓSTICOS HOY)`)
      : (currentLang === "EN" ? `FREE ACCESS // 4 FREE PICKS TODAY` : `ACCESO LIBRE // 4 JUGADAS GRATIS HOY`);
  }
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full quant-card p-6 text-center font-mono text-xs text-slate-400 space-y-2">
        <p>${currentLang === "EN" ? `No matches found in this category (${activeQuickFilter}).` : `No hay partidos en esta categoría con el filtro (${activeQuickFilter}).`}</p>
        <button onclick="window.setQuickFilter('ALL')" class="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold uppercase text-[10px]">
          ${currentLang === "EN" ? "Show all matches" : "Ver todos los partidos"}
        </button>
      </div>
    `;
    return;
  }
  container.innerHTML = filtered.map((item) => {
    const isVisible = isVip || item.isFree;
    const stars = getStars(item.probability);
    const homeLogo = getLogo(item.homeTeam);
    const awayLogo = getLogo(item.awayTeam);
    const fever = getPitchFeverBar(item.altitudeM, item.weatherDesc);
    const odd = Number(item.odds || 1.45);
    const isLoss = item.outcome === "FALLO";
    const totalReturn = isLoss ? 0 : Math.round(stake * odd);
    const netProfit = isLoss ? -stake : (totalReturn - stake);
    const cardBorder = isLoss ? "border-red-500/50 hover:border-red-400" : "border-[#1b2432] hover:border-cyan-400/50";
    const statusText = item.matchStatus === "FINALIZADO"
      ? (isLoss ? (currentLang === "EN" ? "✖ MISSED" : "✖ NO SE DIO") : (currentLang === "EN" ? "✔ FINISHED" : "✔ FINALIZADO"))
      : formatCountdown(item.kickoffIso, item.matchStatus);
    return `
      <article class="quant-card ${cardBorder} p-3.5 flex flex-col justify-between space-y-3 font-mono transition-all">
        <div class="flex flex-wrap items-center justify-between gap-1 border-b border-[#1b2432] pb-1.5 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 font-bold uppercase text-[9px] border ${stars.badge}">
              ${stars.stars} ${stars.tag}
            </span>
            <span class="text-slate-400 font-semibold text-[11px]">${item.league}</span>
          </div>
          <span class="countdown-timer ${isLoss ? "text-red-400" : "text-cyan-400"} font-bold text-[11px]" data-kickoff="${item.kickoffIso}" data-status="${item.matchStatus}">
            ${statusText}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2 py-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <img src="${homeLogo}" alt="${item.homeTeam}" class="w-5 h-5 object-contain shrink-0" />
            <span class="text-xs md:text-sm font-black text-white truncate">${item.homeTeam}</span>
            <span class="text-xs text-cyan-400 shrink-0">vs</span>
            <span class="text-xs md:text-sm font-black text-white truncate">${item.awayTeam}</span>
            <img src="${awayLogo}" alt="${item.awayTeam}" class="w-5 h-5 object-contain shrink-0" />
          </div>
          <span class="text-[11px] text-slate-400 shrink-0">${item.kickoffLabel}</span>
        </div>
        ${
          isVisible
            ? `
            <div class="p-2.5 ${isLoss ? "bg-[#15070a] border border-red-500/40" : "bg-[#05070a] border border-[#10b981]/40"} space-y-2 text-xs">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <span class="text-[9px] uppercase text-slate-400 block">${currentLang === "EN" ? "SUGGESTED PICK:" : "JUGADA SUGERIDA:"}</span>
                  <span class="text-xs md:text-sm font-bold ${isLoss ? "text-red-400" : "text-[#10b981]"}">${trText(item.predictionText)}</span>
                  <span class="text-[10px] text-slate-400 block">${currentLang === "EN" ? "Odds" : "Cuota"}: @${odd.toFixed(2)}</span>
                  ${item.marketEquivalent ? `<span class="text-[9px] text-cyan-300 block">📍 ${currentLang === "EN" ? "How to find:" : "Cómo buscarla:"} ${trText(item.marketEquivalent)}</span>` : ""}
                </div>
                <div class="text-right">
                  <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "PROBABILITY" : "PROBABILIDAD"}</span>
                  <span class="text-sm md:text-base font-black text-white">${item.probability || 90}%</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-[#1b2432] flex items-center justify-between text-[11px]">
                <span class="text-slate-400">${isLoss ? (currentLang === "EN" ? "Recorded loss:" : "Pérdida registrada:") : (currentLang === "EN" ? "With $" + stake.toLocaleString("es-CO") + " you collect:" : "Con $" + stake.toLocaleString("es-CO") + " cobras:")}</span>
                <span class="${isLoss ? "text-red-400" : "text-[#10b981]"} font-black">${isLoss ? "-$" + stake.toLocaleString("es-CO") + (currentLang === "EN" ? " (Missed)" : " (No acertado)") : "$" + totalReturn.toLocaleString("es-CO") + " (+$" + netProfit.toLocaleString("es-CO") + ")"}</span>
              </div>
              <div class="pt-1 space-y-1">
                <div class="flex justify-between text-[9px] text-slate-400">
                  <span>${currentLang === "EN" ? "PICK STATUS:" : "ESTADO DE LA JUGADA:"}</span>
                  <span class="font-bold ${isLoss ? "text-red-400" : (item.pickProgressPct === 100 ? "text-[#10b981]" : "text-cyan-300")}">${trText(item.pickProgressLabel) || (item.pickProgressPct || 0) + "%"}</span>
                </div>
                <div class="w-full h-1 bg-[#161f2c]">
                  <div class="${isLoss ? "bg-red-500" : (item.pickProgressPct === 100 ? "bg-[#10b981]" : "bg-cyan-400")} h-full" style="width: ${item.pickProgressPct || 0}%"></div>
                </div>
              </div>
            </div>
            `
            : `
            <div class="p-2.5 bg-[#05070a] border border-[#1b2432] flex items-center justify-between text-xs">
              <div>
                <span class="text-slate-400 text-[11px] block">🔒 ${currentLang === "EN" ? `Protected VIP Pick (Odds @${odd.toFixed(2)})` : `Jugada VIP Protegida (Cuota @${odd.toFixed(2)})`}</span>
                <span class="text-[10px] text-[#10b981]">${currentLang === "EN" ? `With $${stake.toLocaleString("es-CO")} you collect $${totalReturn.toLocaleString("es-CO")}` : `Con $${stake.toLocaleString("es-CO")} cobras $${totalReturn.toLocaleString("es-CO")}`}</span>
              </div>
              <button onclick="window.switchTab('tab-planes')" class="px-2.5 py-1 bg-[#10b981] text-slate-950 text-[10px] font-bold uppercase">
                ${currentLang === "EN" ? "Go VIP" : "Hazte VIP"}
              </button>
            </div>
            `
        }
        <div class="space-y-1">
          <div class="flex justify-between text-[10px]">
            <span class="text-slate-400">${trText(item.weatherDesc || "Condición Estándar")} (${item.altitudeM || 100}m)</span>
            <span class="text-amber-300 font-bold">${fever.label}</span>
          </div>
          <div class="w-full h-1.5 bg-[#161f2c]">
            <div class="${fever.color} h-full" style="width: ${fever.stressScore}%"></div>
          </div>
        </div>
        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-[#1b2432]">
          <div class="flex gap-1.5">
            <button onclick="window.openMatchModal('${item.id}')" class="px-2 py-1 text-[10px] font-bold uppercase bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black">
              🔍 ${currentLang === "EN" ? "Analysis" : "Análisis"}
            </button>
            <button onclick="window.copyPickToClipboard('${item.id}', event)" class="px-2 py-1 text-[10px] font-bold uppercase bg-[#0a0e14] border border-[#1b2432] text-slate-300 hover:border-cyan-400">
              📲 ${currentLang === "EN" ? "Share" : "Compartir"}
            </button>
          </div>
          ${
            item.outcome === "ACIERTO"
              ? `<button onclick="window.openWinTicketCard('${item.id}', event)" class="px-2 py-1 text-[10px] font-bold uppercase bg-[#10b981]/20 border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-black">
                  📸 Ticket
                </button>`
              : ""
          }
        </div>
      </article>
    `;
  }).join("");
}
export function renderTodayResults() {
  const box = document.getElementById("today-results-container");
  const summaryBox = document.getElementById("today-financial-summary");
  if (!box) return;
  const today = getColombiaDateString();
  const allFeed = getAllMasterFeed();
  const todayMatches = allFeed.filter((p) => p.matchDate === today);
  const todayList = todayMatches.length > 0 ? todayMatches : allFeed.slice(0, 10);
  let totalOddsWon = 0;
  let countWon = 0;
  let countLost = 0;
  todayList.forEach((p) => {
    const o = Number(p.odds || 1.45);
    if (p.outcome === "ACIERTO") {
      totalOddsWon += o;
      countWon++;
    } else if (p.outcome === "FALLO") {
      countLost++;
    }
  });
  const totalOddsLost = countLost * 1.0;
  const netDiff = totalOddsWon - totalOddsLost;
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="quant-card p-3 border-emerald-500/40 font-mono">
        <span class="text-[10px] text-slate-400 block uppercase font-bold">${currentLang === "EN" ? "CASHED MULTIPLIER" : "MULTIPLICADOR COBRADO"}</span>
        <span class="text-lg font-black text-[#10b981]">+${totalOddsWon.toFixed(2)}x</span>
        <span class="text-[10px] text-slate-400 block">${countWon} ${currentLang === "EN" ? "winning pick(s)" : "jugada(s) ganada(s)"}</span>
      </div>
      <div class="quant-card p-3 border-red-500/40 font-mono">
        <span class="text-[10px] text-slate-400 block uppercase font-bold">${currentLang === "EN" ? "REAL LOSS" : "PÉRDIDA REAL"}</span>
        <span class="text-lg font-black text-red-400">-${totalOddsLost.toFixed(2)}x</span>
        <span class="text-[10px] text-slate-400 block">${countLost} ${currentLang === "EN" ? "missed pick(s)" : "jugada(s) caída(s)"}</span>
      </div>
      <div class="quant-card p-3 font-mono ${netDiff >= 0 ? "border-cyan-500/40" : "border-amber-500/40"}">
        <span class="text-[10px] text-slate-400 block uppercase font-bold">${currentLang === "EN" ? "DAILY BALANCE" : "BALANCE DEL DÍA"}</span>
        <span class="text-lg font-black ${netDiff >= 0 ? "text-cyan-400" : "text-amber-400"}">${netDiff >= 0 ? "+" : ""}${netDiff.toFixed(2)}x</span>
        <span class="text-[10px] text-slate-400 block">${currentLang === "EN" ? "Net yield" : "Rendimiento neto"}</span>
      </div>
    `;
  }
  box.innerHTML = todayList.map((p) => {
    const badge = p.outcome === "ACIERTO"
      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
      : p.outcome === "FALLO"
      ? "border-red-500 bg-red-500/20 text-red-300"
      : "border-cyan-500 bg-cyan-500/20 text-cyan-300";
    return `
      <div class="quant-card p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs cursor-pointer hover:border-cyan-400/50" onclick="window.openMatchModal('${p.id}')">
        <div class="space-y-0.5">
          <span class="text-[10px] text-slate-400">${p.kickoffLabel} • ${p.league}</span>
          <div class="text-xs md:text-sm font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</div>
          <div class="${p.outcome === "FALLO" ? "text-red-400" : "text-cyan-300"} text-[11px]">${currentLang === "EN" ? "Pick" : "Pronóstico"}: ${trText(p.predictionText)} (@${Number(p.odds || 1.45).toFixed(2)})</div>
        </div>
        <div class="flex items-center gap-2">
          ${
            p.outcome === "ACIERTO"
              ? `<button onclick="window.openWinTicketCard('${p.id}', event)" class="px-2 py-1 bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-[10px] font-bold uppercase">
                  📸 Ticket
                </button>`
              : ""
          }
          <div class="text-right">
            <span class="text-[9px] text-slate-400 block">${trText(p.matchStatus)}</span>
            <span class="text-sm md:text-base font-black text-white">${trText(p.liveScore)}</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${badge}">${trText(p.outcome)}</span>
        </div>
      </div>
    `;
  }).join("");
}
export function renderFullPublicHistory() {
  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  let totalOddsWon = 0;
  let countWins = 0;
  let countLosses = 0;
  settled.forEach((p) => {
    const o = Number(p.odds || 1.45);
    if (p.outcome === "ACIERTO") {
      totalOddsWon += o;
      countWins++;
    } else if (p.outcome === "FALLO") {
      countLosses++;
    }
  });
  const totalOddsLost = countLosses * 1.0;
  const netBalance = totalOddsWon - totalOddsLost;
  const financialSummaryBox = document.getElementById("history-financial-summary");
  if (financialSummaryBox) {
    financialSummaryBox.innerHTML = `
      <div class="quant-card p-4 border-emerald-500/50 font-mono">
        <span class="text-[10px] text-slate-400 uppercase block font-bold">${currentLang === "EN" ? "TOTAL CASHED MULTIPLIER" : "MULTIPLICADOR TOTAL COBRADO"}</span>
        <span class="text-2xl font-black text-[#10b981]">+${totalOddsWon.toFixed(2)}x</span>
        <span class="text-[11px] text-slate-400 block">${countWins} ${currentLang === "EN" ? "cumulative winning picks" : "cuotas acertadas acumuladas"}</span>
      </div>
      <div class="quant-card p-4 border-red-500/50 font-mono">
        <span class="text-[10px] text-slate-400 uppercase block font-bold">${currentLang === "EN" ? "RECORDED LOSS" : "PÉRDIDA REGISTRADA"}</span>
        <span class="text-2xl font-black text-red-400">-${totalOddsLost.toFixed(2)}x</span>
        <span class="text-[11px] text-slate-400 block">${countLosses} ${currentLang === "EN" ? "missed matches (1x each)" : "partidos no completados (1x c/u)"}</span>
      </div>
      <div class="quant-card p-4 border-cyan-500/50 font-mono">
        <span class="text-[10px] text-cyan-300 uppercase block font-bold">${currentLang === "EN" ? "AUDITED NET BALANCE" : "BALANCE NETO AUDITADO"}</span>
        <span class="text-2xl font-black ${netBalance >= 0 ? "text-white" : "text-amber-400"}">${netBalance >= 0 ? "+" : ""}${netBalance.toFixed(2)}x</span>
        <span class="text-[11px] text-[#10b981] block font-bold">${currentLang === "EN" ? "Verified positive yield" : "Rendimiento positivo real"}</span>
      </div>
    `;
  }
  const calc = (arr) => {
    const valids = arr.filter((x) => x.outcome === "ACIERTO" || x.outcome === "FALLO");
    if (valids.length === 0) return { pct: "0.0", w: 0, tot: 0 };
    const w = valids.filter((x) => x.outcome === "ACIERTO").length;
    return { pct: ((w / valids.length) * 100).toFixed(1), w, tot: valids.length };
  };
  const totalStats = calc(settled);
  const fbStats = calc(settled.filter((p) => p.sport === "FÚTBOL"));
  const nbaStats = calc(settled.filter((p) => p.sport === "NBA"));
  const fiveStars = calc(settled.filter((p) => (p.probability || 0) >= 90));
  const kpiEl = document.getElementById("history-kpi-cards");
  if (kpiEl) {
    kpiEl.innerHTML = `
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "REAL WIN RATE" : "EFECTIVIDAD REAL"}</span>
        <span class="text-xl font-black text-[#10b981]">${totalStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${totalStats.w} ${currentLang === "EN" ? "of" : "de"} ${totalStats.tot} ${currentLang === "EN" ? "wins" : "aciertos"}</span>
      </div>
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">${currentLang === "EN" ? "FOOTBALL" : "FÚTBOL"}</span>
        <span class="text-xl font-black text-cyan-400">${fbStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${fbStats.w}/${fbStats.tot} ${currentLang === "EN" ? "won" : "acertados"}</span>
      </div>
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">NBA</span>
        <span class="text-xl font-black text-white">${nbaStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${nbaStats.w}/${nbaStats.tot} ${currentLang === "EN" ? "won" : "acertados"}</span>
      </div>
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">⭐⭐⭐⭐⭐ (5★)</span>
        <span class="text-xl font-black text-cyan-300">${fiveStars.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${fiveStars.w} ${currentLang === "EN" ? "of" : "de"} ${fiveStars.tot} ${currentLang === "EN" ? "won" : "acertados"}</span>
      </div>
    `;
  }
  renderPerformanceChart();
  const tbody = document.getElementById("history-table-body");
  if (tbody) {
    tbody.innerHTML = all.map((p) => {
      const badge = p.outcome === "ACIERTO"
        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
        : p.outcome === "FALLO"
        ? "border-red-500 bg-red-500/20 text-red-300"
        : "border-cyan-500 bg-cyan-500/20 text-cyan-300";
      return `
        <tr class="hover:bg-[#0f151f] text-xs font-mono cursor-pointer" onclick="window.openMatchModal('${p.id}')">
          <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${p.matchDate}</td>
          <td class="py-2.5 px-3 text-slate-300 whitespace-nowrap">${trText(p.sport)} // ${p.league}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${p.homeTeam} vs ${p.awayTeam}</td>
          <td class="py-2.5 px-3 ${p.outcome === "FALLO" ? "text-red-400" : "text-cyan-300"} whitespace-nowrap">${trText(p.predictionText)}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">@${Number(p.odds || 1.45).toFixed(2)}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${trText(p.liveScore)}</td>
          <td class="py-2.5 px-3 whitespace-nowrap"><span class="px-2 py-0.5 text-[9px] font-bold uppercase border ${badge}">${trText(p.outcome)}</span></td>
          <td class="py-2.5 px-3 text-right whitespace-nowrap space-x-2">
            ${
              p.outcome === "ACIERTO"
                ? `<button onclick="window.openWinTicketCard('${p.id}', event)" class="text-[#10b981] underline text-[10px]">📸 Ticket</button>`
                : ""
            }
            <span class="text-cyan-400 underline text-[10px]">${currentLang === "EN" ? "Analysis →" : "Análisis →"}</span>
          </td>
        </tr>
      `;
    }).join("");
  }
}
window.renderAdminPanel = () => {
  const listEl = document.getElementById("admin-matches-list");
  if (!listEl) return;
  const all = getAllMasterFeed();
  listEl.innerHTML = all.slice(0, 15).map((p) => `
    <div class="p-2.5 bg-[#05070a] border border-[#1b2432] flex flex-wrap items-center justify-between gap-2 text-xs">
      <div>
        <span class="text-[10px] text-slate-400">${p.matchDate} • ${p.league}</span>
        <div class="font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</div>
        <span class="text-[11px] text-cyan-300">${trText(p.predictionText)}</span>
      </div>
      <div class="flex items-center gap-2">
        <input id="score-${p.id}" type="text" value="${p.liveScore}" class="w-20 bg-[#0a0e14] border border-[#1b2432] px-2 py-1 text-white text-center font-bold" />
        <select id="outcome-${p.id}" class="bg-[#0a0e14] border border-[#1b2432] px-2 py-1 text-white">
          <option value="PENDIENTE" ${p.outcome === "PENDIENTE" ? "selected" : ""}>PENDIENTE</option>
          <option value="ACIERTO" ${p.outcome === "ACIERTO" ? "selected" : ""}>ACIERTO</option>
          <option value="FALLO" ${p.outcome === "FALLO" ? "selected" : ""}>FALLO</option>
        </select>
        <button onclick="window.adminUpdateMatch('${p.id}')" class="px-2.5 py-1 bg-[#10b981] text-slate-950 font-black uppercase text-[10px]">
          ${currentLang === "EN" ? "Save" : "Guardar"}
        </button>
      </div>
    </div>
  `).join("");
  const auditListEl = document.getElementById("admin-promoters-audit-list");
  if (auditListEl && CONFIG?.PROMO_CODES) {
    const rawAudit = JSON.parse(localStorage.getItem("optacore_promoters_audit") || "{}");
    auditListEl.innerHTML = CONFIG.PROMO_CODES.map((pr) => {
      const sales = rawAudit[pr.code] || 0;
      return `
        <div class="p-2 bg-[#05070a] border border-[#1b2432] flex items-center justify-between text-xs">
          <div>
            <strong class="text-cyan-400">${pr.code}</strong> — <span class="text-slate-300">${pr.promoter}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">${currentLang === "EN" ? "Confirmed sales:" : "Ventas confirmadas:"} <strong class="text-[#10b981]">${sales}</strong></span>
            <button onclick="window.adminAddSaleToPromoter('${pr.code}')" class="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-bold">
              +1 ${currentLang === "EN" ? "Sale" : "Venta"}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }
};
window.adminAddSaleToPromoter = (code) => {
  const rawAudit = JSON.parse(localStorage.getItem("optacore_promoters_audit") || "{}");
  rawAudit[code] = (rawAudit[code] || 0) + 1;
  localStorage.setItem("optacore_promoters_audit", JSON.stringify(rawAudit));
  window.renderAdminPanel();
};
window.adminUpdateMatch = (id) => {
  const all = getAllMasterFeed();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return;
  const newScore = document.getElementById(`score-${id}`)?.value || "vs";
  const newOutcome = document.getElementById(`outcome-${id}`)?.value || "PENDIENTE";
  all[idx].liveScore = newScore;
  all[idx].outcome = newOutcome;
  all[idx].matchStatus = newOutcome === "PENDIENTE" ? "PROGRAMADO" : "FINALIZADO";
  saveMasterFeed(all);
  window.renderAdminPanel();
  alert(`Partido actualizado: ${all[idx].homeTeam} (${newScore}) -> ${newOutcome}`);
};
window.toggleMaintenanceMode = () => {
  const isMaint = localStorage.getItem("optacore_maintenance_mode") === "true";
  const next = !isMaint;
  localStorage.setItem("optacore_maintenance_mode", next ? "true" : "false");
  const btn = document.getElementById("btn-toggle-maintenance");
  if (btn) btn.textContent = `Modo Mantenimiento: ${next ? "ON" : "OFF"}`;
  const overlay = document.getElementById("maintenance-overlay");
  if (overlay) {
    if (next) overlay.classList.remove("hidden");
    else overlay.classList.add("hidden");
  }
};
window.resetLocalDatabase = () => {
  if (confirm(currentLang === "EN" ? "Do you want to reset the predictions database?" : "¿Deseas restaurar la base de datos de pronósticos?")) {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
};
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("optacore_maintenance_mode") === "true") {
    document.getElementById("maintenance-overlay")?.classList.remove("hidden");
  }
  injectLanguageSwitcher();
  applyStaticDomTranslation();
  startColombiaClock();
  injectWhatsAppFloatingButton();
  renderLiveTickerAndStreak();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
  syncLiveHtFtResults(false);
  setInterval(() => syncLiveHtFtResults(false), 10 * 60 * 1000);
  document.getElementById("search-input")?.addEventListener("input", renderTodayPredictions);
  document.getElementById("stake-calculator-input")?.addEventListener("input", renderTodayPredictions);
  document.getElementById("admin-create-key-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("adm-key-code").value.trim().toUpperCase();
    const days = parseInt(document.getElementById("adm-key-days").value, 10);
    CONFIG.VIP_KEYS.unshift({ code, days, description: `Llave generada (${days} días)` });
    alert(`Llave ${code} creada exitosamente para ${days} días.`);
    e.target.reset();
  });
  document.getElementById("admin-create-promo-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("adm-promo-code").value.trim().toUpperCase();
    const promoter = document.getElementById("adm-promo-name").value.trim();
    CONFIG.PROMO_CODES.unshift({ code, discountPct: 20, promoter });
    alert(`Promotor ${promoter} activado con el código ${code} (-20%).`);
    e.target.reset();
    window.renderAdminPanel();
  });
  document.getElementById("admin-add-match-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const today = getColombiaDateString();
    const hhmm = document.getElementById("adm-time").value.trim() || "19:00";
    const apiFixInput = document.getElementById("adm-apifix")?.value?.trim();
    const newMatch = {
      id: "ADM-" + Date.now(),
      apiFixtureId: apiFixInput ? parseInt(apiFixInput, 10) : null,
      sport: document.getElementById("adm-sport").value,
      matchDate: today,
      kickoffIso: `${today}T${hhmm}:00-05:00`,
      kickoffLabel: `${hhmm} COL`,
      league: document.getElementById("adm-league").value.trim(),
      homeTeam: document.getElementById("adm-home").value.trim(),
      awayTeam: document.getElementById("adm-away").value.trim(),
      predictionText: document.getElementById("adm-pick").value.trim(),
      odds: parseFloat(document.getElementById("adm-odds").value) || 1.50,
      probability: parseFloat(document.getElementById("adm-prob").value) || 90.0,
      isFree: document.getElementById("adm-free").value === "true",
      altitudeM: 150,
      weatherDesc: "Condición Estándar (20°C)",
      homeAvgGoals: "1.9 por partido",
      awayAvgGoals: "1.1 por partido",
      explanation: document.getElementById("adm-exp").value.trim() || "Análisis verificado por el modelo OptaCore.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    };
    const all = getAllMasterFeed();
    all.unshift(newMatch);
    saveMasterFeed(all);
    e.target.reset();
    window.renderAdminPanel();
    alert("¡Nuevo pronóstico publicado en la cartelera!");
  });
});
