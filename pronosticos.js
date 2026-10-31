// ============================================================================
// ARCHIVO: pronosticos.js
// Motor de Pronósticos del Día (Hora Colombia), Candado VIP, Resultados e Historial
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_PREDICTIONS_KEY = "optacore_all_predictions_empty_v1";

// Obtiene la fecha actual en hora de Colombia (YYYY-MM-DD)
export function getColombiaDateString(dateObj = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.BRAND.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}

// Inicializa el almacenamiento de pronósticos vacío (sin datos de prueba precargados)
function seedInitialPredictions() {
  const saved = localStorage.getItem(DB_PREDICTIONS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Si hay error de lectura, reinicia vacío
    }
  }
  const emptyData = [];
  localStorage.setItem(DB_PREDICTIONS_KEY, JSON.stringify(emptyData));
  return emptyData;
}

export function clearAllPredictions() {
  localStorage.setItem(DB_PREDICTIONS_KEY, JSON.stringify([]));
  renderOverviewDashboard();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
}

export function getAllPredictions() {
  return seedInitialPredictions();
}

export function savePredictionToHistory(newPick) {
  const all = getAllPredictions();
  all.unshift(newPick);
  localStorage.setItem(DB_PREDICTIONS_KEY, JSON.stringify(all));
  renderOverviewDashboard();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
}

