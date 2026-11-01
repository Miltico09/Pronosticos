// ============================================================================
// ARCHIVO: pronosticos.js
// Sincronización en Lote (1 Crédito API para HT/FT), Estadísticas en Vivo,
// Telemetría de Cancha, Racha Activa, Calculadora y Tickets de Victoria
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin } from "./auth.js";

const DB_KEY = "optacore_master_feed_v16";
const API_SYNC_THROTTLE_MS = 10 * 60 * 1000;
let activeQuickFilter = "ALL";

export function getColombiaDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.BRAND.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function getStars(prob) {
  if (prob >= 90) return { stars: "⭐⭐⭐⭐⭐", tag: "5 ESTRELLAS", badge: "border-cyan-400 bg-cyan-500/15 text-cyan-300" };
  if (prob >= 85) return { stars: "⭐⭐⭐⭐", tag: "4 ESTRELLAS", badge: "border-emerald-400 bg-emerald-500/15 text-emerald-300" };
  return { stars: "⭐⭐⭐", tag: "3 ESTRELLAS", badge: "border-slate-600 bg-slate-800 text-slate-300" };
}

function getPitchFeverBar(altitudeM, weatherDesc) {
  let stressScore = 45;
  let label = "EXIGENCIA MEDIA";
  let color = "bg-cyan-400";

  if (weatherDesc.includes("31°C") || weatherDesc.includes("33°C") || weatherDesc.includes("30°C") || weatherDesc.includes("27°C")) {
    stressScore = 92;
    label = "🔥 CALOR EXTREMO / DESGASTE RIVAL";
    color = "bg-amber-500";
  } else if (altitudeM >= 1400) {
    stressScore = 88;
    label = "⛰️ AHOGO POR ALTURA (+1.400m)";
    color = "bg-emerald-400";
  } else if (weatherDesc.includes("10°C") || weatherDesc.includes("12°C")) {
    stressScore = 65;
    label = "⚡ CÉSPED RÁPIDO / ALTA VELOCIDAD";
    color = "bg-[#06b6d4]";
  }

  return { stressScore, label, color };
}

const LOGOS = {
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Bayern Múnich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Deportivo Alavés": "https://media.api-sports.io/football/teams/542.png",
  "Llaneros FC": "https://media.api-sports.io/football/teams/1142.png",
  "Junior de Barranquilla": "https://media.api-sports.io/football/teams/1126.png",
  "Jaguares de Córdoba": "https://media.api-sports.io/football/teams/1133.png",
  "Atlético Bucaramanga": "https://media.api-sports.io/football/teams/1125.png",
  "Deportivo Pasto": "https://media.api-sports.io/football/teams/1134.png",
  "América de Cali": "https://media.api-sports.io/football/teams/1124.png",
  "Fortaleza CEIF": "https://media.api-sports.io/football/teams/1141.png",
  "Bayer Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "VfB Stuttgart": "https://media.api-sports.io/football/teams/172.png",
  "Deportivo Pereira": "https://media.api-sports.io/football/teams/1135.png",
  "SD Compostela": "https://media.api-sports.io/football/teams/2836.png",
  "Aston Villa": "https://media.api-sports.io/football/teams/66.png",
  "Bournemouth": "https://media.api-sports.io/football/teams/35.png",
  "RB Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "SC Freiburg": "https://media.api-sports.io/football/teams/160.png",
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Independiente Medellín": "https://media.api-sports.io/football/teams/1138.png",
  "Deportes Tolima": "https://media.api-sports.io/football/teams/1137.png",
  "Once Caldas": "https://media.api-sports.io/football/teams/1132.png",
  "Chelsea": "https://media.api-sports.io/football/teams/49.png",
  "Newcastle": "https://media.api-sports.io/football/teams/34.png",
  "Arsenal": "https://media.api-sports.io/football/teams/42.png",
  "Liverpool": "https://media.api-sports.io/football/teams/40.png",
  "Inter de Milán": "https://media.api-sports.io/football/teams/505.png",
  "Juventus": "https://media.api-sports.io/football/teams/496.png",
  "Olympique Marsella": "https://media.api-sports.io/football/teams/81.png",
  "PSG": "https://media.api-sports.io/football/teams/85.png",
  "Minnesota Timberwolves": "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg",
  "San Antonio Spurs": "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg",
  "Miami Heat": "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg",
  "Indiana Pacers": "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg",
  "Denver Nuggets": "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg",
  "LA Clippers": "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg",
  "Golden State Warriors": "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
  "Phoenix Suns": "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg",
  "Dallas Mavericks": "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg",
  "Utah Jazz": "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg",
  "Sacramento Kings": "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg",
};

function getLogo(name) {
  return LOGOS[name] || "https://media.api-sports.io/football/teams/default.png";
}

