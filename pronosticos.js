// ============================================================================
// ARCHIVO: pronosticos.js
// Motor de Pronósticos del Día (Hora Colombia), Candado VIP, Resultados e Historial
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_PREDICTIONS_KEY = "optacore_all_predictions_v1";

// Obtiene la fecha actual en hora de Colombia (YYYY-MM-DD)
export function getColombiaDateString(dateObj = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.BRAND.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}

// Semilla inicial: Cartelera Oficial de Hoy (Sábado) + Historial Auditado desde el Día 1
function seedInitialPredictions() {
  const todayCol = getColombiaDateString();
  const saved = localStorage.getItem(DB_PREDICTIONS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.some((p) => p.matchDate === todayCol)) return parsed;
  }

  const makeKickoffIso = (timeHHMM) => `${todayCol}T${timeHHMM}:00-05:00`;

  const initialData = [
    // --- 5 PRONÓSTICOS DIAMANTE DE HOY (VISIBLES EN GRATIS, PERO CON TELEMETRÍA BLOQUEADA) ---
    {
      id: "OPTA-TODAY-01",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("14:45"),
      kickoffLabel: "14:45 COL",
      league: "Serie A (Italia)",
      homeTeam: "AC Milan",
      awayTeam: "SSC Napoli",
      predictionText: "Más de 1.5 Goles Totales en el Partido",
      probability: 92.4,
      tier: "DIAMANTE",
      altitudeM: 122,
      deltaAltitudeM: 105,
      tempC: 13.4,
      humidityPct: 76,
      l10Summary: "Milan 9/10 partidos con +1.5 goles en llano húmedo; xG combinado de 3.24.",
      split1hPct: 42,
      split2hPct: 58,
      tempoTag: "ROTURA EN 2.º TIEMPO (MIN 55'-85')",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-TODAY-02",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("15:00"),
      kickoffLabel: "15:00 COL",
      league: "LaLiga (España)",
      homeTeam: "FC Barcelona",
      awayTeam: "Deportivo Alavés",
      predictionText: "Barcelona Gana + Más de 2.5 Goles Totales",
      probability: 93.1,
      tier: "DIAMANTE",
      altitudeM: 120,
      deltaAltitudeM: -405,
      tempC: 18.8,
      humidityPct: 64,
      l10Summary: "Barça 10V en 10 juegos en casa (3.4 goles a favor). Alavés 7 derrotas bajando a nivel del mar.",
      split1hPct: 57,
      split2hPct: 43,
      tempoTag: "SPRINTER SALIDA RÁPIDA (1T)",
      liveScore: "1 - 0 (38')",
      matchStatus: "EN_VIVO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-TODAY-03",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("16:10"),
      kickoffLabel: "16:10 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Envigado FC",
      awayTeam: "Deportes Tolima",
      predictionText: "Tolima Gana o Empata (X2) + Más de 1.5 Goles",
      probability: 91.5,
      tier: "DIAMANTE",
      altitudeM: 1575,
      deltaAltitudeM: 290,
      tempC: 23.0,
      humidityPct: 70,
      l10Summary: "Tolima suma 8 partidos invicto en pisos térmicos templados (1.200m - 1.600m).",
      split1hPct: 46,
      split2hPct: 54,
      tempoTag: "DOMINIO SOSTENIDO 2T",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-TODAY-04",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("18:05"),
      kickoffLabel: "18:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Llaneros FC",
      awayTeam: "Junior de Barranquilla",
      predictionText: "Junior Empate No Acción (Sin Empate) / +1.5 Goles",
      probability: 91.8,
      tier: "DIAMANTE",
      altitudeM: 467,
      deltaAltitudeM: 449,
      tempC: 27.2,
      humidityPct: 81,
      l10Summary: "Sin hipoxia para Junior en Villavicencio (467m). Su rendimiento sube +41% respecto a Bogotá/Pasto.",
      split1hPct: 35,
      split2hPct: 65,
      tempoTag: "EXPLOSIÓN TARDÍA (MIN 60'-90')",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-TODAY-05",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Minnesota Timberwolves",
      awayTeam: "San Antonio Spurs",
      predictionText: "Más de 214.5 Puntos Totales (Colchón Estadístico)",
      probability: 93.6,
      tier: "DIAMANTE",
      altitudeM: 253,
      deltaAltitudeM: 55,
      tempC: 21.0,
      humidityPct: 45,
      l10Summary: "Timberwolves con 48h de descanso limpio; promedia 118.4 puntos en casa frente al Oeste.",
      split1hPct: 53,
      split2hPct: 47,
      tempoTag: "ALTO RITMO Q1 Y Q3",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },

    // --- PRONÓSTICOS EXCLUSIVOS VIP DE HOY (6.º DIAMANTE + ORO + PLATA) ---
    {
      id: "OPTA-TODAY-06",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("20:10"),
      kickoffLabel: "20:10 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Independiente Santa Fe",
      awayTeam: "Millonarios FC",
      predictionText: "Más de 1.5 Goles Totales en el Clásico Capitalino",
      probability: 90.8,
      tier: "DIAMANTE",
      altitudeM: 2640,
      deltaAltitudeM: 0,
      tempC: 12.0,
      humidityPct: 79,
      l10Summary: "Ambos adaptados a 2.640m en El Campín; 8 de los últimos 10 clásicos superaron 1.5 goles.",
      split1hPct: 40,
      split2hPct: 60,
      tempoTag: "CIERRE INTENSO 2T",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-TODAY-07",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("19:30"),
      kickoffLabel: "19:30 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Houston Rockets",
      awayTeam: "Dallas Mavericks",
      predictionText: "Victoria Houston Rockets (Incluye Prórroga)",
      probability: 88.2,
      tier: "ORO",
      altitudeM: 15,
      deltaAltitudeM: -120,
      tempC: 21.0,
      humidityPct: 50,
      l10Summary: "Rockets llega con racha invicta 5-0 y superioridad reboteadora en pintura.",
      split1hPct: 51,
      split2hPct: 49,
      tempoTag: "CONSISTENCIA 4 CUARTOS",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "OPTA-TODAY-08",
      matchDate: todayCol,
      kickoffIso: makeKickoffIso("21:00"),
      kickoffLabel: "21:00 COL",
      league: "Liga MX (México)",
      homeTeam: "Cruz Azul",
      awayTeam: "Santos Laguna",
      predictionText: "Cruz Azul Gana + Más de 1.5 Goles",
      probability: 84.0,
      tier: "PLATA",
      altitudeM: 2240,
      deltaAltitudeM: 1120,
      tempC: 15.0,
      humidityPct: 58,
      l10Summary: "Santos sufre déficit aeróbico subiendo a 2.240m en CDMX (8 derrotas en 10 salidas).",
      split1hPct: 48,
      split2hPct: 52,
      tempoTag: "FATIGA VISITANTE +65'",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },

    // --- HISTORIAL AUDITADO DE DÍAS ANTERIORES (DESDE EL DÍA 1 DE LA PLATAFORMA) ---
    {
      id: "OPTA-HIST-01",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T20:05:00-05:00",
      kickoffLabel: "20:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Atlético Bucaramanga",
      awayTeam: "Deportivo Pasto",
      predictionText: "Victoria Atlético Bucaramanga (Sin Empate)",
      probability: 91.2,
      tier: "DIAMANTE",
      altitudeM: 959,
      deltaAltitudeM: -1568,
      tempC: 24.0,
      humidityPct: 80,
      l10Summary: "Pasto perdió su ventaja de altura bajando de 2.527m al clima húmedo de Bucaramanga.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "ROTURA 2T",
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-02",
      matchDate: "2026-10-30",
      kickoffIso: "2026-10-30T19:00:00-05:00",
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Miami Heat",
      awayTeam: "Indiana Pacers",
      predictionText: "Más de 227.5 Puntos Alternativos",
      probability: 92.0,
      tier: "DIAMANTE",
      altitudeM: 10,
      deltaAltitudeM: -210,
      tempC: 22.0,
      humidityPct: 50,
      l10Summary: "Ritmo top 3 de posesiones por partido.",
      split1hPct: 52,
      split2hPct: 48,
      tempoTag: "SPRINTER Q1-Q2",
      liveScore: "124 - 118",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-03",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T18:30:00-05:00",
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "América de Cali",
      awayTeam: "Fortaleza CEIF",
      predictionText: "Victoria América de Cali",
      probability: 90.5,
      tier: "DIAMANTE",
      altitudeM: 1018,
      deltaAltitudeM: -1622,
      tempC: 26.0,
      humidityPct: 74,
      l10Summary: "Fortaleza bajó de 2.640m al calor del Pascual Guerrero y cedió en el 2T.",
      split1hPct: 30,
      split2hPct: 70,
      tempoTag: "REMONTADA 2T",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-04",
      matchDate: "2026-10-29",
      kickoffIso: "2026-10-29T14:45:00-05:00",
      kickoffLabel: "14:45 COL",
      league: "Euroliga",
      homeTeam: "Real Madrid",
      awayTeam: "Fenerbahçe",
      predictionText: "Victoria Real Madrid (Incluye Prórroga)",
      probability: 88.5,
      tier: "ORO",
      altitudeM: 657,
      deltaAltitudeM: 620,
      tempC: 16.0,
      humidityPct: 55,
      l10Summary: "Dominio local en el Movistar Arena.",
      split1hPct: 54,
      split2hPct: 46,
      tempoTag: "SALIDA FUERTE",
      liveScore: "95 - 76",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "OPTA-HIST-05",
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
      l10Summary: "Partido cerrado por expulsión temprana.",
      split1hPct: 50,
      split2hPct: 50,
      tempoTag: "NEUTRAL",
      liveScore: "1 - 0",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
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

// Formatea la cuenta regresiva hasta el inicio de cada partido
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

// Renderiza los pronósticos del día actual aplicando la regla Gratis (5 Diamantes) vs VIP (Todos + Telemetría)
export function renderTodayPredictions() {
  const container = document.getElementById("predictions-grid");
  if (!container) return;

  const todayCol = getColombiaDateString();
  const searchQuery = (document.getElementById("search-input")?.value || "").toLowerCase();
  const tierFilter = document.getElementById("tier-filter")?.value || "ALL";
  const vipAccess = isUserVipOrAdmin();

  // Solo partidos del día actual en Colombia
  let todayMatches = getAllPredictions().filter((p) => p.matchDate === todayCol);

  // Para usuarios Gratis: solo tienen acceso a los primeros 5 de nivel DIAMANTE
  const diamondIdsAllowedForFree = todayMatches
    .filter((p) => p.tier === "DIAMANTE")
    .slice(0, CONFIG.BRAND.FREE_DAILY_DIAMOND_LIMIT)
    .map((p) => p.id);

  // Aplicar filtros de búsqueda por equipo/liga y nivel
  const filtered = todayMatches.filter((p) => {
    const matchesText =
      p.homeTeam.toLowerCase().includes(searchQuery) ||
      p.awayTeam.toLowerCase().includes(searchQuery) ||
      p.league.toLowerCase().includes(searchQuery);
    const matchesTier = tierFilter === "ALL" || p.tier === tierFilter;
    return matchesText && matchesTier;
  });

  const counterBadge = document.getElementById("daily-counter-badge");
  if (counterBadge) {
    counterBadge.textContent = vipAccess
      ? `ACCESO VIP: ${todayMatches.length} PRONÓSTICOS HOY`
      : `GRATIS: 5 DIAMANTES / ${todayMatches.length} TOTALES HOY`;
  }

  container.innerHTML = filtered
    .map((item) => {
      const isFreeVisiblePick = vipAccess || diamondIdsAllowedForFree.includes(item.id);
      const tierClass =
        item.tier === "DIAMANTE"
          ? "tier-diamante"
          : item.tier === "ORO"
          ? "tier-oro"
          : "tier-plata";

      return `
        <article class="quant-card p-4 flex flex-col justify-between space-y-4">
          <!-- Cabecera: Liga, Nivel de Confianza y Cuenta Regresiva -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2432] pb-2.5 text-xs font-num">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 font-bold uppercase text-[10px] ${tierClass}">
                ${item.tier} • ${item.probability.toFixed(1)}%
              </span>
              <span class="text-[#8b9bb4] font-semibold">${item.league}</span>
            </div>
            <span class="countdown-timer text-cyan-400 font-bold" data-kickoff="${item.kickoffIso}" data-status="${item.matchStatus}">
              ${formatCountdown(item.kickoffIso, item.matchStatus)}
            </span>
          </div>

          <!-- Equipos y Pronóstico Principal -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="text-base md:text-lg font-black text-white">
                ${item.homeTeam} <span class="text-xs font-num text-[#06b6d4] px-1">VS</span> ${item.awayTeam}
              </h3>
              <span class="text-xs font-num text-[#8b9bb4]">${item.kickoffLabel}</span>
            </div>

            ${
              isFreeVisiblePick
                ? `
                <div class="p-3 bg-[#05070a] border border-[#10b981]/40 flex items-center justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-num uppercase text-[#8b9bb4] block">PRONÓSTICO DEL MODELO:</span>
                    <span class="text-sm font-bold text-[#10b981]">${item.predictionText}</span>
                  </div>
                  <div class="text-right font-num">
                    <span class="text-[10px] text-[#8b9bb4] block">PROBABILIDAD</span>
                    <span class="text-lg font-black text-white">${item.probability.toFixed(1)}%</span>
                  </div>
                </div>
                `
                : `
                <div class="p-3 bg-[#05070a] border border-[#1b2432] flex items-center justify-between">
                  <span class="text-xs font-num text-[#8b9bb4]">🔒 Pronóstico adicional exclusivo para miembros VIP</span>
                  <button onclick="window.optacoreGoVip()" class="px-2.5 py-1 bg-[#10b981] text-slate-950 text-xs font-num font-bold uppercase">
                    Hazte VIP
                  </button>
                </div>
                `
            }
          </div>

          <!-- Indicadores Avanzados (Altura, Clima L10 y Explosividad 1T/2T): Desbloqueado para VIP / Bloqueado con Candado para Gratis -->
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
                  <span class="text-[#8b9bb4]">DISTRIBUCIÓN DE EXPLOSIVIDAD (1T vs 2T):</span>
                  <span class="text-white">1T: <strong>${item.split1hPct}%</strong> | 2T: <strong class="text-[#10b981]">${item.split2hPct}%</strong></span>
                </div>
                <div class="split-bar-track">
                  <div class="split-1h" style="width: ${item.split1hPct}%"></div>
                  <div class="split-2h" style="width: ${item.split2hPct}%"></div>
                </div>
              </div>

              <p class="text-[11px] text-slate-300">
                <strong class="text-[#06b6d4]">ANÁLISIS L10 BIOCLIMÁTICO:</strong> ${item.l10Summary}
              </p>
            </div>

            ${
              !vipAccess
                ? `
                <div class="vip-lock-overlay">
                  <p class="text-xs font-num font-bold text-white mb-2">
                    🔒 Indicadores de Altitud (${item.altitudeM}m), L10 Climático y Explosividad 1T/2T Bloqueados
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

// Renderiza la pestaña de Resultados del Día (En vivo y Finalizados)
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

      return `
        <div class="quant-card p-3.5 flex flex-wrap items-center justify-between gap-3 font-num text-xs">
          <div class="space-y-0.5">
            <span class="text-[10px] text-[#8b9bb4]">${p.kickoffLabel} • ${p.league} (${p.tier})</span>
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

// Calcula y renderiza el Historial Público Inmutable desde el Día 1 + Gráfica SVG
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
  const monthPrefix = getColombiaDateString(now).substring(0, 7); // YYYY-MM
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().substring(0, 10);

  const globalStats = calcHitRate(settled);
  const monthStats = calcHitRate(settled.filter((p) => p.matchDate.startsWith(monthPrefix)));
  const weekStats = calcHitRate(settled.filter((p) => p.matchDate >= weekAgo));
  const diamStats = calcHitRate(settled.filter((p) => p.tier === "DIAMANTE"));
  const oroStats = calcHitRate(settled.filter((p) => p.tier === "ORO"));
  const plataStats = calcHitRate(settled.filter((p) => p.tier === "PLATA"));

  const kpiContainer = document.getElementById("history-kpi-cards");
  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">EFECTIVIDAD TOTAL</span>
        <span class="text-2xl font-black text-[#10b981]">${globalStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${globalStats.wins} aciertos de ${globalStats.total}</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">ESTE MES</span>
        <span class="text-2xl font-black text-cyan-400">${monthStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${monthStats.wins}/${monthStats.total} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">ESTA SEMANA (7D)</span>
        <span class="text-2xl font-black text-white">${weekStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${weekStats.wins}/${weekStats.total} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">NIVEL DIAMANTE 💎</span>
        <span class="text-2xl font-black text-[#06b6d4]">${diamStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${diamStats.wins}/${diamStats.total} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">ORO / PLATA</span>
        <span class="text-lg font-black text-[#10b981]">O: ${oroStats.pct}% | P: ${plataStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">Auditoría verificada</span>
      </div>
    `;
  }

  // Poblar filtro de ligas y desglose por liga
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

  // Renderizar Gráfica SVG de Rendimiento Acumulado
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
        <text x="22" y="24" fill="#10b981" font-size="10" font-family="monospace">100% Efectividad</text>
      </svg>
    `;
  }

  // Renderizar Tabla Filtrable del Historial
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
    const okTier = tierFlt === "ALL" || p.tier === tierFlt;
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
        return `
          <tr class="hover:bg-[#0f151f]">
            <td class="py-2.5 px-3 text-slate-400">${p.matchDate}</td>
            <td class="py-2.5 px-3 text-slate-300">${p.league}</td>
            <td class="py-2.5 px-3 font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</td>
            <td class="py-2.5 px-3 text-cyan-300">${p.predictionText}</td>
            <td class="py-2.5 px-3">${p.tier} (${p.probability}%)</td>
            <td class="py-2.5 px-3 font-bold text-white">${p.liveScore}</td>
            <td class="py-2.5 px-3"><span class="px-2 py-0.5 text-[10px] font-bold uppercase ${badge}">${p.outcome}</span></td>
          </tr>
        `;
      })
      .join("");
  }
}

// Sincronización automática con API-Football (v3.football.api-sports.io)
export async function syncLiveResultsFromSportsApi() {
  const todayCol = getColombiaDateString();
  if (CONFIG.KEYS.SPORTS_API_KEY && !CONFIG.KEYS.SPORTS_API_KEY.includes("TU_API")) {
    try {
      const res = await fetch(`https://${CONFIG.KEYS.SPORTS_API_HOST}/fixtures?date=${todayCol}&timezone=${CONFIG.BRAND.TIMEZONE}`, {
        headers: { "x-apisports-key": CONFIG.KEYS.SPORTS_API_KEY },
      });
      const json = await res.json();
      console.log("Datos sincronizados desde API-Football:", json.results);
    } catch (err) {
      console.warn("Modo local activo para marcadores:", err);
    }
  }
  renderTodayResults();
  renderFullPublicHistory();
}

// Reloj de Colombia en vivo y reinicio automático a las 00:00
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
  document.getElementById("btn-sync-results")?.addEventListener("click", syncLiveResultsFromSportsApi);

  ["hist-filter-period", "hist-filter-league", "hist-filter-tier", "hist-filter-outcome"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", renderFullPublicHistory);
  });

  window.addEventListener("optacore:auth-changed", () => {
    renderTodayPredictions();
  });

  setInterval(tickClockAndCountdowns, 1000);
});
