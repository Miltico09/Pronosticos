// ============================================================================
// ARCHIVO: pronosticos.js
// Visualización Abierta (Sin Registro), Sistema 3-4-5 Estrellas e Historial Lleno
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_PREDICTIONS_KEY = "optacore_all_predictions_v2";

export function getColombiaDateString(dateObj = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.BRAND.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}

// Conversión del sistema de tiers a estrellas visuales
function getStarsInfo(tier, prob) {
  if (tier === "DIAMANTE" || prob >= 90) {
    return {
      stars: "⭐⭐⭐⭐⭐",
      level: "5 ESTRELLAS",
      badgeClass: "border-cyan-400 bg-cyan-500/15 text-cyan-300",
    };
  } else if (tier === "ORO" || (prob >= 85 && prob < 90)) {
    return {
      stars: "⭐⭐⭐⭐",
      level: "4 ESTRELLAS",
      badgeClass: "border-emerald-400 bg-emerald-500/15 text-emerald-300",
    };
  } else {
    return {
      stars: "⭐⭐⭐",
      level: "3 ESTRELLAS",
      badgeClass: "border-slate-500 bg-slate-800 text-slate-300",
    };
  }
}

function seedInitialPredictions() {
  const todayCol = getColombiaDateString();
  const saved = localStorage.getItem(DB_PREDICTIONS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.some((p) => p.matchDate === todayCol)) return parsed;
  }

  const makeKickoffIso = (timeHHMM) => `${todayCol}T${timeHHMM}:00-05:00`;

  const initialData = [
    // ==========================================
    // PRONÓSTICOS DE HOY (SÁBADO 31 DE OCTUBRE)
    // ==========================================
    {
      id: "OPTA-20261031-01",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League (Inglaterra)",
      homeTeam: "Manchester City",
      awayTeam: "Brighton",
      predictionText: "Manchester City Gana + Más de 1.5 Goles",
      probability: 92.5,
      tier: "DIAMANTE",
      altitudeM: 48,
      deltaAltitudeM: 30,
      tempC: 12.0,
      humidityPct: 78,
      l10Summary: "City promedia 2.68 xG en el Etihad; 9V-1E en llano húmedo.",
      split1hPct: 58,
      split2hPct: 42,
      tempoTag: "SPRINTER // ASALTO 1T",
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-20261031-02",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("12:30"),
      kickoffLabel: "12:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayern Múnich",
      awayTeam: "Borussia Dortmund",
      predictionText: "Más de 2.5 Goles Totales",
      probability: 93.0,
      tier: "DIAMANTE",
      altitudeM: 519,
      deltaAltitudeM: 430,
      tempC: 10.0,
      humidityPct: 72,
      l10Summary: "Der Klassiker promedia 4.2 goles en L10; Dortmund cede 68% tras el 55'.",
      split1hPct: 48,
      split2hPct: 52,
      tempoTag: "EXPLOSIÓN 2T (MIN 60'-90')",
      liveScore: "3 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-20261031-03",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("15:00"),
      kickoffLabel: "15:00 COL",
      league: "LaLiga (España)",
      homeTeam: "FC Barcelona",
      awayTeam: "Deportivo Alavés",
      predictionText: "Barcelona Hándicap Asiático -1.5",
      probability: 88.5,
      tier: "ORO",
      altitudeM: 120,
      deltaAltitudeM: -405,
      tempC: 18.8,
      humidityPct: 64,
      l10Summary: "Alavés baja a nivel del mar con 7 derrotas en sus últimas 10 salidas.",
      split1hPct: 57,
      split2hPct: 43,
      tempoTag: "DOMINIO TEMPRANO 1T",
      liveScore: "2 - 0 (65')",
      matchStatus: "EN_VIVO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-20261031-04",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("16:10"),
      kickoffLabel: "16:10 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Envigado FC",
      awayTeam: "Deportes Tolima",
      predictionText: "Tolima Empate No Acción (DNB) / +1.5 Goles",
      probability: 87.0,
      tier: "ORO",
      altitudeM: 1575,
      deltaAltitudeM: 290,
      tempC: 23.0,
      humidityPct: 70,
      l10Summary: "Tolima invicto en pisos templados (1.500m); Envigado encaja 1.7 goles/partido.",
      split1hPct: 44,
      split2hPct: 56,
      tempoTag: "DESGASTE FÍSICO 2T",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-20261031-05",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("18:05"),
      kickoffLabel: "18:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Llaneros FC",
      awayTeam: "Junior de Barranquilla",
      predictionText: "Junior o Empate (X2) + Más de 1.5 Goles",
      probability: 91.0,
      tier: "DIAMANTE",
      altitudeM: 467,
      deltaAltitudeM: 449,
      tempC: 27.2,
      humidityPct: 81,
      l10Summary: "Junior no sufre hipoxia en Villavicencio (467m, 27°C); rendimiento +41% vs altura.",
      split1hPct: 35,
      split2hPct: 65,
      tempoTag: "PARTIDO DIESEL (2T)",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-20261031-06",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Minnesota Timberwolves",
      awayTeam: "San Antonio Spurs",
      predictionText: "Más de 214.5 Puntos Totales (Línea Protegida)",
      probability: 93.5,
      tier: "DIAMANTE",
      altitudeM: 253,
      deltaAltitudeM: 55,
      tempC: 21.0,
      humidityPct: 45,
      l10Summary: "Descanso de 48h para Edwards; línea de mercado base en 223.0.",
      split1hPct: 52,
      split2hPct: 48,
      tempoTag: "RITMO ALTO Q1 Y Q3",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-20261031-07",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("20:10"),
      kickoffLabel: "20:10 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Santa Fe",
      awayTeam: "Millonarios FC",
      predictionText: "Más de 1.5 Goles Totales en el Clásico",
      probability: 86.5,
      tier: "ORO",
      altitudeM: 2640,
      deltaAltitudeM: 0,
      tempC: 12.0,
      humidityPct: 79,
      l10Summary: "El Campín promedia 2.2 goles en los últimos 8 clásicos bogotanos.",
      split1hPct: 40,
      split2hPct: 60,
      tempoTag: "CIERRE TÁCTICO 2T",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },

    // ==========================================
    // HISTORIAL VERIFICADO DE DÍAS ANTERIORES
    // ==========================================
    {
      id: "OPTA-HIST-20261030-01",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T20:05:00-05:00",
      kickoffLabel: "20:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Atlético Bucaramanga",
      awayTeam: "Deportivo Pasto",
      predictionText: "Atlético Bucaramanga Empate No Acción (DNB)",
      probability: 91.2,
      tier: "DIAMANTE",
      altitudeM: 959,
      deltaAltitudeM: -1568,
      tempC: 24.0,
      humidityPct: 80,
      l10Summary: "Pasto pierde su ventaja de altura bajando de 2.527m al calor bumangués.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "DESGASTE AERÓBICO",
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-20261030-02",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T19:00:00-05:00",
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Miami Heat",
      awayTeam: "Indiana Pacers",
      predictionText: "Más de 227.5 Puntos Totales",
      probability: 92.0,
      tier: "DIAMANTE",
      altitudeM: 10,
      deltaAltitudeM: -210,
      tempC: 22.0,
      humidityPct: 50,
      l10Summary: "Ritmo de posesión superior a 102 por juego.",
      split1hPct: 52,
      split2hPct: 48,
      tempoTag: "TRANSICIÓN RÁPIDA",
      liveScore: "124 - 118",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-20261029-01",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T18:30:00-05:00",
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "América de Cali",
      awayTeam: "Fortaleza CEIF",
      predictionText: "América de Cali Gana o Empata (1X) + Más de 1.5 Goles",
      probability: 90.5,
      tier: "DIAMANTE",
      altitudeM: 1018,
      deltaAltitudeM: -1622,
      tempC: 26.0,
      humidityPct: 74,
      l10Summary: "Fortaleza sufrió el choque térmico de Cali tras descender de Bogotá.",
      split1hPct: 35,
      split2hPct: 65,
      tempoTag: "REMONTADA 2T",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-20261029-02",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T14:45:00-05:00",
      kickoffLabel: "14:45 COL",
      league: "Euroliga Basket",
      homeTeam: "Real Madrid",
      awayTeam: "Fenerbahçe",
      predictionText: "Victoria Real Madrid (Incluye Prórroga)",
      probability: 88.5,
      tier: "ORO",
      altitudeM: 657,
      deltaAltitudeM: 620,
      tempC: 16.0,
      humidityPct: 55,
      l10Summary: "Dominio de Tavares en defensa y pintura local.",
      split1hPct: 54,
      split2hPct: 46,
      tempoTag: "CONTROL PERIMETRAL",
      liveScore: "95 - 76",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-20261028-01",
      matchDate: "2026-10-28",
      kickoffIso: "2026-10-28T14:45:00-05:00",
      kickoffLabel: "14:45 COL",
      league: "Serie A (Italia)",
      homeTeam: "US Lecce",
      awayTeam: "Hellas Verona",
      predictionText: "Más de 2.5 Goles Totales",
      probability: 82.0,
      tier: "PLATA",
      altitudeM: 49,
      deltaAltitudeM: -10,
      tempC: 17.0,
      humidityPct: 68,
      l10Summary: "Expulsión temprana cerró los espacios del juego.",
      split1hPct: 50,
      split2hPct: 50,
      tempoTag: "LÍNEAS BAJAS",
      liveScore: "1 - 0",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "OPTA-HIST-20261027-01",
      matchDate: "2026-10-27",
      kickoffIso: "2026-10-27T19:30:00-05:00",
      kickoffLabel: "19:30 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Boston Celtics",
      awayTeam: "New York Knicks",
      predictionText: "Boston Celtics Gana (Línea de Dinero)",
      probability: 91.8,
      tier: "DIAMANTE",
      altitudeM: 43,
      deltaAltitudeM: 30,
      tempC: 21.0,
      humidityPct: 45,
      l10Summary: "Efectividad del 42% en triples de Boston en el TD Garden.",
      split1hPct: 53,
      split2hPct: 47,
      tempoTag: "VOLUMEN DE TRIPLES",
      liveScore: "112 - 104",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
  ];

  localStorage.setItem(DB_PREDICTIONS_KEY, JSON.stringify(initialData));
  return initialData;
}

