// ============================================================================
// ARCHIVO: pronosticos.js - Corrección de Pantalla de Mantenimiento y Bilingüe
// ============================================================================
import { CONFIG } from "./config.js";
import { isUserVipOrAdmin } from "./auth.js";
const DB_KEY = "optacore_master_feed_v30";
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
  }).f
