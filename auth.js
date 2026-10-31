// ============================================================================
// ARCHIVO: auth.js
// Códigos de Referido Únicos por Usuario + Control de Sesión
// ============================================================================

import { CONFIG } from "./config.js";

const supabase = window.supabase
  ? window.supabase.createClient(CONFIG.KEYS.SUPABASE_URL, CONFIG.KEYS.SUPABASE_ANON_KEY)
  : null;

// Genera un código alfanumérico único para cada correo registrado
function generateUniqueReferralCode(email) {
  const clean = email.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const seed = clean.substring(0, 4) || "USER";
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OPTA-${seed}-${randomHex}`;
}

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

// Actualiza la interfaz y el estado de referidos
export function updateHeaderStatus() {
  const badge = document.getElementById("user-role-badge");
  const roleText = document.getElementById("account-role-text");
  const expiresText = document.getElementById("account-expires-text");
  const emailText = document.getElementById("account-email-text");
  const btnTrial = document.getElementById("btn-trial-24h");
  const btnAuth = document.getElementById("btn-open-auth");
  const btnLogout = document.getElementById("btn-logout");

  // Elementos de la caja de referidos
  const referralCardContainer = document.getElementById("referral-card-container");

  const email = localStorage.getItem("optacore_user_email");
  const remaining = getRemainingTrialTime();
  const isLoggedIn = !!email;

  // 1. Manejo de la caja de referidos: solo visible si inició sesión
  if (referralCardContainer) {
    if (isLoggedIn) {
      let refCode = localStorage.getItem("optacore_user_referral_code");
      if (!refCode) {
        refCode = generateUniqueReferralCode(email);
        localStorage.setItem("optacore_user_referral_code", refCode);
      }

      referralCardContainer.innerHTML = `
        <div class="quant-card p-4 space-y-3 font-mono text-xs border-emerald-500/40">
          <div class="flex items-center justify-between border-b border-[#1b2432] pb-2">
            <h3 class="text-xs font-bold uppercase text-[#10b981]">Tu Enlace Único de Referidos (+20% Días)</h3>
            <span class="text-[10px] text-emerald-400 font-bold bg-[#10b981]/15 px-2 py-0.5 border border-[#10b981]/30">ACTIVO</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Comparte tu enlace personal. Cada vez que alguien active un plan con tu código, recibes el <strong>20% en días VIP</strong> redondeado hacia arriba (Ej: Semanal = +2 días, Mensual = +6 días, Anual = +73 días).
          </p>
          <div class="p-2.5 bg-[#05070a] border border-[#1b2432] flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-[9px] text-slate-400 block">TU CÓDIGO ÚNICO:</span>
              <span class="text-sm font-black text-cyan-400 tracking-wider">${refCode}</span>
            </div>
            <button onclick="navigator.clipboard.writeText('${window.location.origin}?ref=${refCode}'); alert('Enlace único copiado: ${window.location.origin}?ref=${refCode}')" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border border-cyan-400 text-cyan-300 text-[11px] font-bold uppercase transition">
              📋 Copiar Mi Enlace
            </button>
          </div>
        </div>
      `;
    } else {
      referralCardContainer.innerHTML = `
        <div class="quant-card p-4 space-y-2.5 font-mono text-xs border-[#1b2432] bg-[#070a0e]">
          <h3 class="text-xs font-bold uppercase text-slate-400 border-b border-[#1b2432] pb-2">Programa de Referidos (+20% Días VIP)</h3>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            Para obtener tu código personal y ganar días VIP invitando amigos, primero debes iniciar sesión o registrar tu prueba gratuita.
          </p>
          <button onclick="document.getElementById('btn-open-auth').click()" class="w-full py-2 bg-[#0a0e14] border border-[#1b2432] hover:border-cyan-400 text-cyan-300 font-bold uppercase text-[10px] transition">
            🔒 Iniciar Sesión para Desbloquear mi Código
          </button>
        </div>
      `;
    }
  }

  // 2. Manejo de cabecera y sesión
  if (isUserVipOrAdmin()) {
    const role = localStorage.getItem("optacore_user_role") || "PRUEBA_VIP";
    if (badge) {
      badge.textContent = remaining ? `PRUEBA VIP 24H (${remaining.toUpperCase()})` : "MEMBRESÍA VIP ACTIVA";
      badge.className = "px-2 py-0.5 border border-[#10b981] bg-[#10b981]/20 text-[#10b981] font-bold";
    }
    if (roleText) roleText.textContent = role === "PRUEBA_VIP" ? "PRUEBA VIP 24 HORAS" : "MIEMBRO VIP";
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
    if (emailText) emailText.textContent = email || "No registrado";

    if (btnTrial) btnTrial.classList.remove("hidden");
    if (btnAuth) btnAuth.classList.remove("hidden");
    if (btnLogout) btnLogout.classList.add("hidden");
  }
}

async function handleRegisterTrial(email, password) {
  const now = Date.now();
  const expiresAtDate = new Date(now + 24 * 60 * 60 * 1000);
  const userRefCode = generateUniqueReferralCode(email);

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
        referral_code: userRefCode,
      });
    } catch (err) {
      console.warn("Aviso conexión Supabase:", err);
    }
  }

  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "PRUEBA_VIP");
  localStorage.setItem("optacore_user_referral_code", userRefCode);
  localStorage.setItem("optacore_vip_expires_timestamp", (now + 24 * 60 * 60 * 1000).toString());

  alert(`¡Prueba VIP de 24 horas activada para ${email}! Tu código único de referido es: ${userRefCode}`);
  window.location.reload();
  return true;
}

async function handleLogin(email, password) {
  let userRefCode = generateUniqueReferralCode(email);

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, vip_expires_at, referral_code")
          .eq("email", email)
          .maybeSingle();

        if (profile?.referral_code) {
          userRefCode = profile.referral_code;
        }
      }
    } catch (e) {
      console.warn("Aviso login Supabase:", e);
    }
  }

  if (email.toLowerCase() === CONFIG.KEYS.ADMIN_EMAIL.toLowerCase()) {
    localStorage.setItem("optacore_user_email", email);
    localStorage.setItem("optacore_user_role", "ADMIN");
    localStorage.setItem("optacore_user_referral_code", userRefCode);
    alert("Acceso Administrador concedido.");
    window.location.reload();
    return;
  }

  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "VIP");
  localStorage.setItem("optacore_user_referral_code", userRefCode);
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
    if (modalSubtitle) modalSubtitle.textContent = "Ingresa con tu correo registrado para ver tu código de referido y membresía.";
    if (authSubmitBtn) authSubmitBtn.textContent = "INGRESAR A MI CUENTA";
    modalAuth?.classList.remove("hidden");
  });

  document.getElementById("btn-trial-24h")?.addEventListener("click", () => {
    authMode = "TRIAL";
    if (modalTitle) modalTitle.textContent = "REGISTRO PRUEBA VIP 24 HORAS";
    if (modalSubtitle) modalSubtitle.textContent = "Ingresa tu correo para activar 24 horas gratis y obtener tu enlace personal de referidos.";
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
