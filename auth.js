// ============================================================================
// ARCHIVO: auth.js
// Manejo de Sesión, Prueba VIP 24h y Cambio de Pestañas
// ============================================================================

export function switchTab(tabId) {
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.add("hidden");
  });

  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.classList.remove("hidden");
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.className = "nav-btn px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#06b6d4] bg-[#06b6d4]/15 text-white";
    } else {
      btn.className = "nav-btn px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#1b2432] bg-[#0a0e14] text-[#8b9bb4] hover:text-white";
    }
  });
}

export function isUserVipOrAdmin() {
  const trial = localStorage.getItem("optacore_trial_active");
  const vip = localStorage.getItem("optacore_vip_active");
  return trial === "true" || vip === "true";
}

function updateHeaderStatus() {
  const badge = document.getElementById("user-role-badge");
  const roleText = document.getElementById("account-role-text");
  const expiresText = document.getElementById("account-expires-text");

  if (isUserVipOrAdmin()) {
    if (badge) {
      badge.textContent = "MEMBRESÍA VIP ACTIVA (ACCESO TOTAL)";
      badge.className = "px-2 py-0.5 border border-[#10b981] bg-[#10b981]/20 text-[#10b981] font-bold";
    }
    if (roleText) roleText.textContent = "MIEMBRO VIP";
    if (expiresText) expiresText.textContent = "Vigencia activa sin restricciones";
  } else {
    if (badge) {
      badge.textContent = "ACCESO LIBRE // 4 JUGADAS GRATIS HOY";
      badge.className = "px-2 py-0.5 border border-[#1b2432] bg-[#0a0e14] text-slate-300 font-bold";
    }
    if (roleText) roleText.textContent = "ACCESO LIBRE";
    if (expiresText) expiresText.textContent = "Sin límite en jugadas gratuitas";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderStatus();

  // Botón Abrir Modal Iniciar Sesión
  const btnAuth = document.getElementById("btn-open-auth");
  const modalAuth = document.getElementById("auth-modal");
  const btnClose = document.getElementById("btn-close-auth");

  if (btnAuth && modalAuth) {
    btnAuth.onclick = () => modalAuth.classList.remove("hidden");
  }

  if (btnClose && modalAuth) {
    btnClose.onclick = () => modalAuth.classList.add("hidden");
  }

  // Formulario Iniciar Sesión
  document.getElementById("auth-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    localStorage.setItem("optacore_vip_active", "true");
    modalAuth.classList.add("hidden");
    updateHeaderStatus();
    alert(`Bienvenido de nuevo: ${email}. Membresía VIP activada.`);
    window.location.reload();
  });

  // Botón Prueba VIP 24h
  document.getElementById("btn-trial-24h")?.addEventListener("click", () => {
    localStorage.setItem("optacore_trial_active", "true");
    updateHeaderStatus();
    alert("¡Prueba VIP de 24 horas activada con éxito! Ya puedes ver todos los pronósticos y análisis sin bloqueos.");
    window.location.reload();
  });
});