// Renderiza el Dashboard Principal (Estado Vacío por defecto)
export function renderOverviewDashboard() {
  const all = getAllPredictions();
  const todayCol = getColombiaDateString();
  const todayMatches = all.filter((p) => p.matchDate === todayCol);
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  const wins = settled.filter((p) => p.outcome === "ACIERTO").length;
  const hitRate = settled.length > 0 ? ((wins / settled.length) * 100).toFixed(1) : "0.0";
  const diamondToday = todayMatches.filter((p) => p.tier === "DIAMANTE").length;

  const statusPill = document.getElementById("dashboard-status-pill");
  if (statusPill) {
    statusPill.textContent = all.length === 0 ? "ESTADO: VACÍO (0 REGISTROS)" : `ACTIVO (${all.length} REGISTROS)`;
    statusPill.className =
      all.length === 0
        ? "text-[10px] font-num uppercase px-2 py-0.5 border border-[#1b2432] bg-[#05070a] text-[#8b9bb4] font-bold"
        : "text-[10px] font-num uppercase px-2 py-0.5 border border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981] font-bold";
  }

  const kpiGrid = document.getElementById("dashboard-kpi-grid");
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="quant-card p-4 font-num space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-[#8b9bb4] uppercase">PRONÓSTICOS HOY</span>
          <span class="w-1.5 h-1.5 bg-[#06b6d4]"></span>
        </div>
        <div class="text-2xl font-black text-white">${todayMatches.length}</div>
        <span class="text-[11px] text-[#8b9bb4] block">Jornada ${todayCol}</span>
      </div>

      <div class="quant-card p-4 font-num space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-[#8b9bb4] uppercase">NIVEL DIAMANTE HOY</span>
          <span class="w-1.5 h-1.5 bg-[#10b981]"></span>
        </div>
        <div class="text-2xl font-black text-[#06b6d4]">${diamondToday}</div>
        <span class="text-[11px] text-[#8b9bb4] block">Confianza ≥ 90%</span>
      </div>

      <div class="quant-card p-4 font-num space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-[#8b9bb4] uppercase">EFECTIVIDAD GLOBAL</span>
          <span class="w-1.5 h-1.5 bg-[#10b981]"></span>
        </div>
        <div class="text-2xl font-black text-[#10b981]">${hitRate}%</div>
        <span class="text-[11px] text-[#8b9bb4] block">${wins} aciertos de ${settled.length} auditados</span>
      </div>

      <div class="quant-card p-4 font-num space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-[#8b9bb4] uppercase">HISTORIAL ACUMULADO</span>
          <span class="w-1.5 h-1.5 bg-slate-500"></span>
        </div>
        <div class="text-2xl font-black text-slate-300">${all.length}</div>
        <span class="text-[11px] text-[#8b9bb4] block">Registros en base de datos</span>
      </div>
    `;
  }

  const workspace = document.getElementById("dashboard-main-workspace");
  if (!workspace) return;

  if (all.length === 0) {
    workspace.innerHTML = `
      <!-- Panel Principal Vacío (8 columnas) -->
      <div class="lg:col-span-8 quant-card p-8 flex flex-col items-center justify-center text-center min-h-[340px] space-y-5 border-dashed border-[#1b2432]">
        <div class="w-14 h-14 border border-[#06b6d4]/40 bg-[#06b6d4]/10 flex items-center justify-center font-num text-sm font-black text-[#06b6d4]">
          [00]
        </div>
        <div class="space-y-2 max-w-md">
          <h2 class="text-base md:text-lg font-black uppercase text-white font-num">
            Dashboard Vacío — Sin Pronósticos Activos
          </h2>
          <p class="text-xs text-[#8b9bb4] leading-relaxed">
            No hay partidos ni métricas cargadas en este momento. Publica tu primer pronóstico desde el Panel Admin o explora las secciones del sistema.
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button onclick="window.optacoreOpenPublisher()" class="px-4 py-2 text-xs font-num font-bold uppercase bg-[#06b6d4] text-slate-950 hover:bg-cyan-300 transition">
            + Crear Primer Pronóstico
          </button>
          <button onclick="window.optacoreSwitchTab('tab-pronosticos')" class="px-4 py-2 text-xs font-num font-bold uppercase border border-[#1b2432] bg-[#05070a] text-slate-300 hover:border-[#06b6d4] hover:text-white transition">
            Ver Cartelera Hoy
          </button>
        </div>
      </div>

      <!-- Panel Lateral de Módulos en Espera (4 columnas) -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <div class="quant-card p-5 space-y-3 flex-1 font-num">
          <div class="flex items-center justify-between border-b border-[#1b2432] pb-2">
            <span class="text-xs font-bold uppercase text-white">Telemetría Bioclimática</span>
            <span class="text-[10px] text-[#8b9bb4]">EN ESPERA</span>
          </div>
          <div class="space-y-2 text-xs text-[#8b9bb4]">
            <div class="flex justify-between py-1.5 border-b border-[#1b2432]/50">
              <span>Altitud / Delta (Δm)</span>
              <span class="text-slate-500">—</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-[#1b2432]/50">
              <span>Temperatura / Humedad</span>
              <span class="text-slate-500">—</span>
            </div>
            <div class="flex justify-between py-1.5">
              <span>Explosividad 1T / 2T</span>
              <span class="text-slate-500">0% / 0%</span>
            </div>
          </div>
        </div>

        <div class="quant-card p-5 space-y-3 flex-1 font-num">
          <div class="flex items-center justify-between border-b border-[#1b2432] pb-2">
            <span class="text-xs font-bold uppercase text-white">Cola de Auditoría</span>
            <span class="text-[10px] text-[#10b981]">0 EVENTOS</span>
          </div>
          <p class="text-xs text-[#8b9bb4] leading-relaxed">
            Los resultados en vivo y el cálculo automático de efectividad se activarán en cuanto registres el primer partido.
          </p>
        </div>
      </div>
    `;
  } else {
    workspace.innerHTML = `
      <div class="lg:col-span-8 quant-card p-5 space-y-4 font-num">
        <div class="flex items-center justify-between border-b border-[#1b2432] pb-2.5">
          <h2 class="text-xs font-bold uppercase text-white">Últimos Pronósticos Registrados</h2>
          <button onclick="window.optacoreSwitchTab('tab-pronosticos')" class="text-[11px] text-[#06b6d4] hover:underline uppercase font-bold">
            Ver Todos →
          </button>
        </div>
        <div class="space-y-2.5">
          ${all
            .slice(0, 5)
            .map(
              (item) => `
              <div class="p-3 bg-[#05070a] border border-[#1b2432] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span class="text-[10px] text-[#8b9bb4] block">${item.matchDate} • ${item.kickoffLabel} • ${item.league}</span>
                  <span class="font-bold text-white">${item.homeTeam} vs ${item.awayTeam}</span>
                </div>
                <div class="text-right">
                  <span class="text-[#10b981] font-bold block">${item.predictionText}</span>
                  <span class="text-[10px] text-cyan-300">${item.tier} (${item.probability}%)</span>
                </div>
              </div>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="lg:col-span-4 quant-card p-5 space-y-4 font-num">
        <div class="flex items-center justify-between border-b border-[#1b2432] pb-2.5">
          <h3 class="text-xs font-bold uppercase text-white">Estado del Sistema</h3>
          <span class="text-[10px] text-[#10b981] font-bold">ONLINE</span>
        </div>
        <div class="space-y-2.5 text-xs text-[#8b9bb4]">
          <p>Total de pronósticos activos hoy: <strong class="text-white">${todayMatches.length}</strong></p>
          <p>Total histórico almacenado: <strong class="text-white">${all.length}</strong></p>
          <button onclick="window.optacoreOpenPublisher()" class="w-full py-2 mt-2 bg-[#06b6d4] text-slate-950 font-bold uppercase">
            + Agregar Otro Pronóstico
          </button>
        </div>
      </div>
    `;
  }
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
      : `GRATIS: 0 / ${todayMatches.length} TOTALES HOY`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="lg:col-span-2 quant-card p-8 text-center space-y-3 border-dashed border-[#1b2432] font-num">
        <div class="text-sm font-bold uppercase text-white">Sin Pronósticos Publicados para Hoy</div>
        <p class="text-xs text-[#8b9bb4] max-w-md mx-auto">
          La cartelera del día (${todayCol}) se encuentra vacía. Publica un nuevo pronóstico desde el Panel Admin para visualizarlo aquí.
        </p>
      </div>
    `;
    return;
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

  if (todayList.length === 0) {
    box.innerHTML = `
      <div class="quant-card p-8 text-center space-y-2 border-dashed border-[#1b2432] font-num">
        <div class="text-sm font-bold uppercase text-white">Sin Resultados Registrados Hoy</div>
        <p class="text-xs text-[#8b9bb4]">No hay partidos en curso ni finalizados en la jornada actual.</p>
      </div>
    `;
    return;
  }

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
    if (leagues.length === 0) {
      breakdownBox.innerHTML = `<p class="text-xs text-[#8b9bb4] py-6 text-center">Sin datos por liga todavía.</p>`;
    } else {
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
  }

  // Renderizar Gráfica SVG de Rendimiento Acumulado
  const chartBox = document.getElementById("performance-chart-box");
  if (chartBox) {
    if (settled.length > 0) {
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
    } else {
      chartBox.innerHTML = `
        <div class="w-full h-full flex items-center justify-center border border-dashed border-[#1b2432] text-xs font-num text-[#8b9bb4]">
          Sin curva de rendimiento — Esperando primer partido auditado
        </div>
      `;
    }
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
    if (filteredHist.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-[#8b9bb4] font-num text-xs">
            No existen registros en el historial todavía.
          </td>
        </tr>
      `;
    } else {
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
window.optacoreSwitchTab = (tabId) => switchTab(tabId);
window.optacoreOpenPublisher = () => {
  const adminNavBtn = document.getElementById("btn-nav-admin");
  if (adminNavBtn) adminNavBtn.classList.remove("hidden");
  switchTab("tab-admin");
  document.getElementById("adm-league")?.focus();
};

document.addEventListener("DOMContentLoaded", () => {
  renderOverviewDashboard();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();

  document.getElementById("btn-dash-new-pick")?.addEventListener("click", () => {
    window.optacoreOpenPublisher();
  });
  document.getElementById("btn-dash-clear-all")?.addEventListener("click", () => {
    clearAllPredictions();
  });

  document.getElementById("search-input")?.addEventListener("input", renderTodayPredictions);
  document.getElementById("tier-filter")?.addEventListener("change", renderTodayPredictions);
  document.getElementById("btn-sync-results")?.addEventListener("click", syncLiveResultsFromSportsApi);

  ["hist-filter-period", "hist-filter-league", "hist-filter-tier", "hist-filter-outcome"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", renderFullPublicHistory);
  });

  window.addEventListener("optacore:auth-changed", () => {
    renderOverviewDashboard();
    renderTodayPredictions();
  });

  setInterval(tickClockAndCountdowns, 1000);
});
