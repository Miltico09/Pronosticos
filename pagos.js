// ============================================================================
// ARCHIVO: pagos.js
// Planes VIP en COP, Cuentas Manuales (Nequi/Bancolombia/Binance) y Anti-Duplicados SHA-256
// ============================================================================

import { CONFIG } from "./config.js";
import { currentUser } from "./auth.js";

const REQUESTS_DB_KEY = "optacore_payment_requests_v1";
let selectedRegion = "COLOMBIA";

export function getPaymentRequests() {
  return JSON.parse(localStorage.getItem(REQUESTS_DB_KEY) || "[]");
}

export function savePaymentRequests(list) {
  localStorage.setItem(REQUESTS_DB_KEY, JSON.stringify(list));
}

// Calcula el hash SHA-256 binario del archivo para impedir que reutilicen la misma captura
async function computeFileSha256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Dispara alerta inmediata a tu Telegram de Administrador cuando entra un pago
async function notifyAdminNewPayment(req) {
  if (
    CONFIG.NOTIFICATIONS.TELEGRAM_BOT_TOKEN &&
    !CONFIG.NOTIFICATIONS.TELEGRAM_BOT_TOKEN.includes("TU_BOT")
  ) {
    const text = `🔔 NUEVA SOLICITUD DE PAGO VIP\nUsuario: ${req.userEmail}\nPlan: ${req.planName} ($${req.amountCop.toLocaleString("es-CO")} COP)\nMedio: ${req.paymentMethod}\nHash: ${req.receiptHash.substring(0, 12)}...`;
    try {
      await fetch(`https://api.telegram.org/bot${CONFIG.NOTIFICATIONS.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.NOTIFICATIONS.TELEGRAM_ADMIN_CHAT_ID,
          text,
        }),
      });
    } catch (e) {
      console.warn("Notificación Telegram local:", e);
    }
  }
}

export function renderVipPlans() {
  const grid = document.getElementById("vip-plans-grid");
  const selectPlan = document.getElementById("pay-plan-select");
  if (!grid || !selectPlan) return;

  selectPlan.innerHTML = CONFIG.VIP_PLANS.map(
    (p) => `<option value="${p.id}">${p.name} — $${p.priceCop.toLocaleString("es-CO")} COP (${p.days} días)</option>`
  ).join("");

  grid.innerHTML = CONFIG.VIP_PLANS.map((plan) => {
    const isPopular = plan.badge === "MÁS POPULAR";
    const isBestValue = plan.badge === "MEJOR VALOR";
    const borderClass = isPopular
      ? "border-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.15)]"
      : isBestValue
      ? "border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.15)]"
      : "border-[#1b2432]";

    return `
      <div class="quant-card p-5 flex flex-col justify-between relative ${borderClass}">
        ${
          plan.badge
            ? `<span class="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-num font-black uppercase ${
                isPopular ? "bg-[#06b6d4] text-slate-950" : "bg-[#10b981] text-slate-950"
              }">${plan.badge}</span>`
            : ""
        }
        <div class="space-y-2">
          <div class="flex items-center justify-between font-num">
            <h3 class="text-base font-black uppercase text-white">${plan.name}</h3>
            <span class="text-xs text-[#8b9bb4]">${plan.days} Días VIP</span>
          </div>

          <div class="font-num pt-1">
            <span class="text-3xl font-black text-white">$${plan.priceCop.toLocaleString("es-CO")}</span>
            <span class="text-xs text-[#8b9bb4]"> COP</span>
          </div>

          ${
            plan.discountPct > 0
              ? `<div class="inline-block px-2 py-0.5 bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] text-xs font-num font-bold">
                  ${plan.discountPct}% DTO • Ahorras $${plan.savedCop.toLocaleString("es-CO")} COP
                </div>`
              : `<div class="text-xs font-num text-[#8b9bb4]">Tarifa estándar semanal</div>`
          }
        </div>

        <button
          onclick="window.selectVipPlan('${plan.id}')"
          class="mt-5 w-full py-2 text-xs font-num font-bold uppercase border ${
            isPopular || isBestValue
              ? "bg-[#10b981] text-slate-950 border-[#10b981]"
              : "bg-[#05070a] text-cyan-300 border-[#06b6d4]/50 hover:bg-[#06b6d4] hover:text-slate-950"
          } transition"
        >
          Elegir Plan ${plan.name}
        </button>
      </div>
    `;
  }).join("");
}

export function renderPaymentMethodsByRegion(region) {
  selectedRegion = region;
  const btnCol = document.getElementById("btn-reg-col");
  const btnInt = document.getElementById("btn-reg-int");
  const listEl = document.getElementById("payment-methods-list");
  const methodSelect = document.getElementById("pay-method-select");

  if (region === "COLOMBIA") {
    btnCol.className = "px-3 py-1 text-xs font-num font-bold bg-[#10b981] text-slate-950";
    btnInt.className = "px-3 py-1 text-xs font-num font-bold text-[#8b9bb4]";
  } else {
    btnInt.className = "px-3 py-1 text-xs font-num font-bold bg-[#06b6d4] text-slate-950";
    btnCol.className = "px-3 py-1 text-xs font-num font-bold text-[#8b9bb4]";
  }

  const methods = CONFIG.PAYMENT_ACCOUNTS[region] || [];
  methodSelect.innerHTML = methods.map((m) => `<option value="${m.method}">${m.method}</option>`).join("");

  listEl.innerHTML = methods
    .map(
      (m) => `
      <div class="p-3.5 bg-[#05070a] border border-[#1b2432] space-y-1.5 font-num text-xs">
        <div class="flex items-center justify-between">
          <strong class="text-[#06b6d4] uppercase">${m.method}</strong>
          <button onclick="navigator.clipboard.writeText('${m.accountNumber}')" class="px-2 py-0.5 border border-[#1b2432] text-[10px] text-slate-300 hover:border-cyan-400">
            Copiar Dato
          </button>
        </div>
        <div class="text-sm font-black text-white">${m.accountNumber}</div>
        <div class="text-[11px] text-emerald-400">${m.holderName}</div>
        <p class="text-[11px] text-[#8b9bb4] pt-1 border-t border-[#1b2432]/70">${m.instructions}</p>
      </div>
    `
    )
    .join("");
}

export function renderUserPaymentStatusList() {
  const container = document.getElementById("user-payment-requests-list");
  if (!container) return;

  const myRequests = getPaymentRequests().filter((r) => r.userEmail === currentUser.email);
  if (myRequests.length === 0) {
    container.innerHTML = `<p class="text-xs font-num text-[#8b9bb4]">Aún no tienes solicitudes de pago registradas.</p>`;
    return;
  }

  container.innerHTML = myRequests
    .map((r) => {
      const stClass =
        r.status === "APROBADA"
          ? "badge-acierto"
          : r.status === "RECHAZADA"
          ? "badge-fallo"
          : "badge-pendiente";
      return `
        <div class="p-2.5 bg-[#05070a] border border-[#1b2432] flex flex-wrap items-center justify-between gap-2 text-xs font-num">
          <div>
            <div class="font-bold text-white">Plan ${r.planName} ($${r.amountCop.toLocaleString("es-CO")} COP)</div>
            <div class="text-[10px] text-[#8b9bb4]">${new Date(r.createdAt).toLocaleString("es-CO")} • ${r.paymentMethod}</div>
            ${r.rejectionReason ? `<div class="text-[11px] text-[#ef4444] mt-1">Motivo rechazo: ${r.rejectionReason}</div>` : ""}
          </div>
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase ${stClass}">${r.status}</span>
        </div>
      `;
    })
    .join("");
}

window.selectVipPlan = (planId) => {
  const select = document.getElementById("pay-plan-select");
  if (select) {
    select.value = planId;
    select.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderVipPlans();
  renderPaymentMethodsByRegion("COLOMBIA");
  renderUserPaymentStatusList();

  document.getElementById("btn-reg-col")?.addEventListener("click", () => renderPaymentMethodsByRegion("COLOMBIA"));
  document.getElementById("btn-reg-int")?.addEventListener("click", () => renderPaymentMethodsByRegion("INTERNACIONAL"));

  document.getElementById("payment-upload-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = document.getElementById("payment-form-feedback");
    if (!currentUser.isLoggedIn) {
      document.getElementById("auth-modal").classList.remove("hidden");
      return;
    }

    const fileInput = document.getElementById("pay-receipt-file");
    const file = fileInput.files[0];
    if (!file) return;

    const hash = await computeFileSha256(file);
    const allReqs = getPaymentRequests();

    // Validación estricta Anti-Duplicados por huella SHA-256
    if (allReqs.some((r) => r.receiptHash === hash)) {
      feedback.className = "p-2.5 border badge-fallo text-xs block";
      feedback.textContent =
        "⛔ COMPROBANTE DUPLICADO DETECTADO: Esta captura ya fue utilizada en otra solicitud. Sube un comprobante original válido.";
      return;
    }

    const planId = document.getElementById("pay-plan-select").value;
    const plan = CONFIG.VIP_PLANS.find((p) => p.id === planId);
    const method = document.getElementById("pay-method-select").value;
    const dataUrl = await fileToDataUrl(file);

    const newReq = {
      id: "PAY-" + Date.now(),
      userEmail: currentUser.email,
      region: selectedRegion,
      paymentMethod: method,
      planId: plan.id,
      planName: plan.name,
      amountCop: plan.priceCop,
      durationDays: plan.days,
      receiptUrl: dataUrl,
      receiptHash: hash,
      status: "PENDIENTE",
      rejectionReason: null,
      createdAt: new Date().toISOString(),
    };

    allReqs.unshift(newReq);
    savePaymentRequests(allReqs);
    await notifyAdminNewPayment(newReq);

    feedback.className = "p-2.5 border badge-acierto text-xs block";
    feedback.textContent =
      "✔ Solicitud enviada en estado PENDIENTE. El administrador verificará tu captura y activará tu vigencia VIP.";
    fileInput.value = "";
    renderUserPaymentStatusList();
    window.dispatchEvent(new CustomEvent("optacore:payments-updated"));
  });

  window.addEventListener("optacore:auth-changed", renderUserPaymentStatusList);
});
