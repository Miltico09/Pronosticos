// ============================================================================
// ARCHIVO: auth.js
// Registro de Correo, Control Antifraude de 24h y Conexión con Supabase
// ============================================================================

import { CONFIG } from "./config.js";

// Inicialización de Supabase con las credenciales oficiales
const supabase = window.supabase
  ? window.supabase.createClient(CONFIG.KEYS.SUPABASE_URL, CONFIG.KEYS.SUPABASE_ANON_KEY)
  : null;

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

// Verifica si la membresía o prueba sigue vigente según el reloj exacto
export function isUserVipOrAdmin() {
  const role = localStorage.getItem("optacore_user_role");
  if (role === "ADMIN" || role === "VIP") return true;

  const expiresTimestamp = localStorage.getItem("optacore_vip_expires_timestamp");
  if (!expiresTimestamp) return false;

  const now = Date.now();
  const exp = parseInt(expiresTimestamp, 10);

  // Si ya pasaron las 24 horas, expira inmediatamente
  if (now >= exp) {
    localStorage.removeItem("optacore_vip_expires_timestamp");
    localStorage.removeItem("optacore_user_role");
    localStorage.removeItem("optacore_user_email");
    return false;
  }

  return true;
}

// Calcula cuántas horas y minutos le quedan de prueba
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

// Activa la prueba registrando en Supabase y marcando expiración de 24 horas
async function handleRegisterTrial(email, password) {
  const now = Date.now();
  const expiresAtDate = new Date(now + 24 * 60 * 60 * 1000); // 24 horas exactas

  // 1. Verificar en Supabase si ese correo ya usó su prueba
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("trial_used, role, vip_expires_at")
        .eq("email", email)
        .maybeSingle();

      if (existing && existing.trial_used) {
        alert("Este correo ya utilizó su prueba gratuita de 24 horas. Para continuar con acceso completo, solicita tu plan VIP por WhatsApp.");
        return false;
      }

      // Si no existe, registrar cuenta en Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError && !authError.message.includes("already registered")) {
        console.warn("Aviso Supabase Auth:", authError.message);
      }

      const userId = authData?.user?.id || crypto.randomUUID();
      const referralCode = "OPTA-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Guardar o actualizar registro en tabla profiles
      await supabase.from("profiles").upsert({
        id: userId,
        email: email,
        role: "PRUEBA_VIP",
        trial_used: true,
        vip_expires_at: expiresAtDate.toISOString(),
        referral_code: referralCode,
      });
    } catch (err) {
      console.warn("Fallo secundario al sincronizar con Supabase, operando con control local:", err);
    }
  }

  // 2. Guardar sesión y reloj de expiración en el almacenamiento local
  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "PRUEBA_VIP");
  localStorage.setItem("optacore_vip_expires_timestamp", (now + 24 * 60 * 60 * 1000).toString());

  alert(`¡Prueba VIP de 24 horas activada con éxito para ${email}! Tu acceso vencerá exactamente mañana a esta misma hora.`);
  window.location.reload();
  return true;
}

// Iniciar sesión con correo existente
async function handleLogin(email, password) {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, vip_expires_at, trial_used")
          .eq("email", email)
          .maybeSingle();

        if (profile) {
          const expTime = profile.vip_expires_at ? new Date(profile.vip_expires_at).getTime() : 0;
          if (expTime > Date.now()) {
            localStorage.setItem("optacore_user_email", email);
            localStorage.setItem("optacore_user_role", profile.role || "VIP");
            localStorage.setItem("optacore_vip_expires_timestamp", expTime.toString());
            alert(`Sesión iniciada. Tienes membresía activa.`);
            window.location.reload();
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Error en login remoto:", e);
    }
  }

  // Fallback si es el correo del admin configurado
  if (email.toLowerCase() === CONFIG.KEYS.ADMIN_EMAIL.toLowerCase()) {
    localStorage.setItem("optacore_user_email", email);
    localStorage.setItem("optacore_user_role", "ADMIN");
    alert("Acceso como Administrador.");
    window.location.reload();
    return;
  }

  // Inicio de sesión normal
  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "VIP");
  alert(`Bienvenido de nuevo: ${email}`);
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderStatus();

  // Modal de Autenticación
  const modalAuth = document.getElementById("auth-modal");
  const modalTitle = document.getElementById("auth-modal-title");
  const modalSubtitle = document.getElementById("auth-modal-subtitle");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const authForm = document.getElementById("auth-form");
  let authMode = "LOGIN"; // 'LOGIN' o 'TRIAL'

  // Abrir en Modo Iniciar Sesión
  document.getElementById("btn-open-auth")?.addEventListener("click", () => {
    authMode = "LOGIN";
    if (modalTitle) modalTitle.textContent = "INICIAR SESIÓN";
    if (modalSubtitle) modalSubtitle.textContent = "Ingresa con tu correo registrado para acceder a tu licencia VIP.";
    if (authSubmitBtn) authSubmitBtn.textContent = "INGRESAR A MI CUENTA";
    modalAuth?.classList.remove("hidden");
  });

  // Abrir en Modo Registro de Prueba 24h
  document.getElementById("btn-trial-24h")?.addEventListener("click", () => {
    authMode = "TRIAL";
    if (modalTitle) modalTitle.textContent = "REGISTRO PRUEBA VIP 24 HORAS";
    if (modalSubtitle) modalSubtitle.textContent = "Registra tu correo para activar 24 horas de acceso total sin costo. Válido una sola vez por usuario.";
    if (authSubmitBtn) authSubmitBtn.textContent = "ACTIVAR MIS 24 HORAS GRATIS";
    modalAuth?.classList.remove("hidden");
  });

  // Cerrar Modal
  document.getElementById("btn-close-auth")?.addEventListener("click", () => {
    modalAuth?.classList.add("hidden");
  });

  // Envío del Formulario
  authForm?.addEventListener("submit", async (e) => {
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

  // Cerrar Sesión
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    localStorage.clear();
    alert("Has cerrado sesión.");
    window.location.reload();
  });

  // Comprobar cada minuto si las 24 horas ya expiraron
  setInterval(updateHeaderStatus, 60000);
});
