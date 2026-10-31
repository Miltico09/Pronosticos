// ============================================================================
// ARCHIVO: pronosticos.js
// Cálculo Oficial Corregido: Multiplicadores Reales de Cuota y Balance
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_KEY = "optacore_master_feed_v10";

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
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League (Inglaterra)",
      homeTeam: "Manchester City",
      awayTeam: "Brighton",
      predictionText: "Manchester City Gana + Más de 1.5 Goles Totales",
      odds: 1.45,
      probability: 92.5,
      isFree: true,
      altitudeM: 48,
      weatherDesc: "Frío húmedo (12°C)",
      homeAvgGoals: "2.7 por partido",
      awayAvgGoals: "0.8 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El Manchester City en su estadio es una máquina que arranca a toda velocidad desde el primer minuto. Brighton siempre intenta salir jugando con la pelota dominada y suele perder balones peligrosos muy cerca de su propio arco.\n\n¿Cómo se resolvió?: El City marcó dos goles en el primer tiempo. En el segundo tiempo Brighton descontó, pero Haaland liquidó el 3-1 definitivo asegurando la victoria con total tranquilidad.`,
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261031-02",
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "12:30"),
      kickoffLabel: "12:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayern Múnich",
      awayTeam: "Borussia Dortmund",
      predictionText: "Más de 2.5 Goles Totales (Mínimo 3 goles)",
      odds: 1.40,
      probability: 93.0,
      isFree: true,
      altitudeM: 519,
      weatherDesc: "Clima fresco (10°C)",
      homeAvgGoals: "2.9 por partido",
      awayAvgGoals: "1.6 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El clásico alemán siempre es de ida y vuelta. Ambos clubes tienen delanteros top pero defensas que dejan espacios cuando van al ataque.\n\n¿Cómo se resolvió?: El primer tiempo terminó 1-1. Tras el minuto 60 llegaron tres goles más para un 3-2 final que superó con comodidad la línea requerida.`,
      liveScore: "3 - 2",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261031-03",
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "15:00"),
      kickoffLabel: "15:00 COL",
      league: "LaLiga (España)",
      homeTeam: "FC Barcelona",
      awayTeam: "Deportivo Alavés",
      predictionText: "Barcelona Gana por 2 o más goles (Hándicap -1.5)",
      odds: 1.50,
      probability: 88.5,
      isFree: true,
      altitudeM: 120,
      weatherDesc: "Agradable (19°C)",
      homeAvgGoals: "3.0 por partido",
      awayAvgGoals: "0.6 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Barcelona venía con racha perfecta de local. Alavés sufre muchísimo cuando baja al nivel del mar ante rivales que le esconden la pelota.\n\n¿Cómo se resolvió?: Dominio del 72% de posesión culé y triunfo cómodo 2-0 sin pasar apuros.`,
      liveScore: "2 - 0",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "20261031-04",
      sport: "FÚTBOL",
      matchDate: today,
      kickoffIso: makeIso(today, "18:05"),
      kickoffLabel: "18:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Llaneros FC",
      awayTeam: "Junior de Barranquilla",
      predictionText: "Junior Gana o Empata (X2) + Más de 1.5 Goles",
      odds: 1.48,
      probability: 91.0,
      isFree: true,
      altitudeM: 467,
      weatherDesc: "Calor húmedo (27°C)",
      homeAvgGoals: "1.2 por partido",
      awayAvgGoals: "1.7 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Villavicencio tiene 27°C y humedad alta, clima donde los jugadores costeños de Junior rinden con potencia física a diferencia de la altura andina.`,
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },
    {
      id: "20261031-05",
      sport: "NBA",
      matchDate: today,
      kickoffIso: makeIso(today, "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Minnesota Timberwolves",
      awayTeam: "San Antonio Spurs",
      predictionText: "Más de 214.5 Puntos Totales (Línea Protegida)",
      odds: 1.42,
      probability: 93.5,
      isFree: false,
      altitudeM: 253,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "116 pts esperados",
      awayAvgGoals: "105 pts esperados",
      explanation: `¿Por qué se eligió esta jugada?: Se compraron casi 9 puntos de protección frente a la línea de 223.0 que pusieron las casas de apuestas. Minnesota llega con descanso completo.`,
      liveScore: "vs",
      matchStatus: "PROGRAMADO",
      outcome: "PENDIENTE",
    },

    // --- AYER (30 DE OCTUBRE) ---
    {
      id: "20261030-01",
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "20:05"),
      kickoffLabel: "20:05 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Atlético Bucaramanga",
      awayTeam: "Deportivo Pasto",
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
      sport: "NBA",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Miami Heat",
      awayTeam: "Indiana Pacers",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "18:00"),
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Deportivo Pereira",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-30",
      kickoffIso: makeIso("2026-10-30", "14:30"),
      kickoffLabel: "14:30 COL",
      league: "Bundesliga (Alemania)",
      homeTeam: "Bayer Leverkusen",
      awayTeam: "VfB Stuttgart",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "18:30"),
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "América de Cali",
      awayTeam: "Fortaleza CEIF",
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
      sport: "NBA",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA (EE. UU.)",
      homeTeam: "Utah Jazz",
      awayTeam: "Sacramento Kings",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-29",
      kickoffIso: makeIso("2026-10-29", "14:00"),
      kickoffLabel: "14:00 COL",
      league: "Copa del Rey (España)",
      homeTeam: "SD Compostela",
      awayTeam: "Deportivo Alavés",
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
      sport: "NBA",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "20:30"),
      kickoffLabel: "20:30 COL",
      league: "NBA",
      homeTeam: "Phoenix Suns",
      awayTeam: "Dallas Mavericks",
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
      sport: "NBA",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "19:30"),
      kickoffLabel: "19:30 COL",
      league: "NBA",
      homeTeam: "Golden State Warriors",
      awayTeam: "LA Clippers",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "17:15"),
      kickoffLabel: "17:15 COL",
      league: "Liga BetPlay",
      homeTeam: "Junior de Barranquilla",
      awayTeam: "América de Cali",
      predictionText: "Junior Más de 0.5 Goles en Casa",
      odds: 1.30,
      probability: 91.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor de Barranquilla",
      homeAvgGoals: "3",
      awayAvgGoals: "1",
      explanation: `Junior fue una aplanadora en el Metropolitano ganando 3-1.`,
      liveScore: "3 - 1",
      matchStatus: "FINALIZADO",
      outcome: "ACIERTO",
    },
    {
      id: "PARLEY13-04",
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "14:45"),
      kickoffLabel: "14:45 COL",
      league: "Ligue 1",
      homeTeam: "Olympique Marsella",
      awayTeam: "PSG",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "12:00"),
      kickoffLabel: "12:00 COL",
      league: "Serie A",
      homeTeam: "Inter de Milán",
      awayTeam: "Juventus",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Premier League",
      homeTeam: "Arsenal",
      awayTeam: "Liverpool",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-25",
      kickoffIso: makeIso("2026-10-25", "10:00"),
      kickoffLabel: "10:00 COL",
      league: "Premier League",
      homeTeam: "Chelsea",
      awayTeam: "Newcastle",
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
      sport: "NBA",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "19:00"),
      kickoffLabel: "19:00 COL",
      league: "NBA",
      homeTeam: "Denver Nuggets",
      awayTeam: "LA Clippers",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "18:30"),
      kickoffLabel: "18:30 COL",
      league: "Liga BetPlay",
      homeTeam: "Deportes Tolima",
      awayTeam: "Once Caldas",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "16:15"),
      kickoffLabel: "16:15 COL",
      league: "Liga BetPlay",
      homeTeam: "Independiente Medellín",
      awayTeam: "Jaguares de Córdoba",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "14:00"),
      kickoffLabel: "14:00 COL",
      league: "LaLiga",
      homeTeam: "Real Madrid",
      awayTeam: "FC Barcelona",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "11:30"),
      kickoffLabel: "11:30 COL",
      league: "Bundesliga",
      homeTeam: "RB Leipzig",
      awayTeam: "SC Freiburg",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-24",
      kickoffIso: makeIso("2026-10-24", "09:00"),
      kickoffLabel: "09:00 COL",
      league: "Premier League",
      homeTeam: "Aston Villa",
      awayTeam: "Bournemouth",
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
      sport: "FÚTBOL",
      matchDate: "2026-10-23",
      kickoffIso: makeIso("2026-10-23", "18:00"),
      kickoffLabel: "18:00 COL",
      league: "Liga BetPlay (Colombia)",
      homeTeam: "Jaguares de Córdoba",
      awayTeam: "Llaneros FC",
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
  btn.className = "fixed bottom-5 right-5 z-50 px-4 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-300 transition-all";
  btn.innerHTML = `<span>💬 WhatsApp VIP (+57 333 286 1551)</span>`;
  document.body.appendChild(btn);
}

