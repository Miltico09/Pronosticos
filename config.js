// ============================================================================
// ARCHIVO: config.js
// Configuración Oficial OPTACORE.QUANT — Soporte WhatsApp Directo
// ============================================================================

export const CONFIG = {
  BRAND: {
    NAME: "OPTACORE.QUANT",
    TAGLINE: "TERMINAL DE PRONÓSTICOS DE ALTA PROBABILIDAD & ANÁLISIS BIOCLIMÁTICO",
    TIMEZONE: "America/Bogota",
    FREE_DAILY_LIMIT: 4, // 2 de 5 estrellas + 2 de 4 estrellas 100% abiertos
    TRIAL_HOURS: 24,
  },

  THEME: {
    BG_PRIMARY: "#05070a",
    BG_SURFACE: "#0a0e14",
    ACCENT_EMERALD: "#10b981",
    ACCENT_CYAN: "#06b6d4",
    ALERT_RED: "#ef4444",
  },

  KEYS: {
    SUPABASE_URL: "https://gmcurxhlxryrffcchfvo.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_XMYlOCNnVN8GblF78uvvEg_Elaw62TX",
    ADMIN_EMAIL: "admin@optacore.com",
  },

  NOTIFICATIONS: {
    WHATSAPP_NUMBER: "573332861551",
    WHATSAPP_LINK: "https://wa.me/573332861551?text=Hola%20OptaCore,%20quiero%20informaci%C3%B3n%20para%20activar%20mi%20membres%C3%ADa%20VIP",
  },

  PAYMENT_ACCOUNTS: {
    COLOMBIA: [
      {
        id: "nequi",
        method: "Nequi (Transferencia Directa)",
        accountNumber: "333 286 1551",
        holderName: "OptaCore Quant Desk",
        instructions: "Transfiere el valor del plan elegido y envía la captura aquí o al WhatsApp +57 3332861551.",
      },
      {
        id: "bancolombia",
        method: "Bancolombia — Ahorros",
        accountNumber: "000-000000-00",
        holderName: "OptaCore Quant Desk",
        instructions: "Consigna vía App o corresponsal y reporta tu comprobante para activación inmediata.",
      },
    ],
    INTERNACIONAL: [
      {
        id: "binance_pay",
        method: "Binance Pay / USDT",
        accountNumber: "ID: 884920114",
        holderName: "OptaCore_Quant",
        instructions: "Envía el valor en USDT y adjunta la captura de transacción exitosa.",
      },
    ],
  },

  VIP_PLANS: [
    { id: "semanal", name: "Semanal", days: 7, priceCop: 12000, discountPct: 0, savedCop: 0, badge: null },
    { id: "quincenal", name: "Quincenal", days: 15, priceCop: 20000, discountPct: 17, savedCop: 4000, badge: null },
    { id: "mensual", name: "Mensual", days: 30, priceCop: 36000, discountPct: 25, savedCop: 12000, badge: "MÁS POPULAR" },
    { id: "trimestral", name: "Trimestral", days: 90, priceCop: 60000, discountPct: 44, savedCop: 48000, badge: null },
    { id: "semestral", name: "Semestral", days: 180, priceCop: 100000, discountPct: 54, savedCop: 116000, badge: null },
    { id: "anual", name: "Anual", days: 365, priceCop: 150000, discountPct: 65, savedCop: 282000, badge: "MEJOR VALOR" },
  ],

  LEGAL_TEXTS: {
    DISCLAIMER: "AVISO: OPTACORE.QUANT provee análisis cuantitativo y probabilidades. No somos operadores de apuestas. Las estadísticas no garantizan rendimientos futuros.",
    AGE_WARNING: "EXCLUSIVO PARA MAYORES DE 18 AÑOS (+18).",
    TERMS: "Licencia de uso personal con control de sesión única por dispositivo.",
    PRIVACY: "Tus datos se manejan de forma confidencial para el control de acceso a tu suscripción.",
  },
};