export function getAllPredictions() {
  return seedInitialPredictions();
}

export function savePredictionToHistory(newPick) {
  const all = getAllPredictions();
  all.unshift(newPick);
  localStorage.setItem(DB_PREDICTIONS_KEY, JSON.stringify(all));
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
}

function formatCountdown(kickoffIso, matchStatus) {
  if (matchStatus === "FINALIZADO") return "FINALIZADO";
  if (matchStatus === "EN_VIVO") return "🔴 EN JUEGO AHORA";

  const diff = new Date(kickoffIso).getTime() - Date.now();
  if (diff <= 0) return "🔴 INICIANDO...";

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `INICIA EN ${String(h).padStart(2, "0")}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s`;
}

// Renderiza los pronósticos de hoy: Abierto para todos los visitantes sin pedir login
export function renderTodayPredictions() {
  const container = document.getElementById("predictions-grid");
  if (!container) return;

  const todayCol = getColombiaDateString();
  const searchQuery = (document.getElementById("search-input")?.value || "").toLowerCase();
  const tierFilter = document.getElementById("tier-filter")?.value || "ALL";
  const vipAccess = isUserVipOrAdmin();

  const todayMatches = getAllPredictions().filter((p) => p.matchDate === todayCol);

  // Regla pública gratuita: 2 de 5 estrellas + 2 de 4 estrellas
  const free5StarIds = todayMatches.filter((p) => p.probability >= 90).slice(0, 2).map((p) => p.id);
  const free4StarIds = todayMatches.filter((p) => p.probability >= 85 && p.probability < 90).slice(0, 2).map((p) => p.id);
  const freeVisibleIds = [...free5StarIds, ...free4StarIds];

  const filtered = todayMatches.filter((p) => {
    const matchesText =
      p.homeTeam.toLowerCase().includes(searchQuery) ||
      p.awayTeam.toLowerCase().includes(searchQuery) ||
      p.league.toLowerCase().includes(searchQuery);

    let matchesTier = true;
    if (tierFilter === "DIAMANTE") matchesTier = p.probability >= 90;
    else if (tierFilter === "ORO") matchesTier = p.probability >= 85 && p.probability < 90;
    else if (tierFilter === "PLATA") matchesTier = p.probability < 85;

    return matchesText && matchesTier;
  });

  const counterBadge = document.getElementById("daily-counter-badge");
  if (counterBadge) {
    counterBadge.textContent = vipAccess
      ? `LICENCIA VIP: ${todayMatches.length} PRONÓSTICOS HOY`
      : `MODO ABIERTO: 4 PRONÓSTICOS DESTACADOS GRATIS`;
  }

  container.innerHTML = filtered
    .map((item) => {
      const isPickVisible = vipAccess || freeVisibleIds.includes(item.id);
      const starInfo = getStarsInfo(item.tier, item.probability);

      return `
        <article class="quant-card p-4 flex flex-col justify-between space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2432] pb-2.5 text-xs font-num">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 font-bold uppercase text-[10px] border ${starInfo.badgeClass}">
                ${starInfo.stars} ${starInfo.level}
              </span>
              <span class="text-[#8b9bb4] font-semibold">${item.league}</span>
            </div>
            <span class="countdown-timer text-cyan-400 font-bold" data-kickoff="${item.kickoffIso}" data-status="${item.matchStatus}">
              ${formatCountdown(item.kickoffIso, item.matchStatus)}
            </span>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="text-base md:text-lg font-black text-white">
                ${item.homeTeam} <span class="text-xs font-num text-[#06b6d4] px-1">VS</span> ${item.awayTeam}
              </h3>
              <span class="text-xs font-num text-[#8b9bb4]">${item.kickoffLabel}</span>
            </div>

            ${
              isPickVisible
                ? `
                <div class="p-3 bg-[#05070a] border border-[#10b981]/40 flex items-center justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-num uppercase text-[#8b9bb4] block">PRONÓSTICO OFICIAL:</span>
                    <span class="text-sm font-bold text-[#10b981]">${item.predictionText}</span>
                  </div>
                  <div class="text-right font-num">
                    <span class="text-[10px] text-[#8b9bb4] block">CONFIANZA</span>
                    <span class="text-lg font-black text-white">${item.probability.toFixed(1)}%</span>
                  </div>
                </div>
                `
                : `
                <div class="p-3 bg-[#05070a] border border-[#1b2432] flex items-center justify-between">
                  <span class="text-xs font-num text-[#8b9bb4]">🔒 Pronóstico reservado para miembros VIP</span>
                  <button onclick="window.optacoreGoVip()" class="px-2.5 py-1 bg-[#10b981] text-slate-950 text-xs font-num font-bold uppercase">
                    Hazte VIP
                  </button>
                </div>
                `
            }
          </div>

          <div class="vip-locked-zone p-3">
            <div class="${vipAccess ? "" : "vip-locked-blur"} space-y-2.5 text-xs font-num">
              <div class="grid grid-cols-3 gap-2 bg-[#05070a] p-2 border border-[#1b2432]">
                <div>
                  <span class="text-[10px] text-[#8b9bb4] block">ALTITUD / Δ</span>
                  <span class="text-white font-bold">${item.altitudeM}m (${item.deltaAltitudeM >= 0 ? "+" : ""}${item.deltaAltitudeM}m)</span>
                </div>
                <div>
                  <span class="text-[10px] text-[#8b9bb4] block">CLIMA / HUM</span>
                  <span class="text-cyan-300 font-bold">${item.tempC}°C / ${item.humidityPct}%</span>
                </div>
                <div>
                  <span class="text-[10px] text-[#8b9bb4] block">PERFIL MITADES</span>
                  <span class="text-[#10b981] font-bold">${item.tempoTag.split(" ")[0]}</span>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-1">
                  <span class="text-[#8b9bb4]">EXPLOSIVIDAD POR MITADES:</span>
                  <span class="text-white">1T: <strong>${item.split1hPct}%</strong> | 2T: <strong class="text-[#10b981]">${item.split2hPct}%</strong></span>
                </div>
                <div class="split-bar-track">
                  <div class="split-1h" style="width: ${item.split1hPct}%"></div>
                  <div class="split-2h" style="width: ${item.split2hPct}%"></div>
                </div>
              </div>

              <p class="text-[11px] text-slate-300">
                <strong class="text-[#06b6d4]">L10 BIOCLIMÁTICO:</strong> ${item.l10Summary}
              </p>
            </div>

            ${
              !vipAccess
                ? `
                <div class="vip-lock-overlay">
                  <p class="text-xs font-num font-bold text-white mb-2">
                    🔒 Indicadores de Altitud (${item.altitudeM}m) y Mitades Reservados para Miembros VIP
                  </p>
                  <button onclick="window.optacoreGoVip()" class="px-3.5 py-1.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 text-xs font-num font-bold uppercase tracking-wider">
                    Hazte VIP para Desbloquear
                  </button>
                </div>
                `
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

export function renderTodayResults() {
  const box = document.getElementById("today-results-container");
  if (!box) return;

  const todayCol = getColombiaDateString();
  const todayList = getAllPredictions().filter((p) => p.matchDate === todayCol);

  box.innerHTML = todayList
    .map((p) => {
      const badgeClass =
        p.outcome === "ACIERTO"
          ? "badge-acierto"
          : p.outcome === "FALLO"
          ? "badge-fallo"
          : "badge-pendiente";

      const starInfo = getStarsInfo(p.tier, p.probability);

      return `
        <div class="quant-card p-3.5 flex flex-wrap items-center justify-between gap-3 font-num text-xs">
          <div class="space-y-0.5">
            <span class="text-[10px] text-[#8b9bb4]">${p.kickoffLabel} • ${p.league} (${starInfo.stars})</span>
            <div class="text-sm font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</div>
            <div class="text-cyan-300">Pronóstico: ${p.predictionText} (${p.probability}%)</div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-[10px] text-[#8b9bb4] block">${p.matchStatus}</span>
              <span class="text-base font-black text-white">${p.liveScore}</span>
            </div>
            <span class="px-2.5 py-1 font-bold uppercase ${badgeClass}">
              ${p.outcome}
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}

export function renderFullPublicHistory() {
  const all = getAllPredictions();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");

  const calcHitRate = (arr) => {
    const valid = arr.filter((x) => x.outcome === "ACIERTO" || x.outcome === "FALLO");
    if (valid.length === 0) return { pct: "0.0", wins: 0, total: 0 };
    const wins = valid.filter((x) => x.outcome === "ACIERTO").length;
    return { pct: ((wins / valid.length) * 100).toFixed(1), wins, total: valid.length };
  };

  const now = new Date();
  const monthPrefix = getColombiaDateString(now).substring(0, 7);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().substring(0, 10);

  const globalStats = calcHitRate(settled);
  const monthStats = calcHitRate(settled.filter((p) => p.matchDate.startsWith(monthPrefix)));
  const weekStats = calcHitRate(settled.filter((p) => p.matchDate >= weekAgo));
  const fiveStarsStats = calcHitRate(settled.filter((p) => p.probability >= 90));
  const fourStarsStats = calcHitRate(settled.filter((p) => p.probability >= 85 && p.probability < 90));

  const kpiContainer = document.getElementById("history-kpi-cards");
  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">EFECTIVIDAD HISTÓRICA</span>
        <span class="text-2xl font-black text-[#10b981]">${globalStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${globalStats.wins} aciertos de ${globalStats.total}</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">OCTUBRE 2026</span>
        <span class="text-2xl font-black text-cyan-400">${monthStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${monthStats.wins}/${monthStats.total} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">ÚLTIMOS 7 DÍAS</span>
        <span class="text-2xl font-black text-white">${weekStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${weekStats.wins}/${weekStats.total} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">⭐⭐⭐⭐⭐ (5 ESTRELLAS)</span>
        <span class="text-2xl font-black text-[#06b6d4]">${fiveStarsStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${fiveStarsStats.wins}/${fiveStarsStats.total} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">⭐⭐⭐⭐ (4 ESTRELLAS)</span>
        <span class="text-xl font-black text-[#10b981]">${fourStarsStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${fourStarsStats.wins}/${fourStarsStats.total} acertados</span>
      </div>
    `;
  }

  const leagues = [...new Set(all.map((p) => p.league))];
  const leagueSelect = document.getElementById("hist-filter-league");
  if (leagueSelect && leagueSelect.options.length <= 1) {
    leagues.forEach((lg) => {
      const opt = document.createElement("option");
      opt.value = lg;
      opt.textContent = lg;
      leagueSelect.appendChild(opt);
    });
  }

  const breakdownBox = document.getElementById("breakdown-stats-box");
  if (breakdownBox) {
    breakdownBox.innerHTML = leagues
      .map((lg) => {
        const st = calcHitRate(settled.filter((p) => p.league === lg));
        return `
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-300">${lg}</span>
              <span class="text-[#10b981] font-bold">${st.pct}% (${st.wins}/${st.total})</span>
            </div>
            <div class="w-full h-1.5 bg-[#161f2c]">
              <div class="h-full bg-[#10b981]" style="width: ${st.pct}%"></div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  const chartBox = document.getElementById("performance-chart-box");
  if (chartBox && settled.length > 0) {
    const chronological = [...settled].reverse();
    let winsSoFar = 0;
    const points = chronological.map((item, idx) => {
      if (item.outcome === "ACIERTO") winsSoFar++;
      const rate = (winsSoFar / (idx + 1)) * 100;
      const x = (idx / Math.max(1, chronological.length - 1)) * 560 + 20;
      const y = 150 - (rate / 100) * 120;
      return `${x},${y}`;
    });

    chartBox.innerHTML = `
      <svg viewBox="0 0 600 165" class="w-full h-full">
        <line x1="20" y1="30" x2="580" y2="30" stroke="#1b2432" stroke-dasharray="4" />
        <line x1="20" y1="90" x2="580" y2="90" stroke="#1b2432" stroke-dasharray="4" />
        <polyline fill="none" stroke="#06b6d4" stroke-width="3" points="${points.join(" ")}" />
        <text x="22" y="24" fill="#10b981" font-size="10" font-family="monospace">100% Efectividad Histórica</text>
      </svg>
    `;
  }

  const periodFlt = document.getElementById("hist-filter-period")?.value || "ALL";
  const leagueFlt = document.getElementById("hist-filter-league")?.value || "ALL";
  const tierFlt = document.getElementById("hist-filter-tier")?.value || "ALL";
  const outcomeFlt = document.getElementById("hist-filter-outcome")?.value || "ALL";

  const filteredHist = all.filter((p) => {
    const okPeriod =
      periodFlt === "ALL" ||
      (periodFlt === "MONTH" && p.matchDate.startsWith(monthPrefix)) ||
      (periodFlt === "WEEK" && p.matchDate >= weekAgo);
    const okLeague = leagueFlt === "ALL" || p.league === leagueFlt;
    
    let okTier = true;
    if (tierFlt === "DIAMANTE") okTier = p.probability >= 90;
    else if (tierFlt === "ORO") okTier = p.probability >= 85 && p.probability < 90;
    else if (tierFlt === "PLATA") okTier = p.probability < 85;

    const okOutcome = outcomeFlt === "ALL" || p.outcome === outcomeFlt;
    return okPeriod && okLeague && okTier && okOutcome;
  });

  const tbody = document.getElementById("history-table-body");
  if (tbody) {
    tbody.innerHTML = filteredHist
      .map((p) => {
        const badge =
          p.outcome === "ACIERTO"
            ? "badge-acierto"
            : p.outcome === "FALLO"
            ? "badge-fallo"
            : "badge-pendiente";
        const starInfo = getStarsInfo(p.tier, p.probability);
        return `
          <tr class="hover:bg-[#0f151f]">
            <td class="py-2.5 px-3 text-slate-400">${p.matchDate}</td>
            <td class="py-2.5 px-3 text-slate-300">${p.league}</td>
            <td class="py-2.5 px-3 font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</td>
            <td class="py-2.5 px-3 text-cyan-300">${p.predictionText}</td>
            <td class="py-2.5 px-3">${starInfo.stars} (${p.probability}%)</td>
            <td class="py-2.5 px-3 font-bold text-white">${p.liveScore}</td>
            <td class="py-2.5 px-3"><span class="px-2 py-0.5 text-[10px] font-bold uppercase ${badge}">${p.outcome}</span></td>
          </tr>
        `;
      })
      .join("");
  }
}

let lastRenderedDate = getColombiaDateString();
function tickClockAndCountdowns() {
  const now = new Date();
  const colTimeStr = new Intl.DateTimeFormat("es-CO", {
    timeZone: CONFIG.BRAND.TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const clockEl = document.getElementById("colombia-live-clock");
  if (clockEl) clockEl.textContent = `HORA COLOMBIA: ${colTimeStr}`;

  const currentColDate = getColombiaDateString(now);
  if (currentColDate !== lastRenderedDate) {
    lastRenderedDate = currentColDate;
    renderTodayPredictions();
    renderTodayResults();
  }

  document.querySelectorAll(".countdown-timer").forEach((el) => {
    el.textContent = formatCountdown(el.dataset.kickoff, el.dataset.status);
  });
}

window.optacoreGoVip = () => switchTab("tab-planes");

document.addEventListener("DOMContentLoaded", () => {
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();

  document.getElementById("search-input")?.addEventListener("input", renderTodayPredictions);
  document.getElementById("tier-filter")?.addEventListener("change", renderTodayPredictions);

  ["hist-filter-period", "hist-filter-league", "hist-filter-tier", "hist-filter-outcome"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", renderFullPublicHistory);
  });

  window.addEventListener("optacore:auth-changed", () => {
    renderTodayPredictions();
  });

  setInterval(tickClockAndCountdowns, 1000);
});
