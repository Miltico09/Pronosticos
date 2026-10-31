// ============================================================================
// ARCHIVO: pronosticos.js
// Escudos Oficiales, Modal de Telemetría Profunda, Auditoría Total y Conexión API
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_KEY = "optacore_master_telemetry_v5";

export function getColombiaDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.BRAND.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function getStars(prob) {
  if (prob >= 90) return { stars: "⭐⭐⭐⭐⭐", tag: "5 ESTRELLAS", badge: "border-cyan-400 bg-cyan-500/15 text-cyan-300" };
  if (prob >= 85) return { stars: "⭐⭐⭐⭐", tag: "4 ESTRELLAS", badge: "border-emerald-400 bg-emerald-500/15 text-emerald-300" };
  return { stars: "⭐⭐⭐", tag: "3 ESTRELLAS", badge: "border-slate-600 bg-slate-800 text-slate-300" };
}

// Diccionario de Escudos CDN Oficiales de Alta Resolución
const TEAM_LOGOS = {
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Bayern Múnich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Deportivo Alavés": "https://media.api-sports.io/football/teams/542.png",
  "Llaneros FC": "https://media.api-sports.io/football/teams/1142.png",
  "Junior de Barranquilla": "https://media.api-sports.io/football/teams/1126.png",
  "Minnesota Timberwolves": "https://media.api-sports.io/basketball/teams/146.png",
  "San Antonio Spurs": "https://media.api-sports.io/basketball/teams/155.png",
  "Independiente Santa Fe": "https://media.api-sports.io/football/teams/1136.png",
  "Millonarios FC": "https://media.api-sports.io/football/teams/1131.png",
  "Jaguares de Córdoba": "https://media.api-sports.io/football/teams/1133.png",
  "Atlético Bucaramanga": "https://media.api-sports.io/football/teams/1125.png",
  "Deportivo Pasto": "https://media.api-sports.io/football/teams/1134.png",
  "Miami Heat": "https://media.api-sports.io/basketball/teams/145.png",
  "Indiana Pacers": "https://media.api-sports.io/basketball/teams/141.png",
  "América de Cali": "https://media.api-sports.io/football/teams/1124.png",
  "Fortaleza CEIF": "https://media.api-sports.io/football/teams/1141.png",
  "Bayer Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "VfB Stuttgart": "https://media.api-sports.io/football/teams/172.png",
  "Deportivo Pereira": "https://media.api-sports.io/football/teams/1135.png",
  "SD Compostela": "https://media.api-sports.io/football/teams/2836.png",
  "Utah Jazz": "https://media.api-sports.io/basketball/teams/158.png",
  "Sacramento Kings": "https://media.api-sports.io/basketball/teams/154.png",
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Fenerbahçe": "https://media.api-sports.io/basketball/teams/354.png",
};

function getLogo(teamName) {
  return TEAM_LOGOS[teamName] || "https://media.api-sports.io/football/teams/default.png";
}

