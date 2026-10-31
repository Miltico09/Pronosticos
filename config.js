// ============================================================================
// ARCHIVO: config.js
// Edita aquí precios, cuentas bancarias, colores y llaves API sin tocar código
// ============================================================================

export const CONFIG = {
  BRAND: {
    NAME: "OPTACORE.QUANT",
    TAGLINE: "TERMINAL DE INTELIGENCIA ESTADÍSTICA & PROBABILIDAD BIOCLIMÁTICA",
    TIMEZONE: "America/Bogota",
    FREE_DAILY_DIAMOND_LIMIT: 5,
    REFERRAL_REWARD_DAYS: 5, // Días VIP gratis por cada referido que pague
    TRIAL_HOURS: 24,
  },

  // Paleta de colores institucional (Cero amarillo)
  THEME: {
    BG_PRIMARY: "#05070a",
    BG_SURFACE: "#0a0e14",
    ACCENT_EMERALD: "#10b981",
    ACCENT_CYAN: "#06b6d4",
    ALERT_RED: "#ef4444",
  },

  // Conexión a Supabase y API Deportiva (API-Football v3 de API-Sports.io)
  KEYS: {
    SUPABASE_URL: "https://tu-proyecto.supabase.co",
    SUPABASE_ANON_KEY: "TU_SUPABASE_ANON_PUBLIC_KEY",
    SPORTS_API_HOST: "v3.football.api-sports.io",
    SPORTS_API_KEY: "TU_API_FOOTBALL_KEY",
    ADMIN_EMAIL: "admin@optacore.com", // Único correo que ve el Panel Admin
  },

  // Alertas Automáticas (Telegram Bot API + Enlace WhatsApp VIP)
  NOTIFICATIONS: {
    TELEGRAM_BOT_TOKEN: "TU_BOT_TOKEN_DE_BOTFATHER",
    TELEGRAM_VIP_CHANNEL_ID: "@tu_canal_vip_optacore",
    TELEGRAM_ADMIN_CHAT_ID: "TU_CHAT_ID_PERSONAL",
    WHATSAPP_VIP_CHANNEL_URL: "https://whatsapp.com/channel/tu-canal-vip",
    ADMIN_WHATSAPP_NUMBER: "573000000000",
  },

  // Cuentas para Pagos Manuales (100% directo a ti, sin pasarelas)
  PAYMENT_ACCOUNTS: {
    COLOMBIA: [
      {
        id: "nequi",
        method: "Nequi (Transferencia Inmediata)",
        accountNumber: "300 000 0000",
        holderName: "Titular Oficial OptaCore",
        instructions: "Envía el valor exacto del plan y toma captura donde se vea el número de referencia (Mxxxx).",
      },
      {
        id: "bancolombia",
        method: "Bancolombia — Ahorros",
        accountNumber: "000-000000-00",
        holderName: "Titular Oficial OptaCore",
        instructions: "Realiza transferencia por App Bancolombia o corresponsal y sube foto nítida del comprobante.",
      },
    ],
    INTERNACIONAL: [
      {
        id: "binance_pay",
        method: "Binance Pay (Sin Comisión)",
        accountNumber: "ID: 884920114",
        holderName: "OptaCore_Quant_Desk",
        instructions: "Calcula el equivalente en USDT al cambio del día y adjunta la captura de Orden Completada.",
      },
      {
        id: "usdt_trc20",
        method: "USDT (Red TRON / TRC-20)",
        accountNumber: "Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        holderName: "Red obligatoria: TRC-20",
        instructions: "Verifica que la red sea TRC-20. Sube captura donde sea visible el TXID de la transacción.",
      },
    ],
  },

  // Planes VIP en Pesos Colombianos (COP) y Descuentos Oficiales
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
      "AVISO DE RESPONSABILIDAD: OPTACORE.QUANT es una plataforma de análisis estadístico, bioclimático y probabilístico. No somos una casa de apuestas ni captamos dinero para apuestas. Los modelos matemáticos se basan en datos históricos y tendencias L10, por lo que NO garantizan resultados futuros.",
    AGE_WARNING: "PROHIBIDO EL USO PARA MENORES DE 18 AÑOS (+18). Juega con responsabilidad.",
    TERMS:
      "Cada licencia VIP es personal e intransferible y permite 1 sola sesión activa simultánea. El uso compartido de cuentas o la subida de comprobantes alterados conlleva la cancelación inmediata de la membresía sin derecho a reembolso.",
    PRIVACY:
      "Tus datos de correo y comprobantes se almacenan de forma cifrada únicamente para gestionar la vigencia de tu licencia VIP y el programa de referidos.",
  },
};