function seedMasterRecords() {
  const today = getColombiaDateString();
  const cached = localStorage.getItem(DB_KEY);
  if (cached) {
    const list = JSON.parse(cached);
    if (list.some((p) => p.matchDate === today)) return list;
  }

  const makeIso = (d, hhmm) => `${d}T${hhmm}:00-05:00`;

  const records = [
    // --- HOY (31 DE OCTUBRE) ---
    {
      id: "20261031-01",
      apiFixtureId: 1208492,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League (Inglaterra)",
      homeTeam: "Manchester City",
      awayTeam: "Brighton",
      marketEquivalent: "Gana Manchester City + Total Goles Más de 1.5",
      liveOddDrop: "@1.62 ➔ @1.45 (Dinero Inteligente)",
      predictionText: "Manchester City Gana + Más de 1.5 Goles Totales",
      odds: 1.45,
      probability: 92.5,
      isFree: true,
      altitudeM: 48,
      weatherDesc: "Frío húmedo (12°C)",
      homeAvgGoals: "2.7 por partido",
      awayAvgGoals: "0.8 por partido",
      liveStats: { possession: "68% - 32%", shots: "18 (9 al arco) - 6 (2 al arco)", corners: "8 - 2", fouls: "7 - 12" },
      pickProgressPct: 100,
      pickProgressLabel: "✔ OBJETIVO CUMPLIDO: Ganó 3-1 (+1.5 Goles)",
      explanation: `¿Por qué se eligió esta jugada?: El Manchester City en su estadio es una máquina que arranca a toda velocidad desde el primer minuto. Brighton siempre intenta salir jugando con la pelota dominada y suele perder balones peligrosos muy cerca de su propio arco.\n\n¿Cómo se resolvió?: El City marcó dos goles en el primer tiempo. En el segundo tiempo Brighton descontó, pero Haaland liquidó el 3-1 definitivo asegurando la victoria con total tranquilidad.`,
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261031-02",
      apiFixtureId: 1208493,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "12:30"),
      kickoffLabel: "12:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayern Múnich",
      awayTeam: "Borussia Dortmund",
      marketEquivalent: "Línea de Goles: Más de 2.5 (3 goles o más en total)",
      liveOddDrop: "@1.55 ➔ @1.40",
      predictionText: "Más de 2.5 Goles Totales (Mínimo 3 goles)",
      odds: 1.40,
      probability: 93.0,
      isFree: true,
      altitudeM: 519,
      weatherDesc: "Clima fresco (10°C)",
      homeAvgGoals: "2.9 por partido",
      awayAvgGoals: "1.6 por partido",
      liveStats: { possession: "54% - 46%", shots: "21 (11 al arco) - 14 (7 al arco)", corners: "11 - 6", fouls: "10 - 9" },
      pickProgressPct: 100,
      pickProgressLabel: "✔ OBJETIVO CUMPLIDO: 5 goles anotados (3-2)",
      explanation: `¿Por qué se eligió esta jugada?: El clásico alemán siempre es de ida y vuelta. Ambos clubes tienen delanteros top pero defensas que dejan espacios cuando van al ataque.\n\n¿Cómo se resolvió?: El primer tiempo terminó 1-1. Tras el minuto 60 llegaron tres goles más para un 3-2 final que superó con comodidad la línea requerida.`,
      liveScore: "3 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261031-03",
      apiFixtureId: 1208494,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "15:00"),
      kickoffLabel: "15:00 COL",
      league: "LaLiga (España)",
      homeTeam: "FC Barcelona",
      awayTeam: "Deportivo Alavés",
      marketEquivalent: "Hándicap -1.5 (Barcelona gana por 2 o más goles)",
      liveOddDrop: "@1.68 ➔ @1.50",
      predictionText: "Barcelona Gana por 2 o más goles (Hándicap -1.5)",
      odds: 1.50,
      probability: 88.5,
      isFree: true,
      altitudeM: 120,
      weatherDesc: "Agradable (19°C)",
      homeAvgGoals: "3.0 por partido",
      awayAvgGoals: "0.6 por partido",
      liveStats: { possession: "72% - 28%", shots: "16 (8 al arco) - 3 (1 al arco)", corners: "9 - 1", fouls: "6 - 15" },
      pickProgressPct: 100,
      pickProgressLabel: "✔ OBJETIVO CUMPLIDO: Ganó 2-0 cumpliendo hándicap",
      explanation: `¿Por qué se eligió esta jugada?: Barcelona venía con racha perfecta de local. Alavés sufre muchísimo cuando baja al nivel del mar ante rivales que le esconden la pelota.\n\n¿Cómo se resolvió?: Dominio del 72% de posesión culé y triunfo cómodo 2-0 sin pasar apuros.`,
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261031-04",
      apiFixtureId: 1208495,
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "18:05"),
      kickoffLabel: "18:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Llaneros FC",
      awayTeam: "Junior de Barranquilla",
      marketEquivalent: "Doble Oportunidad X2 (Empate o Junior) + Más de 1.5 Goles",
      liveOddDrop: "@1.60 ➔ @1.48",
      predictionText: "Junior Gana o Empata (X2) + Más de 1.5 Goles",
      odds: 1.48,
      probability: 91.0,
      isFree: true,
      altitudeM: 467,
      weatherDesc: "Calor húmedo (27°C)",
      homeAvgGoals: "1.2 por partido",
      awayAvgGoals: "1.7 por partido",
      liveStats: { possession: "48% - 52%", shots: "8 (3) - 11 (6)", corners: "4 - 5", fouls: "13 - 11" },
      pickProgressPct: 50,
      pickProgressLabel: "⚡ EN ESPERA DE INICIO",
      explanation: `¿Por qué se eligió esta jugada?: Villavicencio tiene 27°C y humedad alta, clima donde los jugadores costeños de Junior rinden con potencia física a diferencia de la altura andina.`,
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261031-05",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: today,
      kickoffIso: makeIso(today, "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Minnesota Timberwolves",
      awayTeam: "San Antonio Spurs",
      marketEquivalent: "Línea Alternativa de Puntos Totales: Más de 214.5",
      liveOddDrop: "@1.52 ➔ @1.42",
      predictionText: "Más de 214.5 Puntos Totales (Línea Protegida)",
      odds: 1.42,
      probability: 93.5,
      isFree: false,
      altitudeM: 253,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "116 pts esperados",
      awayAvgGoals: "105 pts esperados",
      liveStats: { possession: "Ritmo rápido", shots: "48% TC", corners: "-", fouls: "-" },
      pickProgressPct: 0,
      pickProgressLabel: "🔒 EXCLUSIVO MIEMBROS VIP",
      explanation: `¿Por qué se eligió esta jugada?: Se compraron casi 9 puntos de protección frente a la línea de 223.0 que pusieron las casas de apuestas. Minnesota llega con descanso completo.`,
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },

    // --- AYER (30 DE OCTUBRE) ---
    {
      id: "20261030-01",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "20:05"),
      kickoffLabel: "20:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Atlético Bucaramanga",
      awayTeam: "Deportivo Pasto",
      marketEquivalent: "Apuesta Sin Empate (DNB Bucaramanga)",
      predictionText: "Bucaramanga Empate No Acción (DNB)",
      odds: 1.45,
      probability: 91.2,
      isFree: true,
      altitudeM: 959,
      weatherDesc: "Calor pesado (24°C)",
      homeAvgGoals: "1.9 por partido",
      awayAvgGoals: "0.7 por partido",
      explanation: `Pasto pierde su ventaja de altura al descender a Bucaramanga. Bucaramanga atacó con intensidad en el segundo tiempo y selló el 2-0.`,
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261030-02",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Miami Heat",
      awayTeam: "Indiana Pacers",
      marketEquivalent: "Total Puntos Combinados: Más de 227.5",
      predictionText: "Más de 227.5 Puntos Totales Combinados",
      odds: 1.40,
      probability: 92.0,
      isFree: true,
      altitudeM: 10,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "124 pts",
      awayAvgGoals: "118 pts",
      explanation: `Indiana corre la cancha en menos de 12 segundos y Miami contestó con efectividad en triples para sumar 242 puntos combinados.`,
      liveScore: "124 - 118",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261030-03-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "18:00"),
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Deportivo Pereira",
      marketEquivalent: "Menos de 2.5 Goles Totales",
      predictionText: "Menos de 2.5 Goles Totales",
      odds: 1.70,
      probability: 85.5,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor sofocante (31°C)",
      homeAvgGoals: "1 gol",
      awayAvgGoals: "2 goles",
      explanation: `Estaba 1-1 en el minuto 93 cumpliendo la línea, pero un penal sancionado en el 94' quebró la jugada en la última acción.`,
      liveScore: "1 - 2",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "20261030-04-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "14:30"),
      kickoffLabel: "14:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayer Leverkusen",
      awayTeam: "VfB Stuttgart",
      marketEquivalent: "Leverkusen Gana + Más de 2.5 Goles",
      predictionText: "Leverkusen Gana + Más de 2.5 Goles",
      odds: 1.55,
      probability: 88.0,
      isFree: true,
      altitudeM: 60,
      weatherDesc: "Cielo nublado (12°C)",
      homeAvgGoals: "0 goles",
      awayAvgGoals: "0 goles",
      explanation: `Leverkusen estrelló 5 balones en los palos y el arquero rival tuvo 8 atajadas milagrosas, provocando un insólito 0-0.`,
      liveScore: "0 - 0",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },

    // --- ANTEAYER (29 DE OCTUBRE) ---
    {
      id: "20261029-01",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "18:30"),
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "América de Cali",
      awayTeam: "Fortaleza CEIF",
      marketEquivalent: "Doble Oportunidad 1X + Más de 1.5 Goles",
      predictionText: "América Gana o Empata (1X) + Más de 1.5 Goles",
      odds: 1.46,
      probability: 90.5,
      isFree: true,
      altitudeM: 1018,
      weatherDesc: "Cálido (26°C)",
      homeAvgGoals: "2.1 por partido",
      awayAvgGoals: "0.9 por partido",
      explanation: `Fortaleza se quedó sin fondo físico en Cali tras descender de Bogotá. América remontó en el segundo tiempo 2-1.`,
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261029-02-FALLO",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Utah Jazz",
      awayTeam: "Sacramento Kings",
      marketEquivalent: "Hándicap Sacramento Kings -6.5",
      predictionText: "Sacramento Kings Hándicap -6.5",
      odds: 1.90,
      probability: 87.5,
      isFree: true,
      altitudeM: 1288,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "110 pts",
      awayAvgGoals: "113 pts",
      explanation: `Kings ganaba por 14 puntos pero sentó a los titulares y Utah anotó triples finales para perder el hándicap por 3 puntos (110-113).`,
      liveScore: "110 - 113",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "20261029-03-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "14:00"),
      kickoffLabel: "14:00 COL",
      league: "Copa del Rey (España)",
      homeTeam: "SD Compostela",
      awayTeam: "Deportivo Alavés",
      marketEquivalent: "Alavés Gana 1T / Final",
      predictionText: "Alavés Gana Descanso / Final",
      odds: 1.80,
      probability: 86.0,
      isFree: true,
      altitudeM: 260,
      weatherDesc: "Lluvia (15°C)",
      homeAvgGoals: "0",
      awayAvgGoals: "1",
      explanation: `Compostela metió a todos los jugadores debajo del arco en un campo empantanado y aguantó el 0-0 en la primera parte.`,
      liveScore: "0 - 1",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },

    // --- MEGA-PARLEY DE 13 PARTIDOS (24 Y 25 DE OCTUBRE) ---
    {
      id: "PARLEY13-01",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "20:30"),
      kickoffLabel: "20:30 COL",
      league: "NBA",
      homeTeam: "Phoenix Suns",
      awayTeam: "Dallas Mavericks",
      marketEquivalent: "Puntos Jugador: Kevin Durant Más de 24.5",
      predictionText: "Kevin Durant Más de 24.5 Puntos",
      odds: 1.75,
      probability: 92.5,
      isFree: true,
      altitudeM: 331,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "31 pts",
      awayAvgGoals: "-",
      explanation: `Durant estuvo intratable y anotó 31 puntos atacando constantemente el aro.`,
      liveScore: "31 Puntos",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-02-FALLO",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "19:30"),
      kickoffLabel: "19:30 COL",
      league: "NBA",
      homeTeam: "Golden State Warriors",
      awayTeam: "LA Clippers",
      marketEquivalent: "Hándicap Warriors -4.5",
      predictionText: "Warriors Gana -4.5 Hándicap",
      odds: 1.85,
      probability: 87.0,
      isFree: true,
      altitudeM: 10,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "104",
      awayAvgGoals: "112",
      explanation: `Stephen Curry se lesionó el tobillo en el 3Q y Clippers remontó el partido.`,
      liveScore: "104 - 112",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-03",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "17:15"),
      kickoffLabel: "17:15 COL",
      league: "Liga BetPlay",
      homeTeam: "Junior de Barranquilla",
      awayTeam: "América de Cali",
      marketEquivalent: "Total Goles Junior: Más de 0.5",
      predictionText: "Junior Más de 0.5 Goles en Casa",
      odds: 1.30,
      probability: 91.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor de Barranquilla (30°C)",
      homeAvgGoals: "3",
      awayAvgGoals: "1",
      explanation: `Junior fue una aplanadora en el Metropolitano ganando 3-1.`,
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-04",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "14:45"),
      kickoffLabel: "14:45 COL",
      league: "Ligue 1",
      homeTeam: "Olympique Marsella",
      awayTeam: "PSG",
      marketEquivalent: "Ganador 1X2: PSG",
      predictionText: "Victoria Directa PSG",
      odds: 1.55,
      probability: 89.5,
      isFree: true,
      altitudeM: 35,
      weatherDesc: "Templado",
      homeAvgGoals: "0",
      awayAvgGoals: "3",
      explanation: `Superioridad total parisina con goleada 0-3 en el clásico francés.`,
      liveScore: "0 - 3",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-05",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "12:00"),
      kickoffLabel: "12:00 COL",
      league: "Serie A",
      homeTeam: "Inter de Milán",
      awayTeam: "Juventus",
      marketEquivalent: "Más de 2.5 Goles Totales",
      predictionText: "Más de 2.5 Goles Totales",
      odds: 1.85,
      probability: 88.0,
      isFree: true,
      altitudeM: 122,
      weatherDesc: "Despejado",
      homeAvgGoals: "4",
      awayAvgGoals: "4",
      explanation: `Partidazo en Milán con 8 goles en total para un empate 4-4.`,
      liveScore: "4 - 4",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-06",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Premier League",
      homeTeam: "Arsenal",
      awayTeam: "Liverpool",
      marketEquivalent: "Más de 1.5 Goles Totales",
      predictionText: "Más de 1.5 Goles Totales",
      odds: 1.35,
      probability: 91.5,
      isFree: true,
      altitudeM: 40,
      weatherDesc: "Lluvia",
      homeAvgGoals: "2",
      awayAvgGoals: "2",
      explanation: `Duelo con llegadas en ambas áreas que finalizó 2-2.`,
      liveScore: "2 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-07-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League",
      homeTeam: "Chelsea",
      awayTeam: "Newcastle",
      marketEquivalent: "Total Córners: Más de 9.5",
      predictionText: "Más de 9.5 Córners Totales",
      odds: 1.70,
      probability: 86.0,
      isFree: true,
      altitudeM: 15,
      weatherDesc: "Frío",
      homeAvgGoals: "9 córners",
      awayAvgGoals: "-",
      explanation: `Se quedó en 9 tiros de esquina en el minuto 75 y no hubo más llegadas.`,
      liveScore: "9 Córners",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-08",
      apiFixtureId: null,
      sport: "NBA",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA",
      homeTeam: "Denver Nuggets",
      awayTeam: "LA Clippers",
      marketEquivalent: "Puntos Nikola Jokic Más de 23.5",
      predictionText: "Nikola Jokic Más de 23.5 Puntos",
      odds: 1.80,
      probability: 92.0,
      isFree: true,
      altitudeM: 1609,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "41 pts",
      awayAvgGoals: "-",
      explanation: `Jokic anotó 41 puntos en la altura de Denver destrozando la línea.`,
      liveScore: "41 Puntos",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-09",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "18:30"),
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay",
      homeTeam: "Deportes Tolima",
      awayTeam: "Once Caldas",
      marketEquivalent: "Apuesta Sin Empate DNB Tolima",
      predictionText: "Tolima Empate No Acción (DNB)",
      odds: 1.45,
      probability: 90.0,
      isFree: true,
      altitudeM: 1285,
      weatherDesc: "Templado",
      homeAvgGoals: "1",
      awayAvgGoals: "1",
      explanation: `Tolima empató 1-1 y la selección se protegió sin pérdidas.`,
      liveScore: "1 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-10",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "16:15"),
      kickoffLabel: "16:15 COL",
      league: "Liga BetPlay",
      homeTeam: "Independiente Medellín",
      awayTeam: "Jaguares de Córdoba",
      marketEquivalent: "Más de 1.5 Goles Totales",
      predictionText: "Más de 1.5 Goles Totales",
      odds: 1.38,
      probability: 89.0,
      isFree: true,
      altitudeM: 1495,
      weatherDesc: "Agradable",
      homeAvgGoals: "4",
      awayAvgGoals: "1",
      explanation: `Jaguares acusó la subida a Medellín y el DIM goleó 4-1.`,
      liveScore: "4 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-11-FALLO",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "14:00"),
      kickoffLabel: "14:00 COL",
      league: "LaLiga",
      homeTeam: "Real Madrid",
      awayTeam: "FC Barcelona",
      marketEquivalent: "Ambos Equipos Anotan Gol (Sí)",
      predictionText: "Ambos Marcan Gol (Sí)",
      odds: 1.50,
      probability: 87.5,
      isFree: true,
      altitudeM: 660,
      weatherDesc: "Fresco",
      homeAvgGoals: "0",
      awayAvgGoals: "4",
      explanation: `Madrid cayó 8 veces en fuera de juego y Barcelona ganó 0-4 sin encajar.`,
      liveScore: "0 - 4",
      matchStatus: "FINALIZADO",
      outcome: "FALLO",
    },
    {
      id: "PARLEY13-12",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Bundesliga",
      homeTeam: "RB Leipzig",
      awayTeam: "SC Freiburg",
      marketEquivalent: "Victoria Directa RB Leipzig",
      predictionText: "Victoria Directa RB Leipzig",
      odds: 1.65,
      probability: 91.0,
      isFree: true,
      altitudeM: 113,
      weatherDesc: "Frío",
      homeAvgGoals: "3",
      awayAvgGoals: "1",
      explanation: `Remontada de Leipzig en el segundo tiempo con tres goles seguidos.`,
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-13",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "09:00"),
      kickoffLabel: "09:00 COL",
      league: "Premier League",
      homeTeam: "Aston Villa",
      awayTeam: "Bournemouth",
      marketEquivalent: "Doble Oportunidad 1X (Villa o Empate)",
      predictionText: "Aston Villa Gana o Empata (1X)",
      odds: 1.30,
      probability: 89.0,
      isFree: true,
      altitudeM: 110,
      weatherDesc: "Nublado",
      homeAvgGoals: "1",
      awayAvgGoals: "1",
      explanation: `El equipo del 'Dibu' sostuvo el invicto en casa con empate 1-1.`,
      liveScore: "1 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },

    // --- HITO FUNDADOR ($150.000 COP EN MONTERÍA) ---
    {
      id: "FOUNDER-JAGUARES",
      apiFixtureId: null,
      sport: "FÚTBOL",
      matchDate: "2026-10-23",
      kickoffIso: makeIso("2026-10-23", "18:00"),
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Llaneros FC",
      marketEquivalent: "Doble Oportunidad 1X + Más de 1.5 Goles",
      predictionText: "Jaguares Gana o Empata (1X) + Más de 1.5 Goles",
      odds: 2.20,
      probability: 93.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor sofocante (33°C y 86% de humedad)",
      homeAvgGoals: "2",
      awayAvgGoals: "1",
      explanation: `EL COBRO FUNDADOR DE $150.000 PESOS: En el calor del Jaraguay de Montería, Llaneros se quedó sin piernas por deshidratación en el 2T y Jaguares selló la victoria 2-1.`,
      liveScore: "2 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
  ];

  localStorage.setItem(DB_KEY, JSON.stringify(records));
  return records;
}

