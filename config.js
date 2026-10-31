// ============================================================================
// ARCHIVO: config.js
// Configuración Oficial OPTACORE.QUANT
// ============================================================================

export const CONFIG = {
  BRAND: {
    NAME: "OPTACORE.QUANT",
    TAGLINE: "TERMINAL DE INTELIGENCIA ESTADÍSTICA & PROBABILIDAD BIOCLIMÁTICA",
    TIMEZONE: "America/Bogota",
    FREE_DAILY_DIAMOND_LIMIT: 5,
    REFERRAL_REWARD_DAYS: 5,
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
    SPORTS_API_KEY: "",
    ADMIN_EMAIL: "admin@optacore.com",
  },

  NOTIFICATIONS: {
    TELEGRAM_BOT_TOKEN: "",
    TELEGRAM_VIP_CHANNEL_ID: "@optacore_vip",
    TELEGRAM_ADMIN_CHAT_ID: "",
    WHATSAPP_VIP_CHANNEL_URL: "https://whatsapp.com/channel/optacore-vip",
    ADMIN_WHATSAPP_NUMBER: "573000000000",
  },

  PAYMENT_ACCOUNTS: {
    COLOMBIA: [
      {
        id: "nequi",
        method: "Nequi (Transferencia Inmediata)",
        accountNumber: "300 000 0000",
        holderName: "OptaCore Official",
        instructions: "Envía el valor exacto del plan y sube la captura con el comprobante visible.",
      },
      {
        id: "bancolombia",
        method: "Bancolombia — Ahorros",
        accountNumber: "000-000000-00",
        holderName: "OptaCore Official",
        instructions: "Transfiere vía App Bancolombia o corresponsal y adjunta el comprobante.",
      },
    ],
    INTERNACIONAL: [
      {
        id: "binance_pay",
        method: "Binance Pay",
        accountNumber: "ID: 884920114",
        holderName: "OptaCore_Quant",
        instructions: "Envía el monto equivalente en USDT y sube captura de orden completada.",
      },
      {
        id: "usdt_trc20",
        method: "USDT (Red TRC-20)",
        accountNumber: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        holderName: "Red: TRC-20",
        instructions: "Verifica que la red sea TRC-20 y sube la captura con el TXID visible.",
      },
    ],
  },

  VIP_PLANS: [
    {
      id: "semanal",
      name: "Semanal",
      days: 7,
      priceCop: 12000,
      discountPct: 0,
      savedCop: 0,
      badge: null,
    },
    {
      id: "quincenal",
      name: "Quincenal",
      days: 15,
      priceCop: 20000,
      discountPct: 17,
      savedCop: 4000,
      badge: null,
    },
    {
      id: "mensual",
      name: "Mensual",
      days: 30,
      priceCop: 36000,
      discountPct: 25,
      savedCop: 12000,
      badge: "MÁS POPULAR",
    },
    {
      id: "trimestral",
      name: "Trimestral",
      days: 90,
      priceCop: 60000,
      discountPct: 44,
      savedCop: 48000,
      badge: null,
    },
    {
      id: "semestral",
      name: "Semestral",
      days: 180,
      priceCop: 100000,
      discountPct: 54,
      savedCop: 116000,
      badge: null,
    },
    {
      id: "anual",
      name: "Anual",
      days: 365,
      priceCop: 150000,
      discountPct: 65,
      savedCop: 282000,
      badge: "MEJOR VALOR",
    },
  ],

  LEGAL_TEXTS: {
    DISCLAIMER:
      "AVISO DE RESPONSABILIDAD: OPTACORE.QUANT es una plataforma de análisis estadístico y probabilístico. No somos una casa de apuestas ni captamos dinero. Los pronósticos no garantizan resultados futuros.",
    AGE_WARNING: "PROHIBIDO EL USO PARA MENORES DE 18 AÑOS (+18).",
    TERMS:
      "Cada licencia VIP es personal e intransferible y permite una sola sesión activa simultánea.",
    PRIVACY:
      "Tus datos de correo y comprobantes se almacenan de forma segura únicamente para la activación de tu membresía.",
  },
};
