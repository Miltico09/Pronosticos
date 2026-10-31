// ============================================================================
// ARCHIVO: auth.js
// Gestiona Login, Sesión Única por Dispositivo, Prueba VIP 24h, Expiración y Referidos
// ============================================================================

import { CONFIG } from "./config.js";

const STORAGE_KEY = "optacore_user_state_v1";

// Inicialización de cliente Supabase (si las llaves están configuradas)
export const supabase =
  window.supabase && CONFIG.KEYS.SUPABASE_URL.startsWith("https://") && !CONFIG.KEYS.SUPABASE_URL.includes("tu-proyecto")
    ? window.supabase.createClient(CONFIG.KEYS.SUPABASE_URL, CONFIG.KEYS.SUPABASE_ANON_KEY)
    : null;

export let currentUser = loadUserSession();

function generateToken() {
  return "SESS-" + Math.random().toString(36).substring(2, 11).toUpperCase() + "-" + Date.now();
}

function generateReferralCode(email) {
  const prefix = email.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  return `OPTA-${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

function loadUserSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      isLoggedIn: false,
      email: "invitado@optacore.com",
      role: "GRATIS", // GRATIS | PRUEBA_VIP | VIP | ADMIN
      vipExpiresAt: null,
      trialUsed: false,
      sessionToken: null,
      referralCode: "OPTA-INVITADO",
      referredBy: null,
    };
  }
  const user = JSON.parse(raw);
  return verifyVipExpiration(user);
}

// Verifica automáticamente si la licencia VIP o Prueba 24h ya venció
export function verifyVipExpiration(user) {
  if ((user.role === "VIP" || user.role === "PRUEBA_VIP") && user.vipExpiresAt) {
    const now = new Date();
    const exp = new Date(user.vipExpiresAt);
    if (now >= exp) {
      user.role = "GRATIS";
      user.vipExpiresAt = null;
      saveUserSession(user);
    }
  }
  return user;
}

export function saveUserSession(user) {
  currentUser = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  updateAuthUI();
  window.dispatchEvent(new CustomEvent("optacore:auth-changed", { detail: user }));
}

export function isUserVipOrAdmin() {
  verifyVipExpiration(currentUser);
  return (
    currentUser.role === "VIP" ||
    currentUser.role === "PRUEBA_VIP" ||
    currentUser.role === "ADMIN"
  );
}

// Validador de Sesión Única: Si otro dispositivo inició sesión con esta cuenta, cierra la anterior
export async function checkSingleDeviceSession() {
  if (!currentUser.isLoggedIn || !supabase) return;
  const { data } = await supabase
    .from("profiles")
    .select("active_session_token, role, vip_expires_at")
    .eq("email", currentUser.email)
    .single();

  if (data && data.active_session_token && data.active_session_token !== currentUser.sessionToken) {
    alert("Se detectó un inicio de sesión en otro dispositivo. Por seguridad de licencia única, esta sesión se ha cerrado.");
    logoutUser();
  }
}

// Activar Prueba VIP gratuita de 24 horas (1 sola vez por cuenta)
export function activate24hTrial() {
  if (!currentUser.isLoggedIn) {
    document.getElementById("auth-modal").classList.remove("hidden");
    return;
  }
  if (currentUser.trialUsed) {
    alert("Tu cuenta ya utilizó la Prueba VIP gratuita de 24 horas. Elige un plan VIP para continuar con acceso ilimitado.");
    switchTab("tab-planes");
    return;
  }
  if (currentUser.role === "VIP" || currentUser.role === "ADMIN") {
    alert("Ya tienes una licencia VIP activa.");
    return;
  }

  const expires = new Date(Date.now() + CONFIG.BRAND.TRIAL_HOURS * 3600 * 1000).toISOString();
  currentUser.role = "PRUEBA_VIP";
  currentUser.vipExpiresAt = expires;
  currentUser.trialUsed = true;
  saveUserSession(currentUser);
  alert("¡Prueba VIP de 24 horas activada! Tienes acceso completo a todos los pronósticos e indicadores de altura/clima.");
}

export function loginOrRegister(email, password, referralInput, isRegister = false) {
  const cleanEmail = email.trim().toLowerCase();
  const newToken = generateToken();
  const isAdmin = cleanEmail === CONFIG.KEYS.ADMIN_EMAIL.toLowerCase() || cleanEmail === "admin@optacore.com";

  // Si ya tenía datos guardados para ese correo, los recuperamos
  const allUsers = JSON.parse(localStorage.getItem("optacore_users_db") || "[]");
  let existing = allUsers.find((u) => u.email === cleanEmail);

  if (!existing) {
    existing = {
      isLoggedIn: true,
      email: cleanEmail,
      role: isAdmin ? "ADMIN" : "GRATIS",
      vipExpiresAt: isAdmin ? new Date(Date.now() + 365 * 86400000).toISOString() : null,
      trialUsed: false,
      sessionToken: newToken,
      referralCode: generateReferralCode(cleanEmail),
      referredBy: referralInput ? referralInput.trim().toUpperCase() : null,
      createdAt: new Date().toISOString(),
    };
    allUsers.push(existing);
  } else {
    // Reemplaza el token anterior para invalidar sesiones en otros dispositivos
    existing.isLoggedIn = true;
    existing.sessionToken = newToken;
    if (isAdmin) existing.role = "ADMIN";
  }

  localStorage.setItem("optacore_users_db", JSON.stringify(allUsers));
  saveUserSession(existing);
  document.getElementById("auth-modal").classList.add("hidden");
}

export function logoutUser() {
  const reset = {
    isLoggedIn: false,
    email: "invitado@optacore.com",
    role: "GRATIS",
    vipExpiresAt: null,
    trialUsed: false,
    sessionToken: null,
    referralCode: "OPTA-INVITADO",
    referredBy: null,
  };
  saveUserSession(reset);
}

export function switchTab(tabId) {
  document.querySelectorAll(".tab-panel").forEach((el) => el.classList.add("hidden"));
  const target = document.getElementById(tabId);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("border-[#06b6d4]", "bg-[#06b6d4]/15", "text-white");
      btn.classList.remove("border-[#1b2432]", "text-[#8b9bb4]");
    } else if (btn.dataset.tab !== "tab-planes" && btn.dataset.tab !== "tab-admin") {
      btn.classList.remove("border-[#06b6d4]", "bg-[#06b6d4]/15", "text-white");
      btn.classList.add("border-[#1b2432]", "text-[#8b9bb4]");
    }
  });
}

// Verifica si faltan <= 3 días para vencer el VIP y muestra el banner rojo de aviso
function checkExpiryWarningBanner() {
  const banner = document.getElementById("expiry-alert-banner");
  if (!banner) return;

  if (!currentUser.vipExpiresAt || (currentUser.role !== "VIP" && currentUser.role !== "PRUEBA_VIP")) {
    banner.classList.add("hidden");
    return;
  }

  const msLeft = new Date(currentUser.vipExpiresAt).getTime() - Date.now();
  const daysLeft = msLeft / (1000 * 3600 * 24);

  if (daysLeft <= 0.5) {
    banner.innerHTML = `⚠️ AVISO CRÍTICO: Tu licencia ${currentUser.role} vence HOY (${new Date(currentUser.vipExpiresAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}). Renueva en "Planes VIP & Pagos" para no perder el acceso.`;
    banner.classList.remove("hidden");
  } else if (daysLeft <= 3) {
    banner.innerHTML = `🔔 AVISO DE RENOVACIÓN: Tu licencia VIP vence en ${Math.ceil(daysLeft)} día(s). Renueva con anticipación en la pestaña Planes VIP.`;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

export function updateAuthUI() {
  verifyVipExpiration(currentUser);
  checkExpiryWarningBanner();

  const roleBadge = document.getElementById("user-role-badge");
  const expiryLabel = document.getElementById("user-expiry-label");
  const btnTrial = document.getElementById("btn-trial-24h");
  const btnOpenAuth = document.getElementById("btn-open-auth");
  const btnLogout = document.getElementById("btn-logout");
  const btnAdmin = document.getElementById("btn-nav-admin");
  const quotaNotice = document.getElementById("free-quota-notice");

  if (roleBadge) {
    roleBadge.textContent = currentUser.isLoggedIn
      ? `${currentUser.email} // LICENCIA: ${currentUser.role}`
      : "MODO VISITANTE: GRATIS (5 DIAMANTE/DÍA)";
  }

  if (currentUser.vipExpiresAt && (currentUser.role === "VIP" || currentUser.role === "PRUEBA_VIP")) {
    expiryLabel.textContent = `VENCE: ${new Date(currentUser.vipExpiresAt).toLocaleDateString("es-CO")} ${new Date(currentUser.vipExpiresAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
    expiryLabel.classList.remove("hidden");
  } else {
    expiryLabel?.classList.add("hidden");
  }

  if (currentUser.role === "ADMIN") {
    btnAdmin?.classList.remove("hidden");
  } else {
    btnAdmin?.classList.add("hidden");
  }

  if (isUserVipOrAdmin()) {
    btnTrial?.classList.add("hidden");
    if (quotaNotice) {
      quotaNotice.innerHTML = `<span class="text-[#10b981] font-bold">✔ LICENCIA VIP ACTIVA:</span> Visualizando el 100% de los pronósticos del día + Telemetría Bioclimática L10, Altitud (Δm) y Explosividad 1T/2T desbloqueada.`;
    }
  } else {
    if (!currentUser.trialUsed) btnTrial?.classList.remove("hidden");
    else btnTrial?.classList.add("hidden");
    if (quotaNotice) {
      quotaNotice.textContent =
        "Modo Gratis: Visualizando exactamente 5 pronósticos Diamante del día. Los indicadores de altitud, estadísticas L10 y mitades están bloqueados con candado.";
    }
  }

  if (currentUser.isLoggedIn) {
    btnOpenAuth?.classList.add("hidden");
    btnLogout?.classList.remove("hidden");
  } else {
    btnOpenAuth?.classList.remove("hidden");
    btnLogout?.classList.add("hidden");
  }

  // Detalles en pestaña Mi Licencia
  const licDetails = document.getElementById("account-license-details");
  if (licDetails) {
    licDetails.innerHTML = `
      <div><span class="text-[#8b9bb4]">USUARIO:</span> <strong class="text-white">${currentUser.email}</strong></div>
      <div><span class="text-[#8b9bb4]">NIVEL DE LICENCIA:</span> <strong class="text-[#10b981]">${currentUser.role}</strong></div>
      <div><span class="text-[#8b9bb4]">VENCIMIENTO VIP:</span> <strong class="text-cyan-300">${currentUser.vipExpiresAt ? new Date(currentUser.vipExpiresAt).toLocaleString("es-CO") : "Sin plan activo"}</strong></div>
      <div><span class="text-[#8b9bb4]">TOKEN DE SESIÓN ÚNICA:</span> <span class="text-slate-400">${currentUser.sessionToken || "N/A"}</span></div>
      <div><span class="text-[#8b9bb4]">PRUEBA 24H USADA:</span> <span>${currentUser.trialUsed ? "Sí (Agotada)" : "Disponible"}</span></div>
    `;
  }

  const refCodeEl = document.getElementById("my-referral-code");
  if (refCodeEl) refCodeEl.textContent = currentUser.referralCode;
}

// Inicialización de eventos DOM
document.addEventListener("DOMContentLoaded", () => {
  // Cargar textos legales desde config.js
  document.getElementById("legal-disclaimer").textContent = CONFIG.LEGAL_TEXTS.DISCLAIMER;
  document.getElementById("legal-age-badge").textContent = CONFIG.LEGAL_TEXTS.AGE_WARNING;
  document.getElementById("legal-terms").textContent = CONFIG.LEGAL_TEXTS.TERMS;
  document.getElementById("legal-privacy").textContent = CONFIG.LEGAL_TEXTS.PRIVACY;
  document.getElementById("link-tg-vip").href = `https://t.me/${CONFIG.NOTIFICATIONS.TELEGRAM_VIP_CHANNEL_ID.replace("@", "")}`;
  document.getElementById("link-wa-vip").href = CONFIG.NOTIFICATIONS.WHATSAPP_VIP_CHANNEL_URL;

  // Navegación por pestañas
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.getElementById("btn-trial-24h")?.addEventListener("click", activate24hTrial);
  document.getElementById("btn-open-auth")?.addEventListener("click", () => {
    document.getElementById("auth-modal").classList.remove("hidden");
  });
  document.getElementById("btn-close-auth")?.addEventListener("click", () => {
    document.getElementById("auth-modal").classList.add("hidden");
  });
  document.getElementById("btn-logout")?.addEventListener("click", logoutUser);

  document.getElementById("auth-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const pass = document.getElementById("auth-pass").value;
    const ref = document.getElementById("auth-ref").value;
    loginOrRegister(email, pass, ref, false);
  });

  document.getElementById("btn-register")?.addEventListener("click", () => {
    const email = document.getElementById("auth-email").value;
    const pass = document.getElementById("auth-pass").value;
    const ref = document.getElementById("auth-ref").value;
    if (!email || !pass) {
      alert("Ingresa tu correo y contraseña para crear tu cuenta.");
      return;
    }
    loginOrRegister(email, pass, ref, true);
  });

  document.getElementById("btn-google-login")?.addEventListener("click", async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } else {
      loginOrRegister("usuario.google@gmail.com", "oauth", "", false);
    }
  });

  document.getElementById("btn-copy-ref")?.addEventListener("click", () => {
    const url = `${window.location.origin}?ref=${currentUser.referralCode}`;
    navigator.clipboard?.writeText(url);
    alert(`Enlace de referido copiado: ${url}`);
  });

  updateAuthUI();
  setInterval(checkSingleDeviceSession, 30000);
});