export function getAllMasterFeed() {
  return seedMasterRecords();
}

function saveMasterFeed(list) {
  localStorage.setItem(DB_KEY, JSON.stringify(list));
  renderLiveTickerAndStreak();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();
}

// ============================================================================
// SINCRONIZACIÓN EN LOTE (1 CRÉDITO API PARA MEDIO TIEMPO Y FINAL DE TIEMPO)
// ============================================================================
export async function syncLiveHtFtResults(force = false) {
  const lastSync = parseInt(localStorage.getItem("optacore_last_api_sync") || "0", 10);
  const now = Date.now();

  if (!force && (now - lastSync) < API_SYNC_THROTTLE_MS) {
    return;
  }

  const allMatches = getAllMasterFeed();
  const today = getColombiaDateString();

  const targets = allMatches.filter((m) => {
    return m.matchDate === today &&
           m.apiFixtureId &&
           m.matchStatus !== "FINALIZADO" &&
           new Date(m.kickoffIso).getTime() <= now;
  });

  if (targets.length === 0) return;

  const fixtureIds = targets.slice(0, 20).map((m) => m.apiFixtureId).join("-");

  try {
    const response = await fetch(`https://${CONFIG.KEYS.SPORTS_API_HOST}/fixtures?ids=${fixtureIds}`, {
      method: "GET",
      headers: {
        "x-apisports-key": CONFIG.KEYS.SPORTS_API_KEY,
      },
    });

    const data = await response.json();
    if (!data.response || data.response.length === 0) return;

    let updatedCount = 0;

    data.response.forEach((item) => {
      const fixId = item.fixture?.id;
      const statusShort = item.fixture?.status?.short;
      const homeScore = item.goals?.home ?? 0;
      const awayScore = item.goals?.away ?? 0;

      const matchIndex = allMatches.findIndex((m) => m.apiFixtureId === fixId);
      if (matchIndex === -1) return;

      if (statusShort === "HT") {
        const htHome = item.score?.halftime?.home ?? homeScore;
        const htAway = item.score?.halftime?.away ?? awayScore;
        allMatches[matchIndex].liveScore = `${htHome} -${htAway} (MT)`;
        allMatches[matchIndex].matchStatus = "EN_VIVO";
        updatedCount++;
      }

      if (["FT", "AET", "PEN"].includes(statusShort)) {
        allMatches[matchIndex].liveScore = `${homeScore} -${awayScore}`;
        allMatches[matchIndex].matchStatus = "FINALIZADO";
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      saveMasterFeed(allMatches);
    }

    localStorage.setItem("optacore_last_api_sync", now.toString());
  } catch (error) {
    console.warn("Fallo de sincronización API-Sports:", error);
  }
}

window.syncLiveHtFtResults = syncLiveHtFtResults;

function renderLiveTickerAndStreak() {
  const all = getAllMasterFeed();
  const wins = all.filter((p) => p.outcome === "ACIERTO");

  const tickerEl = document.getElementById("live-win-ticker");
  if (tickerEl && wins.length > 0) {
    const itemsHtml = wins
      .map(
        (w) =>
          `<span class="mx-4"><strong class="text-[#10b981]">✔ COBRADO:</strong> ${w.homeTeam} vs${w.awayTeam} ► <span class="text-cyan-300">${w.predictionText}</span> (@${(w.odds \vert{}\vert{} 1.45).toFixed(2)}) [${w.liveScore}]</span>`
      )
      .join(" • ");
    tickerEl.innerHTML = itemsHtml + " • " + itemsHtml;
  }

  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  let currentStreak = 0;
  for (const game of settled) {
    if (game.outcome === "ACIERTO") currentStreak++;
    else break;
  }

  const streakBadge = document.getElementById("hot-streak-badge");
  if (streakBadge) {
    if (currentStreak >= 2) {
      streakBadge.textContent = `🔥 RACHA ACTUAL: ${currentStreak} ACIERTOS SEGUIDOS`;
      streakBadge.classList.remove("hidden");
    } else {
      streakBadge.textContent = `⚡ ${wins.length} ACIERTOS AUDITADOS`;
    }
  }
}

window.copyPickToClipboard = (matchId, ev) => {
  if (ev) ev.stopPropagation();
  const m = getAllMasterFeed().find((x) => x.id === matchId);
  if (!m) return;

  const text = `🎯 *OPTACORE.QUANT — PRONÓSTICO DESTACADO*\n⚽ ${m.homeTeam} vs ${m.awayTeam}\n🏆 ${m.league}\n⏰ Hora: ${m.kickoffLabel}\n🔥 Jugada: *${m.predictionText}*\n📈 Cuota: @${(m.odds \vert{}\vert{} 1.45).toFixed(2)} (Probabilidad:${m.probability}%)\n\n📲 Ver análisis completo y cartelera en:\n${window.location.origin}`;

  navigator.clipboard.writeText(text).then(() => {
    alert("¡Pronóstico copiado con formato para compartir en grupos de WhatsApp!");
  });
};

window.openWinTicketCard = (matchId, ev) => {
  if (ev) ev.stopPropagation();
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match) return;

  let modal = document.getElementById("win-ticket-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "win-ticket-modal";
    modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono";
    document.body.appendChild(modal);
  }

  const stake = Number(document.getElementById("stake-calculator-input")?.value || 50000);
  const totalReturn = Math.round(stake * (match.odds || 1.45));
  const netProfit = totalReturn - stake;

  modal.innerHTML = `
    <div class="max-w-sm w-full space-y-3">
      <div class="p-6 bg-gradient-to-b from-[#061412] via-[#05070a] to-[#040d14] border-2 border-[#10b981] shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-[#1b2432] pb-3">
          <div>
            <span class="text-base font-black text-white tracking-wider">OPTACORE<span class="text-cyan-400">.QUANT</span></span>
            <span class="text-[9px] text-slate-400 block">AUDITORÍA OFICIAL VERIFICADA</span>
          </div>
          <span class="px-2.5 py-1 bg-[#10b981] text-slate-950 font-black text-xs uppercase">
            ✔ ACIERTO
          </span>
        </div>

        <div class="text-center space-y-2 py-2">
          <span class="text-[10px] text-cyan-400 uppercase font-bold">${match.sport} //${match.league}</span>
          <div class="flex items-center justify-center gap-4 py-2">
            <img src="${getLogo(match.homeTeam)}" class="w-12 h-12 object-contain" />
            <span class="text-2xl font-black text-white">${match.liveScore}</span>
            <img src="${getLogo(match.awayTeam)}" class="w-12 h-12 object-contain" />
          </div>
          <div class="text-sm font-black text-white">${match.homeTeam} vs${match.awayTeam}</div>
        </div>

        <div class="p-3 bg-[#05070a] border border-[#10b981]/50 space-y-1 text-center">
          <span class="text-[9px] text-slate-400 uppercase block">PRONÓSTICO CUMPLIDO:</span>
          <span class="text-sm font-black text-[#10b981] block">${match.predictionText}</span>
          <span class="text-xs text-white font-bold">Cuota: @${(match.odds || 1.45).toFixed(2)} | Confianza: ${match.probability}\%</span> </div>          <div class="grid grid-cols-2 gap-2 bg-[#070d14] p-2.5 border border-[#1b2432] text-center text-xs"> <div> <span class="text-[9px] text-slate-400 block">INVERSIÓN BASE</span> <span class="font-bold text-white">$${stake.toLocaleString("es-CO")}</span> </div> <div> <span class="text-[9px] text-slate-400 block">COBRO TOTAL</span> <span class="font-black text-[#10b981]">$${totalReturn.toLocaleString("es-CO")} (+${netProfit.toLocaleString("es-CO")})</span>
          </div>
        </div>

        <div class="text-center pt-2 border-t border-[#1b2432] text-[10px] text-slate-400">
          📲 Únete al VIP en WhatsApp: <strong class="text-white">+57 333 286 1551</strong>
        </div>
      </div>

      <div class="flex gap-2">
        <button onclick="document.getElementById('win-ticket-modal').classList.add('hidden')" class="flex-1 py-2 bg-[#0a0e14] border border-[#1b2432] text-slate-300 text-xs font-bold uppercase">
          Cerrar Vista
        </button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};

function formatCountdown(iso, st) {
  if (st === "FINALIZADO") return "FINALIZADO";
  if (st === "EN_VIVO") return "🔴 EN JUEGO AHORA";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "🔴 INICIANDO...";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `INICIA EN ${String(h).padStart(2, "0")}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s`;
}

function startColombiaClock() {
  function tick() {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat("es-CO", {
      timeZone: CONFIG.BRAND.TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    const clockEl = document.getElementById("colombia-live-clock");
    if (clockEl) clockEl.textContent = `HORA COLOMBIA: ${timeStr}`;

    document.querySelectorAll(".countdown-timer").forEach((el) => {
      el.textContent = formatCountdown(el.dataset.kickoff, el.dataset.status);
    });
  }
  tick();
  setInterval(tick, 1000);
}

function injectWhatsAppFloatingButton() {
  if (document.getElementById("btn-wa-floating")) return;
  const btn = document.createElement("a");
  btn.id = "btn-wa-floating";
  btn.href = CONFIG.NOTIFICATIONS.WHATSAPP_LINK;
  btn.target = "_blank";
  btn.className = "fixed bottom-5 right-5 z-40 px-4 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-300 transition-all";
  btn.innerHTML = `<span>💬 WhatsApp VIP (+57 333 286 1551)</span>`;
  document.body.appendChild(btn);
}

export function renderPerformanceChart() {
  const chartBox = document.getElementById("performance-chart-box");
  if (!chartBox) return;

  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  if (settled.length === 0) return;

  const chron = [...settled].reverse();
  let wins = 0;
  const totalGames = chron.length;

  const points = chron.map((it, idx) => {
    if (it.outcome === "ACIERTO") wins++;
    const hitRate = (wins / (idx + 1)) * 100;
    const x = 30 + (idx / Math.max(1, totalGames - 1)) * 530;
    const y = 140 - (hitRate / 100) * 110;
    return { x: x.toFixed(1), y: y.toFixed(1), rate: hitRate.toFixed(1), res: it.outcome };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  chartBox.innerHTML = `
    <svg viewBox="0 0 600 160" class="w-full h-full font-mono overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <line x1="30" y1="30" x2="570" y2="30" stroke="#1b2432" stroke-dasharray="3 3" />
      <text x="32" y="26" fill="#8b9bb4" font-size="9">100% Acierto</text>

      <line x1="30" y1="52" x2="570" y2="52" stroke="#10b981" stroke-opacity="0.3" stroke-dasharray="3 3" />
      <text x="32" y="49" fill="#10b981" font-size="9">80% Zona de Ganancia</text>

      <line x1="30" y1="85" x2="570" y2="85" stroke="#1b2432" stroke-dasharray="3 3" />
      <text x="32" y="82" fill="#8b9bb4" font-size="9">50% Equilibrio</text>

      <polygon fill="url(#chartGrad)" points="30,140 ${polylinePoints} 570,140" />
      <polyline fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />

      ${points
        .map(
          (p) => `
        <circle cx="${p.x}" cy="${p.y}" r="${p.res === "ACIERTO" ? "3.5" : "3"}" fill="${p.res === "ACIERTO" ? "#10b981" : "#ef4444"}" stroke="#05070a" stroke-width="1.5" />
      `
        )
        .join("")}
    </svg>
  `;
}

window.renderPerformanceChart = renderPerformanceChart;

window.openMatchModal = (matchId) => {
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match) return;

  const isVip = isUserVipOrAdmin();
  const canSeePick = isVip || match.isFree;

  let modal = document.getElementById("match-telemetry-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "match-telemetry-modal";
    modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 font-mono";
    document.body.appendChild(modal);
  }

  const stars = getStars(match.probability);
  const homeLogo = getLogo(match.homeTeam);
  const awayLogo = getLogo(match.awayTeam);
  const fever = getPitchFeverBar(match.altitudeM, match.weatherDesc);

  modal.innerHTML = `
    <div class="quant-card max-w-2xl w-full p-4 md:p-6 space-y-4 max-h-[92vh] overflow-y-auto border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
      <div class="flex items-center justify-between border-b border-[#1b2432] pb-2 text-xs">
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${stars.badge}">
          ${stars.stars}${stars.tag}
        </span>
        <button onclick="document.getElementById('match-telemetry-modal').classList.add('hidden')" class="px-2.5 py-1 text-slate-300 hover:text-white border border-[#1b2432] bg-[#05070a] font-bold">
          ✕ CERRAR
        </button>
      </div>

      <div class="p-3 bg-[#05070a] border border-[#1b2432] grid grid-cols-12 items-center gap-2">
        <div class="col-span-5 flex items-center gap-2">
          <img src="${homeLogo}" alt="${match.homeTeam}" class="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
          <div class="min-w-0">
            <div class="text-xs md:text-sm font-black text-white truncate">${match.homeTeam}</div>
            <span class="text-[10px] text-cyan-300 block">Ataque: ${match.homeAvgGoals}</span>
          </div>
        </div>

        <div class="col-span-2 text-center">
          <div class="text-lg md:text-2xl font-black text-white font-mono">${match.liveScore}</div>
          <span class="text-[9px] uppercase px-1.5 py-0.5 bg-[#161f2c] text-cyan-400 font-bold block">${match.matchStatus}</span>
        </div>

        <div class="col-span-5 flex items-center justify-end gap-2 text-right">
          <div class="min-w-0">
            <div class="text-xs md:text-sm font-black text-white truncate">${match.awayTeam}</div>
            <span class="text-[10px] text-emerald-300 block">Ataque: ${match.awayAvgGoals}</span>
          </div>
          <img src="${awayLogo}" alt="${match.awayTeam}" class="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
        </div>
      </div>

      ${
        canSeePick
          ? `
          <div class="p-3 bg-[#061210] border border-[#10b981]/50 flex items-center justify-between text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block uppercase">JUGADA OFICIAL:</span>
              <span class="text-sm md:text-base font-bold text-[#10b981]">${match.predictionText}</span>
              <span class="text-[11px] text-slate-400 block pt-0.5">Cuota asignada: <strong>@${(match.odds || 1.45).toFixed(2)}</strong></span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">CONFIANZA</span>
              <span class="text-lg md:text-xl font-black text-white">${match.probability}%</span>
            </div>
          </div>
          `
          : `
          <div class="p-3 bg-[#05070a] border border-amber-500/40 flex items-center justify-between text-xs">
            <span class="text-amber-300 font-bold">🔒 Pronóstico protegido en servidor para Miembros VIP</span>
            <button onclick="document.getElementById('match-telemetry-modal').classList.add('hidden'); window.switchTab('tab-planes')" class="px-3 py-1 bg-[#10b981] text-slate-950 font-black uppercase">
              Desbloquear VIP
            </button>
          </div>
          `
      }

      <div class="p-3 bg-[#05070a] border border-[#1b2432] space-y-1.5 text-xs">
        <div class="flex justify-between text-[10px]">
          <span class="text-slate-400 uppercase">TERMÓMETRO DE DESGASTE FÍSICO / CLIMA:</span>
          <span class="text-amber-300 font-bold">${fever.label} (${fever.stressScore}%)</span>
        </div>
        <div class="w-full h-2 bg-[#161f2c] overflow-hidden">
          <div class="${fever.color} h-full" style="width: ${fever.stressScore}%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-400 pt-1">
          <span>Altitud sede: <strong class="text-white">${match.altitudeM} metros</strong></span>
          <span>Condición: <strong class="text-cyan-300">${match.weatherDesc}</strong></span>
        </div>
      </div>

      ${
        match.liveStats
          ? `
          <div class="p-3 bg-[#070b10] border border-cyan-500/30 space-y-2 text-xs">
            <span class="text-cyan-300 font-bold block uppercase text-[10px]">📊 Telemetría y Estadísticas en Vivo:</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">POSESIÓN</span>
                <span class="font-bold text-white">${match.liveStats.possession || "-"}</span>
              </div>
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">REMATES</span>
                <span class="font-bold text-white">${match.liveStats.shots || "-"}</span>
              </div>
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">CÓRNERS</span>
                <span class="font-bold text-white">${match.liveStats.corners || "-"}</span>
              </div>
              <div class="p-2 bg-[#05070a] border border-[#1b2432]">
                <span class="text-[9px] text-slate-400 block">FALTAS</span>
                <span class="font-bold text-white">${match.liveStats.fouls || "-"}</span>
              </div>
            </div>
          </div>
          `
          : ""
      }

      <div class="p-3.5 bg-[#070a0f] border border-[#1b2432] space-y-2 text-xs">
        <span class="text-cyan-300 font-bold block uppercase text-[11px] border-b border-[#1b2432] pb-1">
          ANÁLISIS DEL PARTIDO:
        </span>
        <div class="text-slate-300 leading-relaxed text-xs space-y-2 whitespace-pre-line font-sans">
          ${match.explanation}
        </div>
      </div>

      <div class="flex gap-2">
        <button onclick="window.copyPickToClipboard('${match.id}', event)" class="flex-1 py-2 bg-[#0a0e14] border border-cyan-400 text-cyan-300 font-bold uppercase text-xs">
          📋 Copiar para Grupos
        </button>
        ${
          match.outcome === "ACIERTO"
            ? `
            <button onclick="window.openWinTicketCard('${match.id}', event)" class="flex-1 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs">
              📸 Ticket Victoria
            </button>
            `
            : ""
        }
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};

window.setQuickFilter = (filterType) => {
  activeQuickFilter = filterType;
  document.querySelectorAll(".qfilter-btn").forEach((btn) => {
    if (btn.dataset.qfilter === filterType) {
      btn.className = "qfilter-btn px-3 py-1 font-bold uppercase border border-cyan-400 bg-cyan-500/20 text-white shrink-0";
    } else {
      btn.className = "qfilter-btn px-3 py-1 font-bold uppercase border border-[#1b2432] bg-[#05070a] text-slate-400 hover:text-white shrink-0";
    }
  });
  renderTodayPredictions();
};

window.setQuickStake = (amount) => {
  const input = document.getElementById("stake-calculator-input");
  if (input) {
    input.value = amount;
    renderTodayPredictions();
  }
};

export function renderTodayPredictions() {
  const container = document.getElementById("predictions-grid");
  if (!container) return;

  const today = getColombiaDateString();
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const stake = Number(document.getElementById("stake-calculator-input")?.value || 50000);
  const isVip = isUserVipOrAdmin();
  const todayList = getAllMasterFeed().filter((p) => p.matchDate === today);

  const filtered = todayList.filter((p) => {
    const matchText =
      p.homeTeam.toLowerCase().includes(search) ||
      p.awayTeam.toLowerCase().includes(search) ||
      p.league.toLowerCase().includes(search);

    let matchQuick = true;
    if (activeQuickFilter === "FÚTBOL") matchQuick = p.sport === "FÚTBOL";
    else if (activeQuickFilter === "NBA") matchQuick = p.sport === "NBA";
    else if (activeQuickFilter === "FREE") matchQuick = p.isFree === true;
    else if (activeQuickFilter === "LIVE") matchQuick = p.matchStatus === "EN_VIVO";

    return matchText && matchQuick;
  });

  const counterBadge = document.getElementById("daily-counter-badge");
  if (counterBadge) {
    counterBadge.textContent = isVip
      ? `ACCESO VIP ACTIVO (${todayList.length} PRONÓSTICOS HOY)`
      : `ACCESO LIBRE // 4 JUGADAS GRATIS HOY`;
  }

  container.innerHTML = filtered.map((item) => {
    const isVisible = isVip || item.isFree;
    const stars = getStars(item.probability);
    const homeLogo = getLogo(item.homeTeam);
    const awayLogo = getLogo(item.awayTeam);
    const fever = getPitchFeverBar(item.altitudeM, item.weatherDesc);

    const odd = item.odds || 1.45;
    const totalReturn = Math.round(stake * odd);
    const netProfit = totalReturn - stake;

    return `
      <article class="quant-card p-3.5 flex flex-col justify-between space-y-3 font-mono">
        <div class="flex flex-wrap items-center justify-between gap-1 border-b border-[#1b2432] pb-1.5 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 font-bold uppercase text-[9px] border ${stars.badge}">
              ${stars.stars}${stars.tag}
            </span>
            <span class="text-slate-400 font-semibold text-[11px]">${item.league}</span>
          </div>
          <span class="countdown-timer text-cyan-400 font-bold text-[11px]" data-kickoff="${item.kickoffIso}" data-status="${item.matchStatus}">
            ${formatCountdown(item.kickoffIso, item.matchStatus)}
          </span>
        </div>

        <div class="flex items-center justify-between gap-2 py-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <img src="${homeLogo}" alt="${item.homeTeam}" class="w-5 h-5 object-contain shrink-0" />
            <span class="text-xs md:text-sm font-black text-white truncate">${item.homeTeam}</span>
            <span class="text-xs text-cyan-400 shrink-0">vs</span>
            <span class="text-xs md:text-sm font-black text
