// ============================================================================
// ARCHIVO: config.js
// TRM Oficial Vigente ($3.182,99 COP) y Enlace Institucional de WhatsApp
// ============================================================================

export const CONFIG = {
  BRAND: {
    NAME: "OPTACORE.QUANT",
    TAGLINE: "PRONÓSTICOS DE ALTA PROBABILIDAD",
    TIMEZONE: "America/Bogota",
    FREE_DAILY_LIMIT: 4,
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
    SPORTS_API_HOST: "v3.football.api-sports.io",
    SPORTS_API_KEY: "0d242e4cfb0ebf2bca5b089f6bfe2b92",
    ADMIN_EMAIL: "admin@optacore.com",
  },

  NOTIFICATIONS: {
    WHATSAPP_NUMBER: "+573332861551",
    WHATSAPP_LINK: "https://wa.me/573332861551?text=Hola%20equipo%20OptaCore,%20deseo%20activar%20mi%20membres%C3%ADa%20VIP%20en%20la%20plataforma",
  },

  PAYMENT_ACCOUNTS: {
    COLOMBIA: [
      {
        id: "nequi",
        method: "Nequi (Transferencia Directa)",
        accountNumber: "3332861551",
        holderName: "OptaCore Quant Desk",
        instructions: "Transfiere desde tu app Nequi y envía el comprobante al WhatsApp de la plataforma (+57 333 286 1551).",
      },
      {
        id: "bancolombia",
        method: "Bancolombia — Cuenta de Ahorros",
        accountNumber: "912-417-09219",
        holderName: "OptaCore Quant Desk",
        instructions: "Consigna vía App Bancolombia o corresponsal bancario y remite el comprobante a soporte.",
      },
    ],
    INTERNACIONAL: [
      {
        id: "binance_pay",
        method: "Binance Pay (Cero Comisión)",
        accountNumber: "UID: 204199989",
        holderName: "OptaCore_Quant",
        instructions: "Envía el valor exacto en USDT mediante Binance Pay al UID indicado y remite la orden completada.",
      },
      {
        id: "usdt_bep20",
        method: "USDT (Red BNB Smart Chain / BEP-20)",
        accountNumber: "0x595ee53c2c28628325f9baf6bb565ab7e34eec07",
        holderName: "Red: BEP-20 (BSC)",
        instructions: "Verifica que la red de envío sea BEP-20. Sube la captura con el TXID visible.",
      },
    ],
  },

  // Planes calculados con base en la TRM oficial de $3.182,99 COP
  VIP_PLANS: [
    { id: "semanal", name: "Semanal", days: 7, priceCop: 12000, priceUsdt: 3.77, discountPct: 0, savedCop: 0, badge: null },
    { id: "quincenal", name: "Quincenal", days: 15, priceCop: 20000, priceUsdt: 6.28, discountPct: 17, savedCop: 4000, badge: null },
    { id: "mensual", name: "Mensual", days: 30, priceCop: 36000, priceUsdt: 11.31, discountPct: 25, savedCop: 12000, badge: "MÁS POPULAR" },
    { id: "trimestral", name: "Trimestral", days: 90, priceCop: 60000, priceUsdt: 18.85, discountPct: 44, savedCop: 48000, badge: null },
    { id: "semestral", name: "Semestral", days: 180, priceCop: 100000, priceUsdt: 31.42, discountPct: 54, savedCop: 116000, badge: null },
    { id: "anual", name: "Anual", days: 365, priceCop: 150000, priceUsdt: 47.12, discountPct: 65, savedCop: 282000, badge: "MEJOR VALOR" },
  ],

  LEGAL_TEXTS: {
    DISCLAIMER: "AVISO: OPTACORE.QUANT es una plataforma de análisis cuantitativo. No somos casa de apuestas ni captamos dinero.",
    AGE_WARNING: "PROHIBIDO EL USO PARA MENORES DE 18 AÑOS (+18).",
    TERMS: "Licencia de uso personal con control de sesión única.",
    PRIVACY: "Los datos se manejan bajo estricta confidencialidad.",
  },
};
