// ============================================================================
// ARCHIVO: auth.js
// Autenticación Real, Huella de Dispositivo, Bloqueo de Multicuentas y Admin
// ============================================================================

import { CONFIG } from "./config.js";

const supabase = window.supabase
  ? window.supabase.createClient(CONFIG.KEYS.SUPABASE_URL, CONFIG.KEYS.SUPABASE_ANON_KEY)
  : null;

const DISPOSABLE_DOMAINS = [
  "yopmail.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "mailinator.com", "throwawaymail.com", "getnada.com", "sharklasers.com",
  "trashmail.com", "temp-mail.org", "mohmal.com", "dispostable.com"
];

function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return DISPOSABLE_DOMAINS.some((d) => domain.includes(d));
}

function getDeviceFingerprint() {
  let fp = localStorage.getItem("optacore_device_fp");
  if (!fp) {
    const raw = [
      navigator.userAgent,
      screen.width + "x" + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language
    ].join("|");
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    fp = "DEV-" + Math.abs(hash).toString(16).toUpperCase();
    localStorage.setItem("optacore_device_fp", fp);
  }
  return fp;
}

function generateUniqueReferralCode(email) {
  const clean = email.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const seed = clean.substring(0, 4) || "USER";
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OPTA-${seed}-${randomHex}`;
}

export function isUserAdmin() {
  const role = localStorage.getItem("optacore_user_role");
  const email = (localStorage.getItem("optacore_user_email") || "").toLowerCase();
  return role === "ADMIN" || email === CONFIG.KEYS.ADMIN_EMAIL.toLowerCase();
}

export function isUserVipOrAdmin() {
  if (isUserAdmin()) return true;
  const role = localStorage.getItem("optacore_user_role");
  if (role === "VIP") return true;

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

export function updateHeaderStatus() {
  const badge = document.getElementById("user-role-badge");
  const roleText = document.getElementById("account-role-text");
  const expiresText = document.getElementById("account-expires-text");
  const emailText = document.getElementById("account-email-text");
  const btnTrial = document.getElementById("btn-trial-24h");
  const btnRegister = document.getElementById("btn-open-register");
  const btnAuth = document.getElementById("btn-open-auth");
  const btnLogout = document.getElementById("btn-logout");
  const btnAdminNav = document.getElementById("btn-nav-admin");
  const referralCardContainer = document.getElementById("referral-card-container");

  const email = localStorage.getItem("optacore_user_email");
  const remaining = getRemainingTrialTime();
  const isLoggedIn = !!email;

  if (btnAdminNav) {
    if (isUserAdmin()) btnAdminNav.classList.remove("hidden");
    else btnAdminNav.classList.add("hidden");
  }

  if (referralCardContainer) {
    if (isLoggedIn) {
      let refCode = localStorage.getItem("optacore_user_referral_code");
      if (!refCode) {
        refCode = generateUniqueReferralCode(email);
        localStorage.setItem("optacore_user_referral_code", refCode);
      }

      const totalEarnedDays = Number(localStorage.getItem("optacore_referral_days_earned") || 0);

      referralCardContainer.innerHTML = `
        <div class="quant-card p-4 space-y-3 font-mono text-xs border-emerald-500/40">
          <div class="flex items-center justify-between border-b border-[#1b2432] pb-2">
            <h3 class="text-xs font-bold uppercase text-[#10b981]">Billetera de Referidos (+20% Días VIP)</h3>
            <span class="text-[10px] text-emerald-400 font-bold bg-[#10b981]/15 px-2 py-0.5 border border-[#10b981]/30">ACTIVO</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Comparte tu enlace. Si un amigo activa un plan con tu código, recibes el <strong>20% en días VIP</strong> redondeado hacia arriba (Ej: Semanal = +2 días, Mensual = +6 días, Anual = +73 días).
          </p>
          <div class="p-2.5 bg-[#05070a] border border-[#1b2432] flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-[9px] text-slate-400 block">TU CÓDIGO ÚNICO:</span>
              <span class="text-sm font-black text-cyan-400 tracking-wider">${refCode}</span>
            </div>
            <button onclick="navigator.clipboard.writeText('${window.location.origin}?ref=${refCode}'); alert('Enlace copiado al portapapeles')" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border border-cyan-400 text-cyan-300 text-[11px] font-bold uppercase transition">
              📋 Copiar Mi Enlace
            </button>
          </div>
          <div class="p-2.5 bg-[#070e17] border border-cyan-500/30 flex items-center justify-between">
            <span class="text-slate-400 text-[11px]">Días acumulados ganados por referidos:</span>
            <span class="text-sm font-black text-[#10b981]">+${totalEarnedDays} Días</span>
          </div>
        </div>
      `;
    } else {
      referralCardContainer.innerHTML = `
        <div class="quant-card p-4 space-y-2.5 font-mono text-xs border-[#1b2432] bg-[#070a0e]">
          <h3 class="text-xs font-bold uppercase text-slate-400 border-b border-[#1b2432] pb-2">Programa de Referidos (+20% Días VIP)</h3>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            Para obtener tu código personal y ganar días VIP invitando amigos, primero debes registrarte o iniciar sesión.
          </p>
          <button onclick="document.getElementById('btn-open-register').click()" class="w-full py-2 bg-[#0a0e14] border border-[#1b2432] hover:border-cyan-400 text-cyan-300 font-bold uppercase text-[10px] transition">
            🔒 Regístrate para Desbloquear tu Código
          </button>
        </div>
      `;
    }
  }

  if (isLoggedIn) {
    if (btnRegister) btnRegister.classList.add("hidden");
    if (btnAuth) btnAuth.classList.add("hidden");
    if (btnLogout) btnLogout.classList.remove("hidden");
    if (emailText) emailText.textContent = email;

    if (isUserVipOrAdmin()) {
      const role = localStorage.getItem("optacore_user_role") || "PRUEBA_VIP";
      if (badge) {
        badge.textContent = isUserAdmin()
          ? "MODO ADMINISTRADOR ACTIVO"
          : remaining
          ? `PRUEBA VIP 24H (${remaining.toUpperCase()})`
          : "MEMBRESÍA VIP ACTIVA";
        badge.className = "px-2 py-0.5 border border-[#10b981] bg-[#10b981]/20 text-[#10b981] font-bold";
      }
      if (roleText) roleText.textContent = isUserAdmin() ? "ADMINISTRADOR" : role === "PRUEBA_VIP" ? "PRUEBA VIP 24 HORAS" : "MIEMBRO VIP";
      if (expiresText) expiresText.textContent = remaining ? `Expira en: ${remaining}` : "Vigencia activa";
      if (btnTrial) btnTrial.classList.add("hidden");
    } else {
      if (badge) {
        badge.textContent = "CUENTA REGISTRADA // MODO LIBRE";
        badge.className = "px-2 py-0.5 border border-[#1b2432] bg-[#0a0e14] text-slate-300 font-bold";
      }
      if (roleText) roleText.textContent = "USUARIO REGISTRADO";
      if (expiresText) expiresText.textContent = "Sin membresía activa";
      if (btnTrial) btnTrial.classList.remove("hidden");
    }
  } else {
    if (badge) {
      badge.textContent = "ACCESO LIBRE // 4 JUGADAS GRATIS HOY";
      badge.className = "px-2 py-0.5 border border-[#1b2432] bg-[#0a0e14] text-slate-300 font-bold";
    }
    if (roleText) roleText.textContent = "ACCESO LIBRE";
    if (expiresText) expiresText.textContent = "Sin límite en jugadas gratuitas";
    if (emailText) emailText.textContent = "No registrado";

    if (btnRegister) btnRegister.classList.remove("hidden");
    if (btnAuth) btnAuth.classList.remove("hidden");
    if (btnLogout) btnLogout.classList.add("hidden");
    if (btnTrial) btnTrial.classList.remove("hidden");
  }
}

async function handleUserRegister(email, password) {
  if (isDisposableEmail(email)) {
    alert("⛔ SEGURIDAD OPTACORE:\nNo se permiten correos temporales o desechables (Yopmail, TempMail, etc.). Por favor utiliza tu correo personal oficial.");
    return;
  }

  if (!supabase) {
    alert("Error de conexión a la base de datos.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("already registered")) {
      alert("Este correo ya se encuentra registrado. Pulsa en 'Entrar' para iniciar sesión.");
    } else {
      alert("Error al registrar: " + error.message);
    }
    return;
  }

  const userId = data?.user?.id || crypto.randomUUID();
  const userRefCode = generateUniqueReferralCode(email);

  await supabase.from("profiles").upsert({
    id: userId,
    email: email,
    role: "USER",
    trial_used: false,
    referral_code: userRefCode,
  });

  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", "USER");
  localStorage.setItem("optacore_user_referral_code", userRefCode);

  alert(`¡Cuenta creada con éxito para ${email}! Ya puedes pulsar en 'Prueba 24h' para activar tu acceso.`);
  window.location.reload();
}

async function handleUserLogin(email, password) {
  if (!supabase) return;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Contraseña o correo incorrectos. Acceso denegado.");
    return;
  }

  const user = data.user;
  let userRefCode = generateUniqueReferralCode(email);
  let userRole = "USER";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, vip_expires_at, referral_code")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    if (profile.referral_code) userRefCode = profile.referral_code;
    const expTime = profile.vip_expires_at ? new Date(profile.vip_expires_at).getTime() : 0;

    if (expTime > Date.now()) {
      userRole = profile.role || "VIP";
      localStorage.setItem("optacore_vip_expires_timestamp", expTime.toString());
    }
  }

  if (email.toLowerCase() === CONFIG.KEYS.ADMIN_EMAIL.toLowerCase()) {
    userRole = "ADMIN";
  }

  localStorage.setItem("optacore_user_email", email);
  localStorage.setItem("optacore_user_role", userRole);
  localStorage.setItem("optacore_user_referral_code", userRefCode);

  alert(`Bienvenido de nuevo: ${email}`);
  window.location.reload();
}

async function handleClaimTrial() {
  const email = localStorage.getItem("optacore_user_email");

  if (!email) {
    alert("🔒 REGISTRO REQUERIDO:\nDebes registrarte e iniciar sesión antes de activar tus 24 horas de prueba VIP.");
    document.getElementById("btn-open-register")?.click();
    return;
  }

  const deviceClaimed = localStorage.getItem("optacore_device_trial_claimed");
  const fp = getDeviceFingerprint();
  if (deviceClaimed) {
    alert(`⛔ CONTROL ANTIFRAUDE (${fp}):\nEste dispositivo ya reclamó una prueba de 24 horas con la cuenta ${deviceClaimed}. Solo se permite una prueba por dispositivo.`);
    return;
  }

  if (!supabase) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_used")
    .eq("email", email)
    .maybeSingle();

  if (profile && profile.trial_used) {
    alert("Tu correo ya utilizó sus 24 horas de prueba VIP gratuitas.");
    return;
  }

  const now = Date.now();
  const expiresAt = new Date(now + 24 * 60 * 60 * 1000);

  await supabase
    .from("profiles")
    .update({
      role: "PRUEBA_VIP",
      trial_used: true,
      vip_expires_at: expiresAt.toISOString(),
    })
    .eq("email", email);

  localStorage.setItem("optacore_user_role", "PRUEBA_VIP");
  localStorage.setItem("optacore_vip_expires_timestamp", expiresAt.getTime().toString());
  localStorage.setItem("optacore_device_trial_claimed", email);

  alert(`¡24 horas de prueba VIP activadas con éxito para ${email}!`);
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderStatus();

  const modalAuth = document.getElementById("auth-modal");
  const modalTitle = document.getElementById("auth-modal-title");
  const modalSubtitle = document.getElementById("auth-modal-subtitle");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const toggleBtn = document.getElementById("btn-toggle-auth-mode");
  let currentAuthMode = "REGISTER";

  function setAuthMode(mode) {
    currentAuthMode = mode;
    if (mode === "REGISTER") {
      if (modalTitle) modalTitle.textContent = "REGISTRO DE USUARIO";
      if (modalSubtitle) modalSubtitle.textContent = "Ingresa tu correo oficial y define tu contraseña segura (mín. 6 caracteres).";
      if (authSubmitBtn) authSubmitBtn.textContent = "CREAR MI CUENTA";
      if (toggleBtn) toggleBtn.textContent = "¿Ya tienes cuenta? Inicia sesión aquí";
    } else {
      if (modalTitle) modalTitle.textContent = "INICIAR SESIÓN";
      if (modalSubtitle) modalSubtitle.textContent = "Ingresa con tu correo y contraseña registrados.";
      if (authSubmitBtn) authSubmitBtn.textContent = "ENTRAR A MI CUENTA";
      if (toggleBtn) toggleBtn.textContent = "¿No tienes cuenta aún? Regístrate aquí";
    }
  }

  document.getElementById("btn-open-register")?.addEventListener("click", () => {
    setAuthMode("REGISTER");
    modalAuth?.classList.remove("hidden");
  });

  document.getElementById("btn-open-auth")?.addEventListener("click", () => {
    setAuthMode("LOGIN");
    modalAuth?.classList.remove("hidden");
  });

  toggleBtn?.addEventListener("click", () => {
    setAuthMode(currentAuthMode === "REGISTER" ? "LOGIN" : "REGISTER");
  });

  document.getElementById("btn-trial-24h")?.addEventListener("click", handleClaimTrial);

  document.getElementById("btn-close-auth")?.addEventListener("click", () => {
    modalAuth?.classList.add("hidden");
  });

  document.getElementById("auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-pass").value;

    if (!email || !password) return;

    if (currentAuthMode === "REGISTER") {
      await handleUserRegister(email, password);
    } else {
      await handleUserLogin(email, password);
    }
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    localStorage.removeItem("optacore_user_email");
    localStorage.removeItem("optacore_user_role");
    localStorage.removeItem("optacore_vip_expires_timestamp");
    alert("Has cerrado sesión.");
    window.location.reload();
  });

  setInterval(updateHeaderStatus, 60000);
});