// Curva acumulada
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

function setupTabNavigation() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const tabId = btn.dataset.tab;
      if (tabId) {
        switchTab(tabId);
        if (tabId === "tab-historial") {
          setTimeout(renderPerformanceChart, 50);
        }
      }
    };
  });
}

// Modal Emergente
window.openMatchModal = (matchId) => {
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match) return;

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

  modal.innerHTML = `
    <div class="quant-card max-w-2xl w-full p-4 md:p-6 space-y-4 max-h-[92vh] overflow-y-auto border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
      <div class="flex items-center justify-between border-b border-[#1b2432] pb-2 text-xs">
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${stars.badge}">
          ${stars.stars} ${stars.tag}
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

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#05070a] p-3 border border-[#1b2432] text-xs">
        <div>
          <span class="text-[10px] text-slate-400 block">ALTURA / VIAJE</span>
          <span class="text-white font-bold">${match.altitudeM} metros</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block">CLIMA EN CANCHA</span>
          <span class="text-cyan-300 font-bold">${match.weatherDesc}</span>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <span class="text-[10px] text-slate-400 block">ESTADO</span>
          <span class="text-[#10b981] font-bold">${match.outcome === "ACIERTO" ? "Ganada con éxito" : match.outcome === "FALLO" ? "Jugada caída" : "En juego"}</span>
        </div>
      </div>

      <div class="p-3.5 bg-[#070a0f] border border-[#1b2432] space-y-2 text-xs">
        <span class="text-cyan-300 font-bold block uppercase text-[11px] border-b border-[#1b2432] pb-1">
          ANÁLISIS DEL PARTIDO:
        </span>
        <div class="text-slate-300 leading-relaxed text-xs space-y-2 whitespace-pre-line font-sans">
          ${match.explanation}
        </div>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};

// Renderizado de Pronósticos de Hoy
export function renderTodayPredictions() {
  const container = document.getElementById("predictions-grid");
  if (!container) return;

  const today = getColombiaDateString();
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const isVip = isUserVipOrAdmin();
  const todayList = getAllMasterFeed().filter((p) => p.matchDate === today);

  const filtered = todayList.filter((p) => {
    return p.homeTeam.toLowerCase().includes(search) ||
           p.awayTeam.toLowerCase().includes(search) ||
           p.league.toLowerCase().includes(search);
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

    return `
      <article class="quant-card p-3.5 flex flex-col justify-between space-y-3 font-mono">
        <div class="flex flex-wrap items-center justify-between gap-1 border-b border-[#1b2432] pb-1.5 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 font-bold uppercase text-[9px] border ${stars.badge}">
              ${stars.stars} ${stars.tag}
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
            <span class="text-xs md:text-sm font-black text-white truncate">${item.awayTeam}</span>
            <img src="${awayLogo}" alt="${item.awayTeam}" class="w-5 h-5 object-contain shrink-0" />
          </div>
          <span class="text-[11px] text-slate-400 shrink-0">${item.kickoffLabel}</span>
        </div>

        ${
          isVisible
            ? `
            <div class="p-2.5 bg-[#05070a] border border-[#10b981]/40 flex items-center justify-between gap-2 text-xs">
              <div>
                <span class="text-[9px] uppercase text-slate-400 block">JUGADA SUGERIDA:</span>
                <span class="text-xs md:text-sm font-bold text-[#10b981]">${item.predictionText}</span>
                <span class="text-[10px] text-slate-400 block">Cuota: @${(item.odds || 1.45).toFixed(2)}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-slate-400 block">PROBABILIDAD</span>
                <span class="text-sm md:text-base font-black text-white">${item.probability}%</span>
              </div>
            </div>
            `
            : `
            <div class="p-2.5 bg-[#05070a] border border-[#1b2432] flex items-center justify-between text-xs">
              <span class="text-slate-400 text-[11px]">🔒 Jugada exclusiva para miembros VIP</span>
              <button onclick="window.optacoreGoVip()" class="px-2 py-1 bg-[#10b981] text-slate-950 text-[10px] font-bold uppercase">
                Hazte VIP
              </button>
            </div>
            `
        }

        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-[#1b2432]">
          <span class="text-slate-400">${item.weatherDesc}</span>
          <button onclick="window.openMatchModal('${item.id}')" class="px-2.5 py-1 text-[10px] font-bold uppercase bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black">
            🔍 Ver Análisis
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// ============================================================================
// CÁLCULO DE MULTIPLICADOR Y RESULTADOS DE HOY (CORREGIDO)
// ============================================================================
export function renderTodayResults() {
  const box = document.getElementById("today-results-container");
  const summaryBox = document.getElementById("today-financial-summary");
  if (!box) return;

  const today = getColombiaDateString();
  const todayList = getAllMasterFeed().filter((p) => p.matchDate === today);

  let totalOddsWon = 0; // Suma de cuotas ganadas
  let totalOddsLost = 0; // Cuotas caídas
  let countWon = 0;
  let countLost = 0;

  todayList.forEach((p) => {
    const o = p.odds || 1.45;
    if (p.outcome === "ACIERTO") {
      totalOddsWon += o;
      countWon++;
    } else if (p.outcome === "FALLO") {
      totalOddsLost += o;
      countLost++;
    }
  });

  // Balance Neto: Cuotas cobradas menos las caídas
  const netDiff = totalOddsWon - totalOddsLost;

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="quant-card p-3 border-emerald-500/40">
        <span class="text-[10px] text-slate-400 block uppercase font-bold">MULTIPLICADOR COBRADO</span>
        <span class="text-lg font-black text-[#10b981]">+${totalOddsWon.toFixed(2)}x</span>
        <span class="text-[10px] text-slate-400 block">${countWon} jugada(s) ganada(s)</span>
      </div>
      <div class="quant-card p-3 border-red-500/40">
        <span class="text-[10px] text-slate-400 block uppercase font-bold">MULTIPLICADOR CAÍDO</span>
        <span class="text-lg font-black text-red-400">-${totalOddsLost.toFixed(2)}x</span>
        <span class="text-[10px] text-slate-400 block">${countLost} jugada(s) caída(s)</span>
      </div>
      <div class="quant-card p-3 ${netDiff >= 0 ? "border-cyan-500/40" : "border-amber-500/40"}">
        <span class="text-[10px] text-slate-400 block uppercase font-bold">BALANCE DEL DÍA</span>
        <span class="text-lg font-black ${netDiff >= 0 ? "text-cyan-400" : "text-amber-400"}">${netDiff >= 0 ? "+" : ""}${netDiff.toFixed(2)}x</span>
        <span class="text-[10px] text-slate-400 block">Rendimiento neto</span>
      </div>
    `;
  }

  box.innerHTML = todayList.map((p) => {
    const badge = p.outcome === "ACIERTO"
      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
      : p.outcome === "FALLO"
      ? "border-red-500 bg-red-500/20 text-red-300"
      : "border-cyan-500 bg-cyan-500/20 text-cyan-300";

    return `
      <div class="quant-card p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs cursor-pointer hover:border-cyan-400/50" onclick="window.openMatchModal('${p.id}')">
        <div class="space-y-0.5">
          <span class="text-[10px] text-slate-400">${p.kickoffLabel} • ${p.league}</span>
          <div class="text-xs md:text-sm font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</div>
          <div class="text-cyan-300 text-[11px]">Pronóstico: ${p.predictionText} (@${(p.odds || 1.45).toFixed(2)})</div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-[9px] text-slate-400 block">${p.matchStatus}</span>
            <span class="text-sm md:text-base font-black text-white">${p.liveScore}</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${badge}">${p.outcome}</span>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// CÁLCULO DE MULTIPLICADOR EN EL HISTORIAL (CORREGIDO)
// ============================================================================
export function renderFullPublicHistory() {
  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");

  let totalOddsWon = 0;
  let totalOddsLost = 0;
  let countWins = 0;
  let countLosses = 0;

  settled.forEach((p) => {
    const o = p.odds || 1.45;
    if (p.outcome === "ACIERTO") {
      totalOddsWon += o;
      countWins++;
    } else if (p.outcome === "FALLO") {
      totalOddsLost += o;
      countLosses++;
    }
  });

  const netBalance = totalOddsWon - totalOddsLost;

  const financialSummaryBox = document.getElementById("history-financial-summary");
  if (financialSummaryBox) {
    financialSummaryBox.innerHTML = `
      <div class="quant-card p-4 border-emerald-500/50 font-mono">
        <span class="text-[10px] text-slate-400 uppercase block font-bold">MULTIPLICADOR TOTAL COBRADO</span>
        <span class="text-2xl font-black text-[#10b981]">+${totalOddsWon.toFixed(2)}x</span>
        <span class="text-[11px] text-slate-400 block">${countWins} cuotas acertadas acumuladas</span>
      </div>
      <div class="quant-card p-4 border-red-500/50 font-mono">
        <span class="text-[10px] text-slate-400 uppercase block font-bold">MULTIPLICADOR CAÍDO</span>
        <span class="text-2xl font-black text-red-400">-${totalOddsLost.toFixed(2)}x</span>
        <span class="text-[11px] text-slate-400 block">${countLosses} partidos no completados</span>
      </div>
      <div class="quant-card p-4 border-cyan-500/50 font-mono">
        <span class="text-[10px] text-cyan-300 uppercase block font-bold">BALANCE NETO AUDITADO</span>
        <span class="text-2xl font-black ${netBalance >= 0 ? "text-white" : "text-amber-400"}">${netBalance >= 0 ? "+" : ""}${netBalance.toFixed(2)}x</span>
        <span class="text-[11px] text-[#10b981] block font-bold">Rendimiento positivo real</span>
      </div>
    `;
  }

  const calc = (arr) => {
    const valids = arr.filter((x) => x.outcome === "ACIERTO" || x.outcome === "FALLO");
    if (valids.length === 0) return { pct: "0.0", w: 0, tot: 0 };
    const w = valids.filter((x) => x.outcome === "ACIERTO").length;
    return { pct: ((w / valids.length) * 100).toFixed(1), w, tot: valids.length };
  };

  const totalStats = calc(settled);
  const fbStats = calc(settled.filter((p) => p.sport === "FÚTBOL"));
  const nbaStats = calc(settled.filter((p) => p.sport === "NBA"));
  const fiveStars = calc(settled.filter((p) => p.probability >= 90));

  const kpiEl = document.getElementById("history-kpi-cards");
  if (kpiEl) {
    kpiEl.innerHTML = `
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">EFECTIVIDAD REAL</span>
        <span class="text-xl font-black text-[#10b981]">${totalStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${totalStats.w} de ${totalStats.tot} aciertos</span>
      </div>
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">FÚTBOL</span>
        <span class="text-xl font-black text-cyan-400">${fbStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${fbStats.w}/${fbStats.tot} acertados</span>
      </div>
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">NBA</span>
        <span class="text-xl font-black text-white">${nbaStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${nbaStats.w}/${nbaStats.tot} acertados</span>
      </div>
      <div class="quant-card p-3 font-mono">
        <span class="text-[9px] text-slate-400 block">⭐⭐⭐⭐⭐ (5★)</span>
        <span class="text-xl font-black text-cyan-300">${fiveStars.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${fiveStars.w} de ${fiveStars.tot} acertados</span>
      </div>
    `;
  }

  renderPerformanceChart();

  const tbody = document.getElementById("history-table-body");
  if (tbody) {
    tbody.innerHTML = all.map((p) => {
      const badge = p.outcome === "ACIERTO"
        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
        : p.outcome === "FALLO"
        ? "border-red-500 bg-red-500/20 text-red-300"
        : "border-cyan-500 bg-cyan-500/20 text-cyan-300";

      return `
        <tr class="hover:bg-[#0f151f] text-xs font-mono cursor-pointer" onclick="window.openMatchModal('${p.id}')">
          <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${p.matchDate}</td>
          <td class="py-2.5 px-3 text-slate-300 whitespace-nowrap">${p.sport} // ${p.league}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${p.homeTeam} vs ${p.awayTeam}</td>
          <td class="py-2.5 px-3 text-cyan-300 whitespace-nowrap">${p.predictionText}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">@${(p.odds || 1.45).toFixed(2)}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${p.liveScore}</td>
          <td class="py-2.5 px-3 whitespace-nowrap"><span class="px-2 py-0.5 text-[9px] font-bold uppercase border ${badge}">${p.outcome}</span></td>
          <td class="py-2.5 px-3 text-right whitespace-nowrap"><span class="text-cyan-400 underline text-[10px]">Ver Análisis →</span></td>
        </tr>
      `;
    }).join("");
  }
}

window.optacoreGoVip = () => switchTab("tab-planes");

document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();
  startColombiaClock();
  injectWhatsAppFloatingButton();
  renderTodayPredictions();
  renderTodayResults();
  renderFullPublicHistory();

  document.getElementById("search-input")?.addEventListener("input", renderTodayPredictions);
});