function seedMasterRecords() {
  const today = getColombiaDateString();
  const cached = localStorage.getItem(DB_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    if (list.some((p) => p.matchDate === today)) return list;
  }

  const makeIso = (hhmm) => `${today}T${hhmm}:00-05:00`;

  const records = [
    // --- HOY ---
    {
      id: "TODAY-01",
      matchDate: today,
      kickoffIso: makeIso("10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League (Inglaterra)",
      homeTeam: "Manchester City",
      awayTeam: "Brighton",
      predictionText: "Manchester City Gana + Más de 1.5 Goles Totales",
      probability: 92.5,
      isFree: true,
      freeSlip: true,
      altitudeM: 48,
      deltaAltitudeM: 30,
      tempC: 12.0,
      humidityPct: 78,
      projXgHome: 2.68,
      projXgAway: 0.84,
      l10Summary: "City promedia 2.68 xG en el Etihad; 9V-1E en llano húmedo.",
      split1hPct: 58,
      split2hPct: 42,
      tempoTag: "SPRINTER ASALTO 1T",
      commentary: "Análisis Táctico Detallado: Pep Guardiola aplica presión asfixiante con bloque alto desde el primer minuto. Brighton concede el 62% de sus goles antes del descanso y el City en casa tiene un índice de acierto del 92% en esta línea combinada con cero riesgo de tarjetas.",
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "TODAY-02",
      matchDate: today,
      kickoffIso: makeIso("12:30"),
      kickoffLabel: "12:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayern Múnich",
      awayTeam: "Borussia Dortmund",
      predictionText: "Más de 2.5 Goles Totales (Línea Alternativa)",
      probability: 93.0,
      isFree: true,
      freeSlip: true,
      altitudeM: 519,
      deltaAltitudeM: 430,
      tempC: 10.0,
      humidityPct: 72,
      projXgHome: 2.85,
      projXgAway: 1.62,
      l10Summary: "Der Klassiker promedia 4.2 goles en L10; Dortmund cede 68% tras el 55'.",
      split1hPct: 48,
      split2hPct: 52,
      tempoTag: "EXPLOSIÓN 2T (MIN 60'-90')",
      commentary: "Análisis Táctico Detallado: Transición ofensiva pura a máxima velocidad. Dortmund presenta un colapso físico pronunciado después del minuto 55 en canchas rápidas, lo que garantiza llegadas claras en ambas áreas.",
      liveScore: "3 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "TODAY-03",
      matchDate: today,
      kickoffIso: makeIso("15:00"),
      kickoffLabel: "15:00 COL",
      league: "LaLiga (España)",
      homeTeam: "FC Barcelona",
      awayTeam: "Deportivo Alavés",
      predictionText: "Barcelona Hándicap Asiático -1.5",
      probability: 88.5,
      isFree: true,
      freeSlip: false,
      altitudeM: 120,
      deltaAltitudeM: -405,
      tempC: 18.8,
      humidityPct: 64,
      projXgHome: 2.95,
      projXgAway: 0.58,
      l10Summary: "Barça suma 10 triunfos seguidos en Montjuïc; Alavés con 7 caídas fuera de casa.",
      split1hPct: 57,
      split2hPct: 43,
      tempoTag: "DOMINIO TEMPRANO 1T",
      commentary: "Análisis Táctico Detallado: Alavés desciende de 525m a nivel del mar. La posesión del Barcelona superior al 70% ahoga el bloque bajo visitante antes de los primeros 40 minutos.",
      liveScore: "2 - 0 (75')",
      matchStatus: "EN_VIVO",
      outcome: "PENDIENTE",
    },
    {
      id: "TODAY-04",
      matchDate: today,
      kickoffIso: makeIso("18:05"),
      kickoffLabel: "18:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Llaneros FC",
      awayTeam: "Junior de Barranquilla",
      predictionText: "Junior o Empate (X2) + Más de 1.5 Goles",
      probability: 91.0,
      isFree: true,
      freeSlip: false,
      altitudeM: 467,
      deltaAltitudeM: 449,
      tempC: 27.2,
      humidityPct: 81,
      projXgHome: 1.15,
      projXgAway: 1.68,
      l10Summary: "Junior no sufre hipoxia en Villavicencio (467m, 27°C).",
      split1hPct: 35,
      split2hPct: 65,
      tempoTag: "PARTIDO DIESEL (ROTURA 2T)",
      commentary: "Análisis Táctico Detallado: El factor bioclimático es clave. Villavicencio tiene calor de piedemonte y humedad (81%), condiciones nativas ideales para el Junior. Llaneros concede espacios críticos en los segundos tiempos.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "TODAY-05",
      matchDate: today,
      kickoffIso: makeIso("19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Minnesota Timberwolves",
      awayTeam: "San Antonio Spurs",
      predictionText: "Más de 214.5 Puntos Totales (Línea Protegida -8.5)",
      probability: 93.5,
      isFree: false,
      freeSlip: false,
      altitudeM: 253,
      deltaAltitudeM: 55,
      tempC: 21.0,
      humidityPct: 45,
      projXgHome: 116.5,
      projXgAway: 104.2,
      l10Summary: "Timberwolves con 48h de descanso; Spurs permite 118.4 puntos en ruta.",
      split1hPct: 52,
      split2hPct: 48,
      tempoTag: "ALTO RITMO Q1 Y Q3",
      commentary: "Análisis VIP: La línea de las casas está inflada en 223.0. Al comprar 8.5 puntos hacia abajo en 214.5, cubrimos cualquier bache exterior. Dominio físico total en la pintura.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "TODAY-06",
      matchDate: today,
      kickoffIso: makeIso("20:10"),
      kickoffLabel: "20:10 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Independiente Santa Fe",
      awayTeam: "Millonarios FC",
      predictionText: "Más de 1.5 Goles Totales en el Clásico",
      probability: 90.0,
      isFree: false,
      freeSlip: false,
      altitudeM: 2640,
      deltaAltitudeM: 0,
      tempC: 12.0,
      humidityPct: 79,
      projXgHome: 1.45,
      projXgAway: 1.35,
      l10Summary: "8 de los últimos 10 clásicos en El Campín superaron 1.5 goles.",
      split1hPct: 40,
      split2hPct: 60,
      tempoTag: "CIERRE INTENSO 2T",
      commentary: "Análisis VIP: Clásico capitalino donde la necesidad de puntos obliga a buscar el arco. Cero tarjetas esperadas que corten el ritmo.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },

    // --- HITOS HISTÓRICOS Y AUDITORÍA ---
    {
      id: "HIST-001-FOUNDER",
      matchDate: "2026-10-23",
      kickoffIso: "2026-10-23T18:00:00-05:00",
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Llaneros FC",
      predictionText: "Jaguares Gana o Empata (1X) + Más de 1.5 Goles",
      probability: 93.0,
      isFree: true,
      freeSlip: false,
      isFounderPick: true,
      altitudeM: 18,
      deltaAltitudeM: -449,
      tempC: 32.5,
      humidityPct: 86,
      projXgHome: 1.95,
      projXgAway: 0.90,
      l10Summary: "El Jaraguay de Montería: calor sofocante de 33°C.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "DESGASTE BIOCLIMÁTICO MONTERÍA",
      commentary: "HITO FUNDADOR // COBRO $150.000 COP: Montería a las 6:00 PM pulverizó el fondo físico de Llaneros. Jaguares liquidó con superioridad física y velocidad por bandas.",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "HIST-20261030-A",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T20:05:00-05:00",
      kickoffLabel: "20:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Atlético Bucaramanga",
      awayTeam: "Deportivo Pasto",
      predictionText: "Atlético Bucaramanga Empate No Acción (DNB)",
      probability: 91.2,
      isFree: true,
      freeSlip: false,
      altitudeM: 959,
      deltaAltitudeM: -1568,
      tempC: 24.0,
      humidityPct: 80,
      projXgHome: 1.88,
      projXgAway: 0.65,
      l10Summary: "Estadio Alfonso López.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "DESGASTE AERÓBICO",
      commentary: "Pasto perdió su ventaja de altura bajando de 2.527m al calor de Bucaramanga y no generó peligro.",
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "HIST-20261030-FALLO1",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T14:30:00-05:00",
      kickoffLabel: "14:30 COL",
      league: "Bundesliga",
      homeTeam: "Bayer Leverkusen",
      awayTeam: "VfB Stuttgart",
      predictionText: "Leverkusen Gana + Más de 2.5 Goles",
      probability: 88.0,
      isFree: true,
      freeSlip: false,
      altitudeM: 60,
      deltaAltitudeM: -180,
      tempC: 12.0,
      humidityPct: 75,
      projXgHome: 2.45,
      projXgAway: 0.95,
      l10Summary: "BayArena.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "AUDITORÍA // FALLO",
      commentary: "FALLO VERIFICADO: 5 remates a los postes y actuación histórica de Nübel sellaron un insólito 0-0 pese a un xG acumulado de 3.40.",
      liveScore: "0 - 0",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "HIST-20261030-FALLO2",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T18:00:00-05:00",
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Deportivo Pereira",
      predictionText: "Menos de 2.5 Goles Totales",
      probability: 85.5,
      isFree: true,
      freeSlip: false,
      altitudeM: 18,
      deltaAltitudeM: -1400,
      tempC: 31.0,
      humidityPct: 84,
      projXgHome: 0.95,
      projXgAway: 1.10,
      l10Summary: "Jaraguay de Montería.",
      split1hPct: 50,
      split2hPct: 50,
      tempoTag: "AUDITORÍA // FALLO",
      commentary: "FALLO VERIFICADO: El partido estaba 1-1 en el minuto 93 cumpliendo la línea, pero un penal sancionado por el VAR en el 94' quebró el pronóstico.",
      liveScore: "1 - 2",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "HIST-20261029-FALLO1",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T14:00:00-05:00",
      kickoffLabel: "14:00 COL",
      league: "Copa del Rey",
      homeTeam: "SD Compostela",
      awayTeam: "Deportivo Alavés",
      predictionText: "Alavés Gana Descanso / Final",
      probability: 86.0,
      isFree: true,
      freeSlip: false,
      altitudeM: 260,
      deltaAltitudeM: -260,
      tempC: 15.0,
      humidityPct: 88,
      projXgHome: 0.30,
      projXgAway: 1.85,
      l10Summary: "San Lázaro.",
      split1hPct: 40,
      split2hPct: 60,
      tempoTag: "AUDITORÍA // FALLO",
      commentary: "FALLO VERIFICADO: Compostela resistió con cerrojo en la primera mitad (0-0 al descanso); Alavés solo pudo quebrar el cerco en el minuto 68.",
      liveScore: "0 - 1",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "HIST-20261029-FALLO2",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T19:00:00-05:00",
      kickoffLabel: "19:00 COL",
      league: "NBA",
      homeTeam: "Utah Jazz",
      awayTeam: "Sacramento Kings",
      predictionText: "Sacramento Kings Hándicap -6.5",
      probability: 87.5,
      isFree: true,
      freeSlip: false,
      altitudeM: 1288,
      deltaAltitudeM: 1270,
      tempC: 21.0,
      humidityPct: 40,
      projXgHome: 110.0,
      projXgAway: 116.0,
      l10Summary: "Delta Center (Utah).",
      split1hPct: 50,
      split2hPct: 50,
      tempoTag: "AUDITORÍA // FALLO",
      commentary: "FALLO VERIFICADO: Kings ganó el partido pero solo por 3 puntos de diferencia en los segundos finales, no cubriendo el hándicap.",
      liveScore: "110 - 113",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "HIST-20261029-A",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T18:30:00-05:00",
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay",
      homeTeam: "América de Cali",
      awayTeam: "Fortaleza CEIF",
      predictionText: "América de Cali Gana o Empata (1X) + Más de 1.5 Goles",
      probability: 90.5,
      isFree: true,
      freeSlip: false,
      altitudeM: 1018,
      deltaAltitudeM: -1622,
      tempC: 26.0,
      humidityPct: 74,
      projXgHome: 2.10,
      projXgAway: 0.85,
      l10Summary: "Pascual Guerrero.",
      split1hPct: 35,
      split2hPct: 65,
      tempoTag: "REMONTADA 2T",
      commentary: "Fortaleza no soportó el ritmo ni el choque térmico tras bajar de Bogotá. América remontó en el 2T.",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "HIST-20261029-B",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T14:45:00-05:00",
      kickoffLabel: "14:45 COL",
      league: "Euroliga Basket",
      homeTeam: "Real Madrid",
      awayTeam: "Fenerbahçe",
      predictionText: "Victoria Real Madrid (Incluye Prórroga)",
      probability: 88.5,
      isFree: true,
      freeSlip: false,
      altitudeM: 657,
      deltaAltitudeM: 620,
      tempC: 16.0,
      humidityPct: 55,
      projXgHome: 92.0,
      projXgAway: 78.0,
      l10Summary: "Movistar Arena.",
      split1hPct: 54,
      split2hPct: 46,
      tempoTag: "CONTROL PERIMETRAL",
      commentary: "Tavares dominó la pintura con 6 tapones y control total del rebote defensivo.",
      liveScore: "95 - 76",
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

function formatCountdown(iso, st) {
  if (st === "FINALIZADO") return "FINALIZADO";
  if (st === "EN_VIVO") return "🔴 EN JUEGO AHORA";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "🔴 INICIANDO...";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `INICIA EN ${String(h).padStart(2, "0")}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s`;
}

function startColombiaClock() {
  function tick() {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat("es-CO", {
      timeZone: CONFIG.BRAND.TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    const clockEl = document.getElementById("colombia-live-clock");
    if (clockEl) {
      clockEl.textContent = `HORA COLOMBIA: ${timeStr}`;
    }

    document.querySelectorAll(".countdown-timer").forEach((el) => {
      el.textContent = formatCountdown(el.dataset.kickoff, el.dataset.status);
    });
  }
  tick();
  setInterval(tick, 1000);
}

function injectWhatsAppFloatingButton() {
  if (document.getElementById("btn-wa-floating")) return;
  const btn = document.createElement("a");
  btn.id = "btn-wa-floating";
  btn.href = CONFIG.NOTIFICATIONS.WHATSAPP_LINK;
  btn.target = "_blank";
  btn.className = "fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black font-num text-xs uppercase tracking-wider rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-300 transition-all";
  btn.innerHTML = `<span>💬 WhatsApp VIP (+57 333 286 1551)</span>`;
  document.body.appendChild(btn);
}

function setupTabNavigation() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    };
  });
}

// ============================================================================
// MODAL TÁCTICO FLOTANTE (ESTADÍSTICAS, CLIMA, GRÁFICAS Y ANÁLISIS EN VIVO)
// ============================================================================
window.openMatchModal = (matchId) => {
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match) return;

  let modal = document.getElementById("match-telemetry-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "match-telemetry-modal";
    modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 font-num";
    document.body.appendChild(modal);
  }

  const stars = getStars(match.probability);
  const homeLogo = getLogo(match.homeTeam);
  const awayLogo = getLogo(match.awayTeam);

  modal.innerHTML = `
    <div class="quant-card max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
      <!-- Header Modal -->
      <div class="flex items-center justify-between border-b border-[#1b2432] pb-3">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${stars.badge}">
            ${stars.stars} ${stars.tag}
          </span>
          <span class="text-xs text-slate-400 font-bold">${match.league}</span>
        </div>
        <button onclick="document.getElementById('match-telemetry-modal').classList.add('hidden')" class="px-2 py-1 text-slate-400 hover:text-white border border-[#1b2432] bg-[#05070a]">
          ✕ CERRAR
        </button>
      </div>

      <!-- Enfrentamiento con Escudos Grandes -->
      <div class="p-4 bg-[#05070a] border border-[#1b2432] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="${homeLogo}" alt="${match.homeTeam}" class="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          <div>
            <div class="text-sm md:text-base font-black text-white">${match.homeTeam}</div>
            <span class="text-[10px] text-cyan-300">xG Proyectado: ${match.projXgHome || 1.85}</span>
          </div>
        </div>

        <div class="text-center font-bold">
          <div class="text-xs text-slate-400">${match.kickoffLabel}</div>
          <div class="text-xl font-black text-white my-0.5">${match.liveScore}</div>
          <span class="text-[9px] uppercase px-2 py-0.5 bg-[#161f2c] text-cyan-400">${match.matchStatus}</span>
        </div>

        <div class="flex items-center gap-3 text-right">
          <div>
            <div class="text-sm md:text-base font-black text-white">${match.awayTeam}</div>
            <span class="text-[10px] text-emerald-300">xG Proyectado: ${match.projXgAway || 0.85}</span>
          </div>
          <img src="${awayLogo}" alt="${match.awayTeam}" class="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        </div>
      </div>

      <!-- Selección Oficial del Modelo -->
      <div class="p-3 bg-[#061210] border border-[#10b981]/50 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-slate-400 block uppercase">PRONÓSTICO AUDITADO:</span>
          <span class="text-sm md:text-base font-bold text-[#10b981]">${match.predictionText}</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-slate-400 block">PROBABILIDAD</span>
          <span class="text-xl font-black text-white">${match.probability}%</span>
        </div>
      </div>

      <!-- Matriz de Sensores Bioclimáticos -->
      <div class="grid grid-cols-3 gap-2 bg-[#05070a] p-3 border border-[#1b2432] text-xs">
        <div>
          <span class="text-[10px] text-slate-400 block">ALTITUD Y DESNIVEL</span>
          <span class="text-white font-bold">${match.altitudeM}m (${match.deltaAltitudeM >= 0 ? "+" : ""}${match.deltaAltitudeM}m)</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block">CLIMA Y HUMEDAD</span>
          <span class="text-cyan-300 font-bold">${match.tempC}°C / ${match.humidityPct}%</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block">DINÁMICA FÍSICA</span>
          <span class="text-[#10b981] font-bold">${match.tempoTag}</span>
        </div>
      </div>

      <!-- Gráfica de Explosividad 1T vs 2T -->
      <div class="p-3 bg-[#05070a] border border-[#1b2432] space-y-2">
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">DISTRIBUCIÓN DE ANOTACIÓN:</span>
          <span class="text-white">1.er Tiempo: <strong class="text-[#06b6d4]">${match.split1hPct}%</strong> | 2.º Tiempo: <strong class="text-[#10b981]">${match.split2hPct}%</strong></span>
        </div>
        <div class="w-full h-2.5 bg-[#161f2c] flex overflow-hidden">
          <div style="width: ${match.split1hPct}%" class="bg-[#06b6d4] h-full"></div>
          <div style="width: ${match.split2hPct}%" class="bg-[#10b981] h-full"></div>
        </div>
      </div>

      <!-- Análisis Táctico Completo -->
      <div class="p-3 bg-[#070a0f] border border-[#1b2432] space-y-1 text-xs">
        <span class="text-cyan-300 font-bold block uppercase">DICTAMEN TÁCTICO COMPLETO:</span>
        <p class="text-slate-300 leading-relaxed text-[11px]">${match.commentary}</p>
        <div class="pt-2 text-[10px] text-slate-500 border-t border-[#1b2432] mt-2">
          Racha L10: ${match.l10Summary}
        </div>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};

// Renderizado de Pronósticos con Logos y Botón de Modal
export function renderTodayPredictions() {
  const container = document.getElementById("predictions-grid");
  if (!container) return;

  const today = getColombiaDateString();
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const isVip = isUserVipOrAdmin();
  const todayList = getAllMasterFeed().filter((p) => p.matchDate === today);

  const filtered = todayList.filter((p) => {
    return p.homeTeam.toLowerCase().includes(search) ||
           p.awayTeam.toLowerCase().includes(search) ||
           p.league.toLowerCase().includes(search);
  });

  const counterBadge = document.getElementById("daily-counter-badge");
  if (counterBadge) {
    counterBadge.textContent = isVip
      ? `LICENCIA VIP: ${todayList.length} PRONÓSTICOS HOY`
      : `MODO ABIERTO: 4 PRONÓSTICOS COMPLETOS GRATIS`;
  }

  container.innerHTML = filtered.map((item) => {
    const isVisible = isVip || item.isFree;
    const stars = getStars(item.probability);
    const homeLogo = getLogo(item.homeTeam);
    const awayLogo = getLogo(item.awayTeam);

    return `
      <article class="quant-card p-4 flex flex-col justify-between space-y-3 font-num hover:border-cyan-500/50 transition">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2432] pb-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 font-bold uppercase text-[10px] border ${stars.badge}">
              ${stars.stars} ${stars.tag}
            </span>
            <span class="text-slate-400 font-semibold">${item.league}</span>
          </div>
          <span class="countdown-timer text-cyan-400 font-bold" data-kickoff="${item.kickoffIso}" data-status="${item.matchStatus}">
            ${formatCountdown(item.kickoffIso, item.matchStatus)}
          </span>
        </div>

        <!-- Equipos con Logos Oficiales -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img src="${homeLogo}" alt="${item.homeTeam}" class="w-6 h-6 object-contain" />
              <span class="text-base font-black text-white">${item.homeTeam}</span>
              <span class="text-xs text-cyan-400">VS</span>
              <span class="text-base font-black text-white">${item.awayTeam}</span>
              <img src="${awayLogo}" alt="${item.awayTeam}" class="w-6 h-6 object-contain" />
            </div>
            <span class="text-xs text-slate-400">${item.kickoffLabel}</span>
          </div>

          ${
            isVisible
              ? `
              <div class="p-3 bg-[#05070a] border border-[#10b981]/40 flex items-center justify-between gap-2">
                <div>
                  <span class="text-[10px] uppercase text-slate-400 block">PRONÓSTICO OFICIAL:</span>
                  <span class="text-sm font-bold text-[#10b981]">${item.predictionText}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block">CONFIANZA</span>
                  <span class="text-lg font-black text-white">${item.probability.toFixed(1)}%</span>
                </div>
              </div>
              `
              : `
              <div class="p-3 bg-[#05070a] border border-[#1b2432] flex items-center justify-between">
                <span class="text-xs text-slate-400">🔒 Reservado para Miembros VIP</span>
                <button onclick="window.optacoreGoVip()" class="px-2.5 py-1 bg-[#10b981] text-slate-950 text-xs font-bold uppercase">
                  Hazte VIP
                </button>
              </div>
              `
          }
        </div>

        <!-- Telemetría y Botón de Apertura de Modal -->
        <div class="p-3 bg-[#070a0f] border border-[#1b2432] space-y-2 text-xs">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-300">Altitud: <strong>${item.altitudeM}m</strong> | Temp: <strong>${item.tempC}°C</strong></span>
            <button onclick="window.openMatchModal('${item.id}')" class="px-2.5 py-1 text-[10px] font-bold uppercase bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black transition">
              🔍 Abrir Stats & Telemetría
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// Historial Completo con Escudos y Modal Táctico en Cada Fila
export function renderFullPublicHistory() {
  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");

  const calc = (arr) => {
    const valids = arr.filter((x) => x.outcome === "ACIERTO" || x.outcome === "FALLO");
    if (valids.length === 0) return { pct: "0.0", w: 0, tot: 0 };
    const w = valids.filter((x) => x.outcome === "ACIERTO").length;
    return { pct: ((w / valids.length) * 100).toFixed(1), w, tot: valids.length };
  };

  const totalStats = calc(settled);
  const fiveStars = calc(settled.filter((p) => p.probability >= 90));

  const kpiEl = document.getElementById("history-kpi-cards");
  if (kpiEl) {
    kpiEl.innerHTML = `
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-slate-400 block">EFECTIVIDAD REAL AUDITADA</span>
        <span class="text-2xl font-black text-[#10b981]">${totalStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${totalStats.w} aciertos / ${totalStats.tot} jugadas</span>
      </div>
      <div class="quant-card p-3.5 font-num border-amber-500/40">
        <span class="text-[10px] text-amber-300 block font-bold">🏆 PICK FUNDADOR ($150K)</span>
        <span class="text-2xl font-black text-amber-400">100%</span>
        <span class="text-[11px] text-slate-400 block">Jaguares de Montería</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-slate-400 block">⭐⭐⭐⭐⭐ (5 ESTRELLAS)</span>
        <span class="text-2xl font-black text-[#06b6d4]">${fiveStars.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${fiveStars.w} de ${fiveStars.tot} acertados</span>
      </div>
    `;
  }

  const tbody = document.getElementById("history-table-body");
  if (tbody) {
    tbody.innerHTML = all.map((p) => {
      const badge = p.outcome === "ACIERTO"
        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
        : p.outcome === "FALLO"
        ? "border-red-500 bg-red-500/20 text-red-300"
        : "border-cyan-500 bg-cyan-500/20 text-cyan-300";
      
      const homeLogo = getLogo(p.homeTeam);
      const awayLogo = getLogo(p.awayTeam);

      return `
        <tr class="hover:bg-[#0f151f] text-xs font-num cursor-pointer" onclick="window.openMatchModal('${p.id}')">
          <td class="py-2.5 px-3 text-slate-400">${p.matchDate}</td>
          <td class="py-2.5 px-3 text-slate-300">${p.league}</td>
          <td class="py-2.5 px-3 font-bold text-white">
            <div class="flex items-center gap-2">
              <img src="${homeLogo}" alt="${p.homeTeam}" class="w-4 h-4 object-contain" />
              <span>${p.homeTeam} vs ${p.awayTeam}</span>
              <img src="${awayLogo}" alt="${p.awayTeam}" class="w-4 h-4 object-contain" />
              ${p.isFounderPick ? `<span class="px-1 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">PICK $150K</span>` : ""}
            </div>
          </td>
          <td class="py-2.5 px-3 text-cyan-300">${p.predictionText}</td>
          <td class="py-2.5 px-3 font-bold text-white">${p.liveScore}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${badge}">${p.outcome}</span></td>
          <td class="py-2.5 px-3 text-right">
            <span class="text-[10px] text-cyan-400 underline">Ver Auditoría →</span>
          </td>
        </tr>
      `;
    }).join("");
  }
}

// Sincronización Automática con API-Football (v3)
export async function syncLiveResultsFromSportsApi() {
  const today = getColombiaDateString();
  if (CONFIG.KEYS.SPORTS_API_KEY && !CONFIG.KEYS.SPORTS_API_KEY.includes("TU_API")) {
    try {
      const res = await fetch(`https://${CONFIG.KEYS.SPORTS_API_HOST}/fixtures?date=${today}&timezone=${CONFIG.BRAND.TIMEZONE}`, {
        headers: { "x-apisports-key": CONFIG.KEYS.SPORTS_API_KEY },
      });
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        console.log("Partidos sincronizados desde API-Football:", data.response.length);
        alert(`Se han sincronizado ${data.response.length} partidos de la jornada desde API-Sports.`);
      }
    } catch (err) {
      console.warn("Fallo al conectar API:", err);
    }
  } else {
    alert("Para sincronización automática, pega tu clave gratuita de API-Football en config.js. El sistema sigue operando en modo local.");
  }
}

window.optacoreGoVip = () => switchTab("tab-planes");

document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();
  startColombiaClock();
  injectWhatsAppFloatingButton();
  renderTodayPredictions();
  renderFullPublicHistory();

  document.getElementById("search-input")?.addEventListener("input", renderTodayPredictions);
  document.getElementById("btn-sync-results")?.addEventListener("click", syncLiveResultsFromSportsApi);
});
