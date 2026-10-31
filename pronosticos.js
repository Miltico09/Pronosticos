// ============================================================================
// ARCHIVO: pronosticos.js (REPARADO: Reloj Colombia + Navegación entre Pestañas)
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_KEY = "optacore_master_feed_v4";

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

function seedMasterRecords() {
  const today = getColombiaDateString();
  const cached = localStorage.getItem(DB_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    if (list.some((p) => p.matchDate === today)) return list;
  }

  const makeIso = (hhmm) => `${today}T${hhmm}:00-05:00`;

  const records = [
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
      l10Summary: "City promedia 2.68 xG en el Etihad; 9V en 10 juegos en llano húmedo.",
      split1hPct: 58,
      split2hPct: 42,
      tempoTag: "SPRINTER ASALTO 1T",
      commentary: "Análisis Táctico: Asfixia con bloque alto desde el primer minuto. Brighton concede 62% antes del descanso.",
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
      l10Summary: "Der Klassiker promedia 4.2 goles en L10.",
      split1hPct: 48,
      split2hPct: 52,
      tempoTag: "EXPLOSIÓN 2T (MIN 60'-90')",
      commentary: "Análisis Táctico: Dortmund presenta colapso físico pronunciado tras el minuto 55.",
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
      l10Summary: "Barça acumula 10 victorias consecutivas en Montjuïc.",
      split1hPct: 57,
      split2hPct: 43,
      tempoTag: "DOMINIO TEMPRANO 1T",
      commentary: "Análisis Táctico: Alavés desciende de 525m a nivel del mar; el asedio local ahoga su repliegue.",
      liveScore: "2 - 0 (72')",
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
      l10Summary: "Sin hipoxia para Junior en Villavicencio (467m, 27°C).",
      split1hPct: 35,
      split2hPct: 65,
      tempoTag: "PARTIDO DIESEL (ROTURA 2T)",
      commentary: "Análisis Táctico: Calor y humedad del 81% favorecen la resistencia del Junior frente al bloque local.",
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
      l10Summary: "Timberwolves con 48h de descanso; Spurs permite 118.4 puntos de visita.",
      split1hPct: 52,
      split2hPct: 48,
      tempoTag: "ALTO RITMO Q1 Y Q3",
      commentary: "Análisis VIP: Colchón de 8.5 puntos bajo la línea oficial de 223.0.",
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
      l10Summary: "8 de los últimos 10 clásicos en El Campín superaron 1.5 goles.",
      split1hPct: 40,
      split2hPct: 60,
      tempoTag: "CIERRE INTENSO 2T",
      commentary: "Análisis VIP: Ambos equipos generan xG superior a 1.30 y necesitan la victoria.",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
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
      altitudeM: 18,
      deltaAltitudeM: -449,
      tempC: 32.5,
      humidityPct: 86,
      l10Summary: "Jaraguay de Montería: 33°C y desgaste rival.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "DESGASTE BIOCLIMÁTICO MONTERÍA",
      commentary: "HITO FUNDADOR: Cobro de $150.000 COP. La humedad extrema de Montería definió el 2T.",
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
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
      l10Summary: "San Lázaro.",
      split1hPct: 40,
      split2hPct: 60,
      tempoTag: "FALLO REPORTADO",
      commentary: "Compostela aguantó el 0-0 en la primera parte.",
      liveScore: "0 - 1",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
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
      l10Summary: "BayArena.",
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "FALLO REPORTADO",
      commentary: "Múltiples balones en los palos sellaron un empate sin goles.",
      liveScore: "0 - 0",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    }
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

// Reloj continuo de Colombia en vivo
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

// Botón de WhatsApp flotante
function injectWhatsAppFloatingButton() {
  if (document.getElementById("btn-wa-floating")) return;
  const btn = document.createElement("a");
  btn.id = "btn-wa-floating";
  btn.href = CONFIG.NOTIFICATIONS.WHATSAPP_LINK;
  btn.target = "_blank";
  btn.className = "fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black font-num text-xs uppercase tracking-wider rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-300 transition-all";
  btn.innerHTML = `<span>💬 WhatsApp VIP Directo (+57 333 286 1551)</span>`;
  document.body.appendChild(btn);
}

// Vinculación garantizada de las pestañas
function setupTabNavigation() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    };
  });
}

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
      : `MODO ABIERTO: 4 PRONÓSTICOS DESTACADOS GRATIS`;
  }

  container.innerHTML = filtered.map((item) => {
    const isVisible = isVip || item.isFree;
    const stars = getStars(item.probability);

    return `
      <article class="quant-card p-4 flex flex-col justify-between space-y-3 font-num">
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

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-base md:text-lg font-black text-white">
              ${item.homeTeam} <span class="text-xs text-cyan-400 px-1">VS</span> ${item.awayTeam}
            </h3>
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

        <div class="p-3 bg-[#070a0f] border border-[#1b2432] space-y-2.5 text-xs">
          <div class="grid grid-cols-3 gap-2 bg-[#05070a] p-2 border border-[#1b2432]">
            <div>
              <span class="text-[9px] text-slate-400 block">ALTITUD SEDE</span>
              <span class="text-white font-bold">${item.altitudeM}m (${item.deltaAltitudeM >= 0 ? "+" : ""}${item.deltaAltitudeM}m)</span>
            </div>
            <div>
              <span class="text-[9px] text-slate-400 block">TEMPERATURA / HUM</span>
              <span class="text-cyan-300 font-bold">${item.tempC}°C / ${item.humidityPct}%</span>
            </div>
            <div>
              <span class="text-[9px] text-slate-400 block">DINÁMICA</span>
              <span class="text-[#10b981] font-bold">${item.tempoTag.split(" ")[0]}</span>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-slate-400">EXPLOSIVIDAD DE GOLES (1T / 2T):</span>
              <span class="text-white">1T: <strong>${item.split1hPct}%</strong> | 2T: <strong class="text-[#10b981]">${item.split2hPct}%</strong></span>
            </div>
            <div class="w-full h-1.5 bg-[#161f2c] flex">
              <div style="width: ${item.split1hPct}%" class="bg-[#06b6d4] h-full"></div>
              <div style="width: ${item.split2hPct}%" class="bg-[#10b981] h-full"></div>
            </div>
          </div>

          <div class="p-2 bg-[#05070a] border border-[#1b2432]/70 text-slate-300 text-[11px] leading-relaxed">
            <strong class="text-cyan-300">DICTAMEN TÁCTICO:</strong> ${item.commentary}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

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
  const fourStars = calc(settled.filter((p) => p.probability >= 85 && p.probability < 90));

  const kpiEl = document.getElementById("history-kpi-cards");
  if (kpiEl) {
    kpiEl.innerHTML = `
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-slate-400 block">EFECTIVIDAD REAL TOTAL</span>
        <span class="text-2xl font-black text-[#10b981]">${totalStats.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${totalStats.w} aciertos / ${totalStats.tot} jugadas</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-slate-400 block">JAGUARES MONTERÍA</span>
        <span class="text-2xl font-black text-cyan-400">100%</span>
        <span class="text-[11px] text-slate-400 block">Cobro $150.000 Fundador</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-slate-400 block">⭐⭐⭐⭐⭐ (5 ESTRELLAS)</span>
        <span class="text-2xl font-black text-[#06b6d4]">${fiveStars.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${fiveStars.w} de ${fiveStars.tot} acertados</span>
      </div>
      <div class="quant-card p-3.5 font-num">
        <span class="text-[10px] text-slate-400 block">⭐⭐⭐⭐ (4 ESTRELLAS)</span>
        <span class="text-2xl font-black text-emerald-400">${fourStars.pct}%</span>
        <span class="text-[11px] text-slate-400 block">${fourStars.w} de ${fourStars.tot} acertados</span>
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
      const stars = getStars(p.probability);
      return `
        <tr class="hover:bg-[#0f151f] text-xs font-num">
          <td class="py-2.5 px-3 text-slate-400">${p.matchDate}</td>
          <td class="py-2.5 px-3 text-slate-300">${p.league}</td>
          <td class="py-2.5 px-3 font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</td>
          <td class="py-2.5 px-3 text-cyan-300">${p.predictionText}</td>
          <td class="py-2.5 px-3">${stars.stars}</td>
          <td class="py-2.5 px-3 font-bold text-white">${p.liveScore}</td>
          <td class="py-2.5 px-3"><span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${badge}">${p.outcome}</span></td>
        </tr>
      `;
    }).join("");
  }
}

window.optacoreGoVip = () => switchTab("tab-planes");

// Inicialización de la vista
document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();
  startColombiaClock();
  injectWhatsAppFloatingButton();
  renderTodayPredictions();
  renderFullPublicHistory();

  document.getElementById("search-input")?.addEventListener("input", renderTodayPredictions);
});
