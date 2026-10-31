// ============================================================================
// ARCHIVO: pagos.js
// Planes con Conversión TRM Oficial ($3.182,99) y Enlace Institucional WhatsApp
// ============================================================================

import { CONFIG } from "./config.js";

let currentRegion = "COLOMBIA";

export function renderVipPlans() {
  const grid = document.getElementById("vip-plans-grid");
  if (!grid) return;

  grid.innerHTML = CONFIG.VIP_PLANS.map((plan) => {
    const isPopular = plan.badge === "MÁS POPULAR";
    const isBest = plan.badge === "MEJOR VALOR";
    const border = isPopular
      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      : isBest
      ? "border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
      : "border-[#1b2432]";

    return `
      <div class="quant-card p-4 flex flex-col justify-between relative ${border} font-num">
        ${
          plan.badge
            ? `<span class="absolute -top-2.5 right-3 px-2 py-0.5 text-[9px] font-black uppercase ${
                isPopular ? "bg-cyan-400 text-slate-950" : "bg-emerald-400 text-slate-950"
              }">${plan.badge}</span>`
            : ""
        }
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black uppercase text-white">${plan.name}</h3>
            <span class="text-[11px] text-slate-400">${plan.days} Días</span>
          </div>

          <div class="pt-1">
            <span class="text-2xl font-black text-white">$${plan.priceCop.toLocaleString("es-CO")} COP</span>
            <span class="text-xs text-cyan-300 block font-bold">≈ ${plan.priceUsdt} USDT (TRM Oficial)</span>
          </div>

          ${
            plan.discountPct > 0
              ? `<span class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  Ahorras $${plan.savedCop.toLocaleString("es-CO")} COP (${plan.discountPct}% DTO)
                </span>`
              : `<span class="text-[10px] text-slate-400 block">Tarifa estándar</span>`
          }
        </div>

        <a
          href="https://wa.me/573332861551?text=Hola%20equipo%20OptaCore,%20deseo%20activar%20el%20Plan%20VIP%20${encodeURIComponent(plan.name)}%20($${plan.priceCop.toLocaleString("es-CO")}%20COP%20/%20${plan.priceUsdt}%20USDT)"
          target="_blank"
          class="mt-4 block w-full py-2 text-center text-xs font-bold uppercase ${
            isPopular || isBest
              ? "bg-[#10b981] text-slate-950 hover:bg-emerald-400"
              : "bg-[#05070a] text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400 hover:text-black"
          } transition"
        >
          Elegir Plan ${plan.name}
        </a>
      </div>
    `;
  }).join("");
}

export function renderPaymentMethods(region) {
  currentRegion = region;
  const btnCol = document.getElementById("btn-reg-col");
  const btnInt = document.getElementById("btn-reg-int");
  const listEl = document.getElementById("payment-methods-list");

  if (region === "COLOMBIA") {
    btnCol.className = "px-3 py-1 text-xs font-num font-bold bg-[#10b981] text-slate-950";
    btnInt.className = "px-3 py-1 text-xs font-num font-bold text-[#8b9bb4]";
  } else {
    btnInt.className = "px-3 py-1 text-xs font-num font-bold bg-cyan-400 text-slate-950";
    btnCol.className = "px-3 py-1 text-xs font-num font-bold text-[#8b9bb4]";
  }

  const methods = CONFIG.PAYMENT_ACCOUNTS[region] || [];
  listEl.innerHTML = methods.map((m) => `
    <div class="p-3 bg-[#05070a] border border-[#1b2432] space-y-1 font-num text-xs">
      <div class="flex items-center justify-between">
        <strong class="text-cyan-400 uppercase text-[11px]">${m.method}</strong>
        <button onclick="navigator.clipboard.writeText('${m.accountNumber}'); alert('Copiado: ${m.accountNumber}')" class="px-2 py-0.5 border border-[#1b2432] text-[10px] text-slate-300 hover:border-cyan-400">
          Copiar
        </button>
      </div>
      <div class="text-sm font-black text-white tracking-wide">${m.accountNumber}</div>
      <div class="text-[11px] text-emerald-400 font-semibold">${m.holderName}</div>
      <p class="text-[11px] text-slate-400 pt-1 border-t border-[#1b2432]/60">${m.instructions}</p>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderVipPlans();
  renderPaymentMethods("COLOMBIA");

  document.getElementById("btn-reg-col")?.addEventListener("click", () => renderPaymentMethods("COLOMBIA"));
  document.getElementById("btn-reg-int")?.addEventListener("click", () => renderPaymentMethods("INTERNACIONAL"));
});
