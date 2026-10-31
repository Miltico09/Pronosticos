// ============================================================================
// ARCHIVO: pagos.js
// Recálculo Automático con Códigos de Promotor (-20%) y Validación de Llaves
// ============================================================================

import { CONFIG } from "./config.js";
import { updateHeaderStatus } from "./auth.js";

let currentRegion = "COLOMBIA";
let activePromo = null; // Almacena el código y promotor activo

// Renderiza los planes aplicando descuento del 20% si hay código
export function renderVipPlans() {
  const grid = document.getElementById("vip-plans-grid");
  if (!grid) return;

  grid.innerHTML = CONFIG.VIP_PLANS.map((plan) => {
    let finalCop = plan.priceCop;
    let finalUsdt = plan.priceUsdt;

    if (activePromo) {
      finalCop = Math.round(plan.priceCop * (1 - activePromo.discountPct / 100));
      finalUsdt = Number((plan.priceUsdt * (1 - activePromo.discountPct / 100)).toFixed(2));
    }

    const isPopular = plan.badge === "MÁS POPULAR";
    const isBest = plan.badge === "MEJOR VALOR";
    const border = isPopular
      ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      : isBest
      ? "border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
      : "border-[#1b2432]";

    // Mensaje de WhatsApp prellenado con el nombre del promotor si aplica
    const waText = activePromo
      ? `Hola equipo OptaCore, quiero activar el Plan ${plan.name} aplicando el código ${activePromo.code} (${activePromo.promoter}) con el 20% de descuento. Valor final: $${finalCop.toLocaleString("es-CO")} COP / ${finalUsdt} USDT. Adjunto mi comprobante:`
      : `Hola equipo OptaCore, deseo activar el Plan VIP ${plan.name} ($${finalCop.toLocaleString("es-CO")} COP / ${finalUsdt} USDT). Adjunto mi comprobante:`;

    const waLink = `https://wa.me/573332861551?text=${encodeURIComponent(waText)}`;

    return `
      <div class="quant-card p-4 flex flex-col justify-between relative ${border} font-mono">
        ${
          activePromo
            ? `<span class="absolute -top-2.5 right-3 px-2 py-0.5 text-[9px] font-black uppercase bg-[#10b981] text-slate-950">
                -20% CÓDIGO: ${activePromo.code}
              </span>`
            : plan.badge
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
            ${
              activePromo
                ? `
                <div class="text-xs text-slate-500 line-through font-bold">Antes: $${plan.priceCop.toLocaleString("es-CO")} COP</div>
                <span class="text-2xl font-black text-[#10b981]">$${finalCop.toLocaleString("es-CO")} COP</span>
                <span class="text-xs text-cyan-300 block font-bold">≈ ${finalUsdt} USDT (Con 20% DTO)</span>
                `
                : `
                <span class="text-2xl font-black text-white">$${finalCop.toLocaleString("es-CO")} COP</span>
                <span class="text-xs text-cyan-300 block font-bold">≈ ${finalUsdt} USDT</span>
                `
            }
          </div>

          ${
            activePromo
              ? `<span class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                  Descuento aplicado por ${activePromo.promoter}
                </span>`
              : plan.discountPct > 0
              ? `<span class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  Ahorras $${plan.savedCop.toLocaleString("es-CO")} COP (${plan.discountPct}% DTO)
                </span>`
              : `<span class="text-[10px] text-slate-400 block">Tarifa regular</span>`
          }
        </div>

        <a
          href="${waLink}"
          target="_blank"
          class="mt-4 block w-full py-2 text-center text-xs font-bold uppercase ${
            isPopular || isBest || activePromo
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
    btnCol.className = "px-3 py-1 text-xs font-mono font-bold bg-[#10b981] text-slate-950";
    btnInt.className = "px-3 py-1 text-xs font-mono font-bold text-[#8b9bb4]";
  } else {
    btnInt.className = "px-3 py-1 text-xs font-mono font-bold bg-cyan-400 text-slate-950";
    btnCol.className = "px-3 py-1 text-xs font-mono font-bold text-[#8b9bb4]";
  }

  const methods = CONFIG.PAYMENT_ACCOUNTS[region] || [];
  listEl.innerHTML = methods.map((m) => `
    <div class="p-3 bg-[#05070a] border border-[#1b2432] space-y-1 font-mono text-xs">
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

// Configuración de eventos para cupones y llaves
document.addEventListener("DOMContentLoaded", () => {
  renderVipPlans();
  renderPaymentMethods("COLOMBIA");

  document.getElementById("btn-reg-col")?.addEventListener("click", () => renderPaymentMethods("COLOMBIA"));
  document.getElementById("btn-reg-int")?.addEventListener("click", () => renderPaymentMethods("INTERNACIONAL"));

  // 1. APLICAR CÓDIGO DE DESCUENTO (PROMOTORES)
  document.getElementById("btn-apply-promo")?.addEventListener("click", () => {
    const input = document.getElementById("input-promo-code");
    const statusBadge = document.getElementById("promo-status-badge");
    const code = input?.value.trim().toUpperCase();

    if (!code) {
      alert("Por favor escribe un código promocional.");
      return;
    }

    const found = CONFIG.PROMO_CODES.find((p) => p.code.toUpperCase() === code);
    if (found) {
      activePromo = found;
      if (statusBadge) {
        statusBadge.textContent = `✔ ${found.discountPct}% DTO (${found.promoter})`;
        statusBadge.className = "text-[10px] text-[#10b981] font-bold";
      }
      renderVipPlans();
      alert(`¡Código aplicado con éxito! Se ha descontado el ${found.discountPct}% a todos los planes VIP.`);
    } else {
      alert("El código ingresado no existe o no se encuentra activo.");
    }
  });

  // 2. MODAL Y CANJEO DE LLAVES TEMPORALES
  const redeemModal = document.getElementById("redeem-key-modal");
  document.getElementById("btn-open-redeem-key")?.addEventListener("click", () => {
    redeemModal?.classList.remove("hidden");
  });
  document.getElementById("btn-close-redeem")?.addEventListener("click", () => {
    redeemModal?.classList.add("hidden");
  });

  document.getElementById("redeem-key-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyInput = document.getElementById("input-license-key")?.value.trim().toUpperCase();
    const foundKey = CONFIG.VIP_KEYS.find((k) => k.code.toUpperCase() === keyInput);

    if (foundKey) {
      const now = Date.now();
      const addedMillis = foundKey.days * 24 * 60 * 60 * 1000;
      const newExp = now + addedMillis;

      localStorage.setItem("optacore_user_role", "VIP");
      localStorage.setItem("optacore_vip_expires_timestamp", newExp.toString());
      localStorage.setItem("optacore_vip_key_used", foundKey.code);

      redeemModal?.classList.add("hidden");
      alert(`¡Llave válida! Se han activado ${foundKey.days} días de membresía VIP (${foundKey.description}).`);
      window.location.reload();
    } else {
      alert("Llave inválida o expirada. Verifica el código e intenta de nuevo.");
    }
  });
});
