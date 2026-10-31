// ============================================================================
// ARCHIVO: admin.js
// Panel Exclusivo de Administrador: Aprobar/Rechazar Pagos, Gestión VIP e Ingresos
// ============================================================================

import { CONFIG } from "./config.js";
import { currentUser, saveUserSession } from "./auth.js";
import { getPaymentRequests, savePaymentRequests, renderUserPaymentStatusList } from "./pagos.js";
import { savePredictionToHistory, getColombiaDateString } from "./pronosticos.js";

function getUsersDirectory() {
  const list = JSON.parse(localStorage.getItem("optacore_users_db") || "[]");
  if (!list.some((u) => u.email === currentUser.email) && currentUser.isLoggedIn) {
    list.push(currentUser);
    localStorage.setItem("optacore_users_db", JSON.stringify(list));
  }
  return list;
}

function saveUsersDirectory(list) {
  localStorage.setItem("optacore_users_db", JSON.stringify(list));
}

export function renderAdminDashboard() {
  const reqs = getPaymentRequests();
  const users = getUsersDirectory();

  // Calcular ingresos aprobados del mes actual
  const monthPrefix = getColombiaDateString().substring(0, 7);
  const approvedThisMonth = reqs.filter(
    (r) => r.status === "APROBADA" && r.createdAt.startsWith(monthPrefix)
  );
  const monthlyRevenueCop = approvedThisMonth.reduce((acc, r) => acc + r.amountCop, 0);
  const activeVips = users.filter((u) => u.role === "VIP" || u.role === "PRUEBA_VIP").length;
  const pendingCount = reqs.filter((r) => r.status === "PENDIENTE").length;

  const kpiRow = document.getElementById("admin-kpi-row");
  if (kpiRow) {
    kpiRow.innerHTML = `
      <div class="quant-card p-4 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">INGRESOS DEL MES (COP)</span>
        <span class="text-2xl font-black text-[#10b981]">$${monthlyRevenueCop.toLocaleString("es-CO")}</span>
      </div>
      <div class="quant-card p-4 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">LICENCIAS VIP ACTIVAS</span>
        <span class="text-2xl font-black text-cyan-400">${activeVips}</span>
      </div>
      <div class="quant-card p-4 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">PAGOS PENDIENTES</span>
        <span class="text-2xl font-black text-white">${pendingCount}</span>
      </div>
      <div class="quant-card p-4 font-num">
        <span class="text-[10px] text-[#8b9bb4] block">USUARIOS REGISTRADOS</span>
        <span class="text-2xl font-black text-slate-300">${users.length}</span>
      </div>
    `;
  }

  // Cola de Solicitudes de Pago con vista de captura y botones Aprobar / Rechazar
  const queueEl = document.getElementById("admin-payments-queue");
  if (queueEl) {
    if (reqs.length === 0) {
      queueEl.innerHTML = `<p class="text-xs font-num text-[#8b9bb4]">No hay solicitudes de pago registradas.</p>`;
    } else {
      queueEl.innerHTML = reqs
        .map(
          (r) => `
          <div class="p-4 bg-[#05070a] border border-[#1b2432] flex flex-col md:flex-row md:items-center justify-between gap-4 font-num text-xs">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white">${r.userEmail}</span>
                <span class="text-cyan-400">• Plan ${r.planName} ($${r.amountCop.toLocaleString("es-CO")} COP / ${r.durationDays} días)</span>
              </div>
              <div class="text-[11px] text-[#8b9bb4]">
                Región: ${r.region} | Medio: ${r.paymentMethod} | Hash SHA-256: ${r.receiptHash.substring(0, 16)}...
              </div>
              <a href="${r.receiptUrl}" target="_blank" class="inline-block text-[#10b981] underline text-[11px]">
                🔍 Ver Captura del Comprobante
              </a>
            </div>

            <div class="flex items-center gap-2">
              ${
                r.status === "PENDIENTE"
                  ? `
                  <button onclick="window.adminApprovePayment('${r.id}')" class="px-3 py-1.5 bg-[#10b981] text-slate-950 font-bold uppercase">
                    ✔ Aprobar (+${r.durationDays}d)
                  </button>
                  <button onclick="window.adminRejectPayment('${r.id}')" class="px-3 py-1.5 bg-[#ef4444] text-white font-bold uppercase">
                    ✕ Rechazar
                  </button>
                  `
                  : `<span class="px-2.5 py-1 font-bold uppercase ${
                      r.status === "APROBADA" ? "badge-acierto" : "badge-fallo"
                    }">${r.status}</span>`
              }
            </div>
          </div>
        `
        )
        .join("");
    }
  }

  // Tabla de usuarios para activar o quitar VIP manualmente
  const usersTable = document.getElementById("admin-users-table");
  if (usersTable) {
    usersTable.innerHTML = `
      <table class="w-full text-left border-collapse font-num text-xs">
        <thead>
          <tr class="border-b border-[#1b2432] text-[#8b9bb4] text-[10px] uppercase">
            <th class="py-2 px-2">Email</th>
            <th class="py-2 px-2">Rol</th>
            <th class="py-2 px-2">Vencimiento</th>
            <th class="py-2 px-2">Acción Manual</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#1b2432]/60">
          ${users
            .map(
              (u) => `
            <tr>
              <td class="py-2 px-2 text-white">${u.email}</td>
              <td class="py-2 px-2 text-cyan-300 font-bold">${u.role}</td>
              <td class="py-2 px-2 text-slate-400">${u.vipExpiresAt ? new Date(u.vipExpiresAt).toLocaleDateString("es-CO") : "—"}</td>
              <td class="py-2 px-2 flex gap-1.5">
                <button onclick="window.adminToggleUserVip('${u.email}', 30)" class="px-2 py-1 bg-[#10b981]/20 border border-[#10b981] text-emerald-300 text-[10px] font-bold">
                  +30d VIP
                </button>
                <button onclick="window.adminToggleUserVip('${u.email}', 0)" class="px-2 py-1 bg-[#ef4444]/20 border border-[#ef4444] text-red-300 text-[10px] font-bold">
                  Quitar VIP
                </button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }
}

window.adminApprovePayment = (reqId) => {
  const reqs = getPaymentRequests();
  const target = reqs.find((r) => r.id === reqId);
  if (!target) return;

  target.status = "APROBADA";
  target.reviewedAt = new Date().toISOString();
  savePaymentRequests(reqs);

  const users = getUsersDirectory();
  let user = users.find((u) => u.email === target.userEmail);
  const baseTime =
    user && user.vipExpiresAt && new Date(user.vipExpiresAt) > new Date()
      ? new Date(user.vipExpiresAt).getTime()
      : Date.now();
  const newExpiry = new Date(baseTime + target.durationDays * 86400000).toISOString();

  if (user) {
    user.role = "VIP";
    user.vipExpiresAt = newExpiry;

    // Si fue referido por alguien, premiamos al referidor con días VIP gratis
    if (user.referredBy) {
      const referrer = users.find((u) => u.referralCode === user.referredBy);
      if (referrer) {
        const refBase =
          referrer.vipExpiresAt && new Date(referrer.vipExpiresAt) > new Date()
            ? new Date(referrer.vipExpiresAt).getTime()
            : Date.now();
        referrer.role = "VIP";
        referrer.vipExpiresAt = new Date(
          refBase + CONFIG.BRAND.REFERRAL_REWARD_DAYS * 86400000
        ).toISOString();
      }
    }
  }

  saveUsersDirectory(users);
  if (currentUser.email === target.userEmail) {
    currentUser.role = "VIP";
    currentUser.vipExpiresAt = newExpiry;
    saveUserSession(currentUser);
  }

  renderUserPaymentStatusList();
  renderAdminDashboard();
};

window.adminRejectPayment = (reqId) => {
  const reason = prompt("Escribe el motivo del rechazo (lo verá el usuario en su panel):", "Comprobante ilegible o monto incompleto");
  if (!reason) return;

  const reqs = getPaymentRequests();
  const target = reqs.find((r) => r.id === reqId);
  if (!target) return;

  target.status = "RECHAZADA";
  target.rejectionReason = reason;
  savePaymentRequests(reqs);
  renderUserPaymentStatusList();
  renderAdminDashboard();
};

window.adminToggleUserVip = (email, daysToAdd) => {
  const users = getUsersDirectory();
  const target = users.find((u) => u.email === email);
  if (!target) return;

  if (daysToAdd > 0) {
    target.role = "VIP";
    target.vipExpiresAt = new Date(Date.now() + daysToAdd * 86400000).toISOString();
  } else {
    target.role = "GRATIS";
    target.vipExpiresAt = null;
  }

  saveUsersDirectory(users);
  if (currentUser.email === email) {
    currentUser.role = target.role;
    currentUser.vipExpiresAt = target.vipExpiresAt;
    saveUserSession(currentUser);
  }
  renderAdminDashboard();
};

document.addEventListener("DOMContentLoaded", () => {
  renderAdminDashboard();
  window.addEventListener("optacore:payments-updated", renderAdminDashboard);
  window.addEventListener("optacore:auth-changed", renderAdminDashboard);

  document.getElementById("admin-new-pick-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const todayCol = getColombiaDateString();
    const timeVal = document.getElementById("adm-time").value;
    const tierVal = document.getElementById("adm-tier").value;
    const home = document.getElementById("adm-home").value;
    const away = document.getElementById("adm-away").value;
    const pickText = document.getElementById("adm-pick").value;
    const probVal = Number(document.getElementById("adm-prob").value);

    const newPick = {
      id: "OPTA-" + Date.now(),
      matchDate: todayCol,
      kickoffIso: `${todayCol}T${timeVal}:00-05:00`,
      kickoffLabel: `${timeVal} COL`,
      league: document.getElementById("adm-league").value,
      homeTeam: home,
      awayTeam: away,
      predictionText: pickText,
      probability: probVal,
      tier: tierVal,
      altitudeM: Number(document.getElementById("adm-alt").value),
      deltaAltitudeM: 0,
      tempC: 20.0,
      humidityPct: 65,
      l10Summary: document.getElementById("adm-l10").value,
      split1hPct: 45,
      split2hPct: 55,
      tempoTag: "MODELO ACTIVO",
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    };

    savePredictionToHistory(newPick);

    // Si es un pronóstico DIAMANTE, envía alerta automática al Canal VIP de Telegram
    if (
      tierVal === "DIAMANTE" &&
      CONFIG.NOTIFICATIONS.TELEGRAM_BOT_TOKEN &&
      !CONFIG.NOTIFICATIONS.TELEGRAM_BOT_TOKEN.includes("TU_BOT")
    ) {
      const msg = `💎 NUEVO PRONÓSTICO DIAMANTE (${probVal}%)\n⚽ ${home} vs ${away}\n🎯 Selección: ${pickText}\n⛰️ Altitud: ${newPick.altitudeM}m\n📊 ${newPick.l10Summary}`;
      fetch(`https://api.telegram.org/bot${CONFIG.NOTIFICATIONS.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.NOTIFICATIONS.TELEGRAM_VIP_CHANNEL_ID,
          text: msg,
        }),
      }).catch(() => {});
    }

    e.target.reset();
    alert("Pronóstico publicado y guardado en el historial permanente.");
  });
});
