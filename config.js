// ============================================================================
// ARCHIVO: config.js
// Llaves de Prueba, Promotores 20% y Precios Oficiales
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
    WHATSAPP_LINK: "https://wa.me/573332861551?text=Hola%20equipo%20OptaCore,%20deseo%20activar%20mi%20membres%C3%ADa%20VIP",
  },

  // 1. LLAVES TEMPORALES (Tú decides el nombre y la cantidad exacta de días)
  VIP_KEYS: [
    { code: "PRUEBA3D", days: 3, description: "Pase de cortesía 3 días" },
    { code: "VIP7D", days: 7, description: "Semana VIP de prueba" },
    { code: "PROMO15D", days: 15, description: "Quincena especial" },
    { code: "ACCESO30D", days: 30, description: "Mes completo cortesía" },
    // Llaves de 6 meses (180 días)
    { code: "OPTA6M-ALPHA9", days: 180, description: "Membresía VIP Semestral (6 meses)" },
    { code: "OPTA6M-BRAVO8", days: 180, description: "Membresía VIP Semestral (6 meses)" },
    { code: "OPTA6M-DELTA7", days: 180, description: "Membresía VIP Semestral (6 meses)" },
    { code: "OPTA6M-OMEGA6", days: 180, description: "Membresía VIP Semestral (6 meses)" },
    // Llaves de 1 año (365 días)
    { code: "OPTA1Y-QUANT1", days: 365, description: "Membresía VIP Anual (1 año)" },
    { code: "OPTA1Y-TITAN2", days: 365, description: "Membresía VIP Anual (1 año)" },
    { code: "OPTA1Y-ELITE3", days: 365, description: "Membresía VIP Anual (1 año)" },
    { code: "OPTA1Y-ROYAL4", days: 365, description: "Membresía VIP Anual (1 año)" },
  ],

  // 2. CÓDIGOS DE PROMOTORES (20% DE DESCUENTO)
  PROMO_CODES: [
    { code: "PROMO20", discountPct: 20, promoter: "Campaña General" },
    { code: "VIP20", discountPct: 20, promoter: "Canal VIP" },
    { code: "CARLOS20", discountPct: 20, promoter: "Promotor Carlos" },
    { code: "JUAN20", discountPct: 20, promoter: "Promotor Juan" },
  ],

  PAYMENT_ACCOUNTS: {
    COLOMBIA: [
      {
        id: "nequi",
        method: "Nequi (Transferencia Directa)",
        accountNumber: "3332861551",
        holderName: "OptaCore Quant Desk",
        instructions: "Transfiere desde Nequi y envía el comprobante al WhatsApp oficial.",
      },
      {
        id: "bancolombia",
        method: "Bancolombia — Cuenta de Ahorros",
        accountNumber: "912-417-09219",
        holderName: "OptaCore Quant Desk",
        instructions: "Consigna vía App Bancolombia o corresponsal y envía captura a soporte.",
      },
    ],
    INTERNACIONAL: [
      {
        id: "binance_pay",
        method: "Binance Pay (Cero Comisión)",
        accountNumber: "UID: 204199989",
        holderName: "OptaCore_Quant",
        instructions: "Envía el valor en USDT vía Binance Pay a este UID y remite el comprobante.",
      },
      {
        id: "usdt_bep20",
        method: "USDT (Red BNB Smart Chain / BEP-20)",
        accountNumber: "0x595ee53c2c28628325f9baf6bb565ab7e34eec07",
        holderName: "Red: BEP-20 (BSC)",
        instructions: "Verifica que la red sea BEP-20 y remite el hash TXID a WhatsApp.",
      },
    ],
  },

  // Planes base con TRM oficial ($3.182,99 COP)
  VIP_PLANS: [
    { id: "semanal", name: "Semanal", days: 7, priceCop: 12000, priceUsdt: 3.77, discountPct: 0, savedCop: 0, badge: null },
    { id: "quincenal", name: "Quincenal", days: 15, priceCop: 20000, priceUsdt: 6.28, discountPct: 17, savedCop: 4000, badge: null },
    { id: "mensual", name: "Mensual", days: 30, priceCop: 36000, priceUsdt: 11.31, discountPct: 25, savedCop: 12000, badge: "MÁS POPULAR" },
    { id: "trimestral", name: "Trimestral", days: 90, priceCop: 60000, priceUsdt: 18.85, discountPct: 44, savedCop: 48000, badge: null },
    { id: "semestral", name: "Semestral", days: 180, priceCop: 100000, priceUsdt: 31.42, discountPct: 54, savedCop: 116000, badge: null },
    { id: "anual", name: "Anual", days: 365, priceCop: 150000, priceUsdt: 47.12, discountPct: 65, savedCop: 282000, badge: "MEJOR VALOR" },
  ],

  LEGAL_TEXTS: {
    DISCLAIMER: "AVISO: OPTACORE.QUANT es una plataforma de análisis estadístico.",
    AGE_WARNING: "PROHIBIDO EL USO PARA MENORES DE 18 AÑOS (+18).",
    TERMS: "Licencia de uso personal con control de sesión única.",
    PRIVACY: "Los datos se manejan bajo estricta confidencialidad.",
  },
};
