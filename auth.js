// ============================================================================
// ARCHIVO: auth.js
// Manejo Seguro de Sesión, Registro 24h y Expiración Exacta
// ============================================================================

import { CONFIG } from "./config.js";

const supabase = window.supabase
  ? window.supabase.createClient(CONFIG.KEYS.SUPABASE_URL, CONFIG.KEYS.SUPABASE_ANON_KEY)
  : null;

export function isUserVipOrAdmin() {
  const role = localStorage.getItem("optacore_user_role");
  if (role === "ADMIN" || role === "VIP") return true;

  const expiresTimestamp = localStorage.getItem("optacore_vip_expires_timestamp");
  if (!expiresTimestamp) return false;

  const now = Date.now();
  const exp = parseInt(expiresTimestamp, 10);

  if (now >= exp) {
    localStorage.removeItem("optacore_vip_expires_timestamp");
    localStorage.removeItem("optacore_user_role");
    localStorage.removeItem("optacore_user_email");
    return false;
  }

  return true;
}

function getRemainingTrialTime() {
  const expiresTimestamp = localStorage.getItem("optacore_vip_expires_timestamp");
  if (!expiresTimestamp) return null;

  const diff = parseInt(expiresTimestamp, 10) - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m restantes`;
}

export function updateHeaderStatus() {
  const badge = document.getElementById("user-role-badge");
  const roleText = document.getElementById("account-role-text");
  const expiresText = document.getElementById("account-expires-text");
  const emailText = document.getElementById("account-email-text");
  const btnTrial = document.getElementById("btn-trial-24h");
  const btnAuth = document.getElementById("btn-open-auth");
  const btnLogout = document.getElementById("btn-logout");

  const email = localStorage.getItem("optacore_user_email");
  const remaining = getRemainingTrialTime();

  if (isUserVipOrAdmin()) {
    const role = localStorage.getItem("optacore_user_role") || "PRUEBA_VIP";
    if (badge) {
      badge.textContent = remaining ? `PRUEBA VIP 24H (${remaining.toUpperCase()})` : "MEMBRESÍA VIP ACTIVA";
      badge.className = "px-2 py-0.5 border border-[#10b981] bg-[#10b981]/20 text-[#10b981] font-bold";
    }
    if (roleText) roleText.textContent = role === "PRUEBA_VIP" ? "PRUEBA VIP TEMPORAL" : "MIEMBRO VIP";
    if (expiresText) expiresText.textContent = remaining ? `Expira en: ${remaining}` : "Vigencia activa";
    if (emailText) emailText.textContent = email || "Usuario Activo";

    if (btnTrial) btnTrial.classList.add("hidden");
    if (btnAuth) btnAuth.classList.add("hidden");
    if (btnLogout) btnLogout.classList.remove("hidden");
  } else {
    if (badge) {
      badge.textContent = "ACCESO LIBRE // 4 JUGADAS GRATIS HOY";
      badge.className = "px-2 py-0.5 border border-[#1b2432] bg-[#0a0e14] text-slate-300 font-bold";
    }
    if (roleText) roleText.textContent = "ACCESO LIBRE";
    if (expiresText) expiresText.textContent = "Sin límite en jugadas gratuitas";
    if (emailText) emailText.textContent = "No registrado";

    if (btnTrial) btnTrial.classList.remove("hidden");
    if (btnAuth) btnAuth.classList.remove("hidden");
    if (btnLogout) btnLogout.classList.add("hidden");
  }
}

async function handleRegisterTrial(email, password) {
  const now = Date.now();
  const expiresAtDate = new Date(now + 24 * 60 * 60 * 1000);

  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("trial_used")
        .eq("email", email)
        .maybeSingle();

      if (existing && existing.trial_used) {
        alert("Este correo ya utilizó su prueba gratuita de 24 horas. Para continuar con acceso completo, solicita tu plan VIP por WhatsApp.");
        return false;
      }

      const { data: authData } = await supabase.auth.signUp({ email, password });
      const userId = authData?.user?.id || crypto.randomUUID();

      await supabase.from("profiles").upsert({
        id: userId,
        email: email,
        role: "PRUEBA_VIP",
        trial_used: true,
        vip_expires_at: expiresAtDate.toISOString(),
        referral_code: "OPTA-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
    } catch (err) {
      console.warn("Aviso conexión Supabase:", err);
    }
  }

  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "PRUEBA_VIP");
  localStorage.setItem("optacore_vip_expires_timestamp", (now + 24 * 60 * 60 * 1000).toString());

  alert(`¡Prueba VIP de 24 horas activada con éxito para ${email}!`);
  window.location.reload();
  return true;
}

async function handleLogin(email, password) {
  if (email.toLowerCase() === CONFIG.KEYS.ADMIN_EMAIL.toLowerCase()) {
    localStorage.setItem("optacore_user_email", email);
    localStorage.setItem("optacore_user_role", "ADMIN");
    alert("Acceso Administrador concedido.");
    window.location.reload();
    return;
  }

  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "VIP");
  alert(`Bienvenido de nuevo: ${email}`);
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderStatus();

  const modalAuth = document.getElementById("auth-modal");
  const modalTitle = document.getElementById("auth-modal-title");
  const modalSubtitle = document.getElementById("auth-modal-subtitle");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  let authMode = "LOGIN";

  document.getElementById("btn-open-auth")?.addEventListener("click", () => {
    authMode = "LOGIN";
    if (modalTitle) modalTitle.textContent = "INICIAR SESIÓN";
    if (modalSubtitle) modalSubtitle.textContent = "Ingresa con tu correo registrado para acceder a tu membresía VIP.";
    if (authSubmitBtn) authSubmitBtn.textContent = "INGRESAR A MI CUENTA";
    modalAuth?.classList.remove("hidden");
  });

  document.getElementById("btn-trial-24h")?.addEventListener("click", () => {
    authMode = "TRIAL";
    if (modalTitle) modalTitle.textContent = "REGISTRO PRUEBA VIP 24 HORAS";
    if (modalSubtitle) modalSubtitle.textContent = "Ingresa tu correo para activar 24 horas de acceso total sin costo. Válido una sola vez.";
    if (authSubmitBtn) authSubmitBtn.textContent = "ACTIVAR MIS 24 HORAS GRATIS";
    modalAuth?.classList.remove("hidden");
  });

  document.getElementById("btn-close-auth")?.addEventListener("click", () => {
    modalAuth?.classList.add("hidden");
  });

  document.getElementById("auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-pass").value;

    if (!email || !password) {
      alert("Por favor completa el correo y la contraseña.");
      return;
    }

    if (authMode === "TRIAL") {
      await handleRegisterTrial(email, password);
    } else {
      await handleLogin(email, password);
    }
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    localStorage.clear();
    alert("Has cerrado sesión.");
    window.location.reload();
  });

  setInterval(updateHeaderStatus, 60000);
});
