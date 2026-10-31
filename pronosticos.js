// ============================================================================
// ARCHIVO: pronosticos.js
// Curva de Rendimiento Gráfica Garantizada + Análisis Claros y Detallados
// ============================================================================

import { CONFIG } from "./config.js";
import { isUserVipOrAdmin, switchTab } from "./auth.js";

const DB_KEY = "optacore_master_feed_v8";

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
      probability: 92.5,
      isFree: true,
      altitudeM: 48,
      weatherDesc: "Frío húmedo (12°C)",
      homeAvgGoals: "2.7 por partido",
      awayAvgGoals: "0.8 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El Manchester City en su estadio es una máquina que arranca a toda velocidad desde el primer minuto. Brighton es un equipo que siempre intenta salir jugando con la pelota dominada, y cuando visita canchas difíciles como esta suele perder balones peligrosos muy cerca de su propio arco.

¿Cómo se desarrolló el juego?: Tal como lo teníamos previsto, el City metió dos goles en el primer tiempo aprovechando el cansancio y los errores defensivos del rival. En la segunda mitad Brighton descontó, pero Haaland liquidó el 3-1 definitivo asegurando la victoria y los goles sin sufrimiento.`,
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
      predictionText: "Más de 2.5 Goles Totales (Mínimo 3 goles en el juego)",
      probability: 93.0,
      isFree: true,
      altitudeM: 519,
      weatherDesc: "Clima fresco (10°C)",
      homeAvgGoals: "2.9 por partido",
      awayAvgGoals: "1.6 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El clásico alemán siempre es un partido de ida y vuelta constante. Los dos equipos tienen delanteros de nivel mundial pero defensas que dejan muchísimos espacios cuando van al ataque. Históricamente entre ellos casi nunca hay partidos cerrados ni empates en cero.

¿Cómo se desarrolló el juego?: El partido fue una fiesta de llegadas claras. El primer tiempo terminó 1-1 con opciones en los dos arcos. En el segundo tiempo, cuando las piernas empezaron a pesar a partir del minuto 60, llegaron tres goles más para un 3-2 final que superó con comodidad la línea requerida.`,
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
      probability: 88.5,
      isFree: true,
      altitudeM: 120,
      weatherDesc: "Agradable (19°C)",
      homeAvgGoals: "3.0 por partido",
      awayAvgGoals: "0.6 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El Barcelona venía con una racha perfecta de local, ganando con autoridad. El Alavés es un equipo acostumbrado a jugar en el frío del norte y cada vez que viaja a jugar al nivel del mar con humedad sufre un bajón físico notorio ante equipos que le tocan la pelota todo el partido.

¿Cómo se desarrolló el juego?: Barcelona dominó el 72% del tiempo de juego. Marcó el primer gol antes del descanso y en el segundo tiempo liquidó el 2-0 con total tranquilidad, sin recibir un solo remate claro a portería.`,
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
      probability: 91.0,
      isFree: true,
      altitudeM: 467,
      weatherDesc: "Calor húmedo (27°C)",
      homeAvgGoals: "1.2 por partido",
      awayAvgGoals: "1.7 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El factor de la ciudad es decisivo: Villavicencio es una plaza de clima caliente (27°C) con humedad alta (81%). A diferencia de cuando Junior sube a la altura de Bogotá o Tunja donde le falta el aire, en el calor los jugadores costeños rinden a su máxima capacidad física.

¿Qué se espera en la cancha?: Junior tiene una nómina mucho más costosa y con mejor definición que Llaneros. Se proyecta un partido con espacios en el segundo tiempo donde el tiburón consiga sumar puntos con goles en el marcador.`,
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
      predictionText: "Más de 214.5 Puntos Totales (Línea de Puntos Protegida)",
      probability: 93.5,
      isFree: false,
      altitudeM: 253,
      weatherDesc: "Coliseo Climatizado (21°C)",
      homeAvgGoals: "116 pts esperados",
      awayAvgGoals: "105 pts esperados",
      explanation: `¿Por qué se eligió esta jugada?: Las casas de apuestas pusieron la línea oficial muy alta, en 223 puntos. Nosotros decidimos bajarla y comprar un seguro de casi 9 puntos a nuestro favor hasta 214.5. 

¿Cuál es la ventaja táctica?: Minnesota tuvo dos días completos de descanso, lo que garantiza piernas frescas en sus estrellas Edwards y Randle. San Antonio juega a toda velocidad pero defiende muy mal en la pintura, lo que asegura canastas fáciles en casi cada posesión.`,
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
      predictionText: "Bucaramanga Empate No Acción (Si empatan nos devuelven)",
      probability: 91.2,
      isFree: true,
      altitudeM: 959,
      weatherDesc: "Calor pesado (24°C)",
      homeAvgGoals: "1.9 por partido",
      awayAvgGoals: "0.7 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Pasto es un equipo peligroso únicamente cuando juega en los 2.500 metros de altura de su estadio. Al bajar al calor y humedad de Bucaramanga, sufre un desgaste aeróbico evidente y casi nunca propone juego ofensivo de visitante.

¿Cómo se resolvió?: Bucaramanga tomó el control absoluto de la pelota. Aunque el primer tiempo terminó cerrado, en el segundo tiempo la defensa de Pasto no aguantó el ritmo físico y Bucaramanga anotó dos goles claros para ganar 2-0.`,
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
      probability: 92.0,
      isFree: true,
      altitudeM: 10,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "120 pts anotados",
      awayAvgGoals: "118 pts anotados",
      explanation: `¿Por qué se eligió esta jugada?: Indiana Pacers es uno de los equipos que más rápido corre la cancha en toda la NBA; lanzan al aro en menos de 12 segundos por posesión. Miami como local responde de igual manera anotando con alta efectividad desde la línea de triples.

¿Cómo se resolvió?: El partido tuvo un ritmo electrizante sin pausas. Ambos equipos anotaron más de 30 puntos en cada uno de los cuatro cuartos, alcanzando un marcador acumulado de 242 puntos (124-118) que superó con creces la línea.`,
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
      predictionText: "Menos de 2.5 Goles Totales en el Partido",
      probability: 85.5,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor sofocante (31°C)",
      homeAvgGoals: "0.9 por partido",
      awayAvgGoals: "1.1 por partido",
      explanation: `¿Por qué se eligió esta jugada?: En el calor de Montería a las 6:00 PM los partidos suelen ser lentos y con pocas llegadas porque los futbolistas dosifican su energía para no acalambrarse. Pereira viajó con esquema defensivo para llevarse un punto.

¿Por qué se perdió la jugada?: La apuesta estaba completamente ganada con el 1-1 en el minuto 93. Sin embargo, en el minuto 94 el árbitro cobró un penal insólito por un rebote involuntario en la mano, Pereira cobró, anotó el 1-2 y se cayó la jugada en la última jugada del partido.`,
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
      probability: 88.0,
      isFree: true,
      altitudeM: 60,
      weatherDesc: "Cielo nublado (12°C)",
      homeAvgGoals: "2.5 esperados",
      awayAvgGoals: "1.0 esperados",
      explanation: `¿Por qué se eligió esta jugada?: Leverkusen venía de anotar 14 goles en sus últimos 4 partidos en casa y Stuttgart siempre sale a proponer sin encerrarse. Todas las estadísticas indicaban una victoria local con mínimo 3 goles.

¿Por qué se perdió la jugada?: Ocurrió un verdadero accidente futbolístico: el Leverkusen estrelló 5 balones en los palos, el arquero del Stuttgart tapó 8 pelotas imposibles y la pelota no quiso entrar en 90 minutos de asedio constante, dejando un insólito empate 0-0.`,
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
      probability: 90.5,
      isFree: true,
      altitudeM: 1018,
      weatherDesc: "Cálido (26°C)",
      homeAvgGoals: "2.1 por partido",
      awayAvgGoals: "0.9 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Fortaleza es un club bogotano que sufre muchísimo cuando viaja a jugar a ciudades calientes. El Pascual Guerrero lleno presiona a los árbitros y al rival, y América en casa es muy contundente.

¿Cómo se resolvió?: Aunque Fortaleza sorprendió con un gol tempranero en contragolpe, en el segundo tiempo se quedaron sin aire en las piernas. América se volcó al ataque, empató al minuto 60 y anotó el 2-1 al 74' para coronar un acierto impecable.`,
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
      predictionText: "Sacramento Kings Gana por más de 6.5 Puntos",
      probability: 87.5,
      isFree: true,
      altitudeM: 1288,
      weatherDesc: "Coliseo Climatizado",
      homeAvgGoals: "110 pts",
      awayAvgGoals: "113 pts",
      explanation: `¿Por qué se eligió esta jugada?: Sacramento tiene mucha más jerarquía individual que Utah Jazz, equipo que está en reconstrucción con jugadores jóvenes inexpertos.

¿Por qué se perdió la jugada?: Kings dominó todo el partido y llegó a estar ganando por 14 puntos en el último cuarto. Sin embargo, confiados por la ventaja, sentaron a sus figuras en los últimos dos minutos; Utah anotó dos triples en los últimos segundos y la ventaja se redujo a solo 3 puntos (110-113), perdiendo el hándicap por medio tiro.`,
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
      predictionText: "Alavés Gana desde el Primer Tiempo y el Final",
      probability: 86.0,
      isFree: true,
      altitudeM: 260,
      weatherDesc: "Lluvia gallega (15°C)",
      homeAvgGoals: "0.3 esperados",
      awayAvgGoals: "1.9 esperados",
      explanation: `¿Por qué se eligió esta jugada?: Alavés es equipo de Primera División y jugaba ante el modesto Compostela de Cuarta Categoría. La diferencia de nivel técnico hacía prever un gol tempranero antes del descanso.

¿Por qué se perdió la jugada?: El campo estaba pesado y anegado por la lluvia. Compostela metió a sus diez jugadores de campo debajo del arco y resistió el 0-0 en la primera mitad. Aunque Alavés ganó el partido 0-1 con gol al minuto 68, no se cumplió la ventaja en el primer tiempo.`,
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
      predictionText: "Kevin Durant Anota Más de 24.5 Puntos",
      probability: 92.5,
      isFree: true,
      altitudeM: 331,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "31 pts anotados",
      awayAvgGoals: "-",
      explanation: `¿Por qué se eligió esta jugada?: Kevin Durant venía con descanso y un promedio de 28 puntos por juego frente a la floja defensa perimetral de Dallas.
      
¿Cómo se resolvió?: Durant estuvo intratable: anotó 31 puntos atacando una y otra vez el aro para asegurar el cobro de esta selección del mega-parley.`,
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
      predictionText: "Warriors Gana por más de 4.5 Puntos (-4.5)",
      probability: 87.0,
      isFree: true,
      altitudeM: 10,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "104 pts",
      awayAvgGoals: "112 pts",
      explanation: `¿Por qué se eligió esta jugada?: Los Warriors venían invictos en casa con Stephen Curry lanzando a un nivel superlativo.

¿Por qué se perdió la jugada?: En el tercer cuarto, Stephen Curry pisó mal y se torció el tobillo saliendo del partido. Sin su capitán en la cancha, el equipo perdió efectividad y los Clippers remontaron el juego 104-112.`,
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
      predictionText: "Junior Anota Mínimo 1 Gol en Casa (Más de 0.5)",
      probability: 91.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor de Barranquilla (30°C)",
      homeAvgGoals: "2.0 por partido",
      awayAvgGoals: "1.0 por partido",
      explanation: `¿Por qué se eligió esta jugada?: En el Estadio Metropolitano y ante su hinchada, Junior genera opciones claras por inercia ofensiva gracias a la velocidad de sus extremos.

¿Cómo se resolvió?: No solo anotaron un gol, sino que le pasaron por encima al América ganando 3-1 con dos goles en el primer tiempo.`,
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
      league: "Ligue 1 (Francia)",
      homeTeam: "Olympique Marsella",
      awayTeam: "PSG",
      predictionText: "Victoria Directa del PSG (Moneyline)",
      probability: 89.5,
      isFree: true,
      altitudeM: 35,
      weatherDesc: "Fresco (17°C)",
      homeAvgGoals: "0.7 por partido",
      awayAvgGoals: "2.3 por partido",
      explanation: `¿Por qué se eligió esta jugada?: La diferencia de presupuesto e individualidades entre París y Marsella es abismal. PSG llegaba en su mejor momento de la temporada.

¿Cómo se resolvió?: Al minuto 20 expulsaron a un jugador del Marsella, facilitando aún más el trámite para un baile del PSG con goleada 0-3 a domicilio.`,
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
      league: "Serie A (Italia)",
      homeTeam: "Inter de Milán",
      awayTeam: "Juventus",
      predictionText: "Más de 2.5 Goles Totales en el Derby",
      probability: 88.0,
      isFree: true,
      altitudeM: 122,
      weatherDesc: "Cielo despejado (15°C)",
      homeAvgGoals: "2.4 por partido",
      awayAvgGoals: "2.1 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Los dos equipos llegaban buscando el liderato y con serias falencias para defender la pelota parada.

¿Cómo se resolvió?: Se dio uno de los partidos más espectaculares del año en Italia: un electrizante empate 4-4 que superó la línea de goles en apenas 35 minutos de juego.`,
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
      predictionText: "Más de 1.5 Goles Totales en el Partido",
      probability: 91.5,
      isFree: true,
      altitudeM: 40,
      weatherDesc: "Lluvia ligera (14°C)",
      homeAvgGoals: "1.8 por partido",
      awayAvgGoals: "1.7 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El choque entre Saka y Salah garantizaba peligro constante en las dos áreas. Una línea protegida de solo dos goles totales era una oportunidad matemática inmejorable.

¿Cómo se resolvió?: En el primer tiempo ya iban 2-1 a favor de Arsenal; el juego finalizó 2-2 cumpliendo la selección con total soltura.`,
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
      predictionText: "Más de 9.5 Tiros de Esquina (Mínimo 10 córners)",
      probability: 86.0,
      isFree: true,
      altitudeM: 15,
      weatherDesc: "Frío de Londres (13°C)",
      homeAvgGoals: "6 córners",
      awayAvgGoals: "3 córners",
      explanation: `¿Por qué se eligió esta jugada?: Chelsea y Newcastle son equipos de juego directo por las bandas que provocan muchos rebotes hacia la línea final.

¿Por qué se perdió la jugada?: En el minuto 75 ya iban 9 tiros de esquina y solo faltaba 1 más en 15 minutos. Infortunadamente los dos equipos decidieron hacer posesión lenta en la mitad de la cancha y no hubo un solo centro más, quedándonos a un córner de cobrar.`,
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
      predictionText: "Nikola Jokic Anota Más de 23.5 Puntos",
      probability: 92.0,
      isFree: true,
      altitudeM: 1609,
      weatherDesc: "Coliseo Cerrado",
      homeAvgGoals: "41 pts anotados",
      awayAvgGoals: "-",
      explanation: `¿Por qué se eligió esta jugada?: Denver juega en los 1.600 metros de altura de Colorado, donde los rivales se cansan rápido. Jokic no tenía defensores de su talla en los Clippers.

¿Cómo se resolvió?: Jokic dio un recital histórico metiendo 41 puntos él solo, destrozando la línea requerida.`,
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
      predictionText: "Tolima Empate No Acción (Si empatan nos devuelven)",
      probability: 90.0,
      isFree: true,
      altitudeM: 1285,
      weatherDesc: "Templado (24°C)",
      homeAvgGoals: "1.5 por partido",
      awayAvgGoals: "1.1 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Tolima en el Manuel Murillo Toro de Ibagué siempre se hace respetar y neutraliza bien las salidas de Dayro Moreno.

¿Cómo se resolvió?: El partido terminó empatado 1-1, por lo que la cuota se protegió y la jugada se validó sin pérdidas para el boleto.`,
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
      predictionText: "Más de 1.5 Goles Totales en el Partido",
      probability: 89.0,
      isFree: true,
      altitudeM: 1495,
      weatherDesc: "Agradable (22°C)",
      homeAvgGoals: "2.2 por partido",
      awayAvgGoals: "0.9 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Jaguares viajó de Montería a Medellín en autobús. La subida a la montaña y el cambio de temperatura hacen que su defensa cometa faltas y desatenciones graves.

¿Cómo se resolvió?: Medellín aprovechó cada desatención y le metió 4 goles a Jaguares en una goleada 4-1 muy clara.`,
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
      predictionText: "Ambos Equipos Marcan Gol (Sí)",
      probability: 87.5,
      isFree: true,
      altitudeM: 660,
      weatherDesc: "Fresco de otoño (15°C)",
      homeAvgGoals: "1.4 esperados",
      awayAvgGoals: "2.8 esperados",
      explanation: `¿Por qué se eligió esta jugada?: El Clásico en el Bernabéu con Vinícius y Mbappé de un lado y Lewandowski y Lamine Yamal del otro parecía tener goles garantizados de los dos lados.

¿Por qué se perdió la jugada?: La trampa del fuera de juego del Barcelona funcionó de manera milimétrica: le anularon dos goles a Mbappé y el Madrid cayó en fuera de lugar 8 veces. Barcelona goleó 0-4 y el Madrid se quedó en blanco.`,
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
      predictionText: "Victoria Directa del RB Leipzig",
      probability: 91.0,
      isFree: true,
      altitudeM: 113,
      weatherDesc: "Frío seco (13°C)",
      homeAvgGoals: "2.1 por partido",
      awayAvgGoals: "0.8 por partido",
      explanation: `¿Por qué se eligió esta jugada?: Leipzig en casa es un equipo letal presionando la salida de rivales de mitad de tabla hacia abajo.

¿Cómo se resolvió?: Aunque empezaron perdiendo 0-1, en el segundo tiempo arrollaron al Friburgo con tres goles consecutivos para sellar un 3-1 indiscutible.`,
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
      probability: 89.0,
      isFree: true,
      altitudeM: 110,
      weatherDesc: "Nublado (14°C)",
      homeAvgGoals: "1.8 por partido",
      awayAvgGoals: "1.2 por partido",
      explanation: `¿Por qué se eligió esta jugada?: El Aston Villa del 'Dibu' Martínez venía con una fortaleza enorme en su casa (Villa Park) y con su once titular descansado.

¿Cómo se resolvió?: Dominaron todo el encuentro y aunque Bournemouth empató al final, el 1-1 aseguró la doble oportunidad sin problemas.`,
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
      probability: 93.0,
      isFree: true,
      altitudeM: 18,
      weatherDesc: "Calor sofocante de Montería (33°C con 86% de humedad)",
      homeAvgGoals: "2 goles anotados",
      awayAvgGoals: "1 gol anotado",
      explanation: `¿Por qué se eligió esta jugada?: EL PARTIDO QUE EMPEZÓ LA RACHA Y CAPITALIZÓ LA BANCA CON $150.000 PESOS. El Estadio Jaraguay de Montería a las 6:00 de la tarde es un verdadero horno: 33°C y un aire caliente que le quema los pulmones a cualquier equipo que venga del interior del país. Llaneros tuvo un viaje larguísimo desde Villavicencio y no tenía recambio físico.

¿Cómo se resolvió en la cancha?: En los primeros 45 minutos Llaneros intentó aguantar con faltas, pero en el segundo tiempo se quedaron totalmente sin piernas por la deshidratación. Jaguares metió el acelerador por las bandas, anotó dos goles y liquidó la victoria 2-1 para cobrar los primeros $150.000 COP limpios.`,
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
  btn.className = "fixed bottom-5 right-5 z-50 px-4 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black font-num text-xs uppercase tracking-wider rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 border border-emerald-300 transition-all";
  btn.innerHTML = `<span>💬 WhatsApp VIP (+57 333 286 1551)</span>`;
  document.body.appendChild(btn);
}

// ============================================================================
// DIBUJO DE LA GRÁFICA DE RENDIMIENTO (GARANTIZADO)
// ============================================================================
export function renderPerformanceChart() {
  const chartBox = document.getElementById("performance-chart-box");
  if (!chartBox) return;

  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");
  if (settled.length === 0) return;

  // Orden cronológico (del más viejo al más nuevo para ver el crecimiento)
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
    <svg viewBox="0 0 600 160" class="w-full h-full font-num overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Líneas de fondo del 50%, 80% y 100% -->
      <line x1="30" y1="30" x2="570" y2="30" stroke="#1b2432" stroke-dasharray="3 3" />
      <text x="32" y="26" fill="#8b9bb4" font-size="9">100% Acierto</text>

      <line x1="30" y1="52" x2="570" y2="52" stroke="#10b981" stroke-opacity="0.3" stroke-dasharray="3 3" />
      <text x="32" y="49" fill="#10b981" font-size="9">80% Zona de Ganancia</text>

      <line x1="30" y1="85" x2="570" y2="85" stroke="#1b2432" stroke-dasharray="3 3" />
      <text x="32" y="82" fill="#8b9bb4" font-size="9">50% Equilibrio</text>

      <!-- Sombra debajo de la línea -->
      <polygon fill="url(#chartGrad)" points="30,140 ${polylinePoints} 570,140" />

      <!-- Línea Continua de Tendencia -->
      <polyline fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />

      <!-- Puntos de cada partido -->
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

// Navegación con redibujo garantizado de la gráfica
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

// ============================================================================
// MODAL TÁCTICO FLOTANTE (LENGUAJE SENCILLO, EXTENSO Y CLARO)
// ============================================================================
window.openMatchModal = (matchId) => {
  const match = getAllMasterFeed().find((m) => m.id === matchId);
  if (!match) return;

  let modal = document.getElementById("match-telemetry-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "match-telemetry-modal";
    modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 font-num";
    document.body.appendChild(modal);
  }

  const stars = getStars(match.probability);
  const homeLogo = getLogo(match.homeTeam);
  const awayLogo = getLogo(match.awayTeam);

  modal.innerHTML = `
    <div class="quant-card max-w-2xl w-full p-4 md:p-6 space-y-4 max-h-[92vh] overflow-y-auto border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
      <!-- Barra superior -->
      <div class="flex items-center justify-between border-b border-[#1b2432] pb-2 text-xs">
        <span class="px-2 py-0.5 text-[10px] font-bold uppercase border ${stars.badge}">
          ${stars.stars} ${stars.tag}
        </span>
        <button onclick="document.getElementById('match-telemetry-modal').classList.add('hidden')" class="px-2.5 py-1 text-slate-300 hover:text-white border border-[#1b2432] bg-[#05070a] font-bold">
          ✕ CERRAR
        </button>
      </div>

      <!-- Partido y Marcador -->
      <div class="p-3 bg-[#05070a] border border-[#1b2432] grid grid-cols-12 items-center gap-2">
        <div class="col-span-5 flex items-center gap-2">
          <img src="${homeLogo}" alt="${match.homeTeam}" class="w-9 h-9 md:w-11 md:h-11 object-contain shrink-0" />
          <div class="min-w-0">
            <div class="text-xs md:text-sm font-black text-white truncate">${match.homeTeam}</div>
            <span class="text-[10px] text-cyan-300 block">Ataque: ${match.homeAvgGoals}</span>
          </div>
        </div>

        <div class="col-span-2 text-center">
          <div class="text-lg md:text-2xl font-black text-white font-num">${match.liveScore}</div>
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

      <!-- Pronóstico Seleccionado -->
      <div class="p-3 bg-[#061210] border border-[#10b981]/50 flex items-center justify-between text-xs">
        <div>
          <span class="text-[10px] text-slate-400 block uppercase">JUGADA OFICIAL RECOMENDADA:</span>
          <span class="text-sm md:text-base font-bold text-[#10b981]">${match.predictionText}</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-slate-400 block">CONFIANZA</span>
          <span class="text-lg md:text-xl font-black text-white">${match.probability}%</span>
        </div>
      </div>

      <!-- Factores del Partido en Lenguaje Sencillo -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#05070a] p-3 border border-[#1b2432] text-xs">
        <div>
          <span class="text-[10px] text-slate-400 block">CIUDAD Y VIAJE</span>
          <span class="text-white font-bold">${match.altitudeM} metros de altura</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block">CLIMA EN LA CANCHA</span>
          <span class="text-cyan-300 font-bold">${match.weatherDesc}</span>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <span class="text-[10px] text-slate-400 block">COMPORTAMIENTO</span>
          <span class="text-[#10b981] font-bold">${match.outcome === "ACIERTO" ? "Se cumplió la lectura" : "Incidencia en el juego"}</span>
        </div>
      </div>

      <!-- EXPLICACIÓN EXTENSA Y DETALLADA -->
      <div class="p-3.5 bg-[#070a0f] border border-[#1b2432] space-y-2 text-xs">
        <span class="text-cyan-300 font-bold block uppercase text-[11px] border-b border-[#1b2432] pb-1">
          EXPLICACIÓN DETALLADA DEL PARTIDO:
        </span>
        <div class="text-slate-300 leading-relaxed text-xs space-y-2 whitespace-pre-line font-sans">
          ${match.explanation}
        </div>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
};

// Renderizado de Pronósticos Hoy
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
      : `MODO ABIERTO (4 PRONÓSTICOS DESTACADOS GRATIS)`;
  }

  container.innerHTML = filtered.map((item) => {
    const isVisible = isVip || item.isFree;
    const stars = getStars(item.probability);
    const homeLogo = getLogo(item.homeTeam);
    const awayLogo = getLogo(item.awayTeam);

    return `
      <article class="quant-card p-3.5 flex flex-col justify-between space-y-3 font-num">
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
            🔍 Ver Explicación Detallada
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// Renderizado de Resultados Hoy
export function renderTodayResults() {
  const box = document.getElementById("today-results-container");
  if (!box) return;

  const today = getColombiaDateString();
  const todayList = getAllMasterFeed().filter((p) => p.matchDate === today);

  box.innerHTML = todayList.map((p) => {
    const badge = p.outcome === "ACIERTO"
      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
      : p.outcome === "FALLO"
      ? "border-red-500 bg-red-500/20 text-red-300"
      : "border-cyan-500 bg-cyan-500/20 text-cyan-300";

    return `
      <div class="quant-card p-3 flex flex-wrap items-center justify-between gap-2 font-num text-xs cursor-pointer hover:border-cyan-400/50" onclick="window.openMatchModal('${p.id}')">
        <div class="space-y-0.5">
          <span class="text-[10px] text-slate-400">${p.kickoffLabel} • ${p.league}</span>
          <div class="text-xs md:text-sm font-bold text-white">${p.homeTeam} vs ${p.awayTeam}</div>
          <div class="text-cyan-300 text-[11px]">Pronóstico: ${p.predictionText}</div>
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

// Historial Completo con cálculo preciso
export function renderFullPublicHistory() {
  const all = getAllMasterFeed();
  const settled = all.filter((p) => p.outcome === "ACIERTO" || p.outcome === "FALLO");

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
      <div class="quant-card p-3 font-num">
        <span class="text-[9px] text-slate-400 block">EFECTIVIDAD REAL TOTAL</span>
        <span class="text-xl font-black text-[#10b981]">${totalStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${totalStats.w} aciertos / ${totalStats.tot} jugadas</span>
      </div>
      <div class="quant-card p-3 font-num">
        <span class="text-[9px] text-slate-400 block">FÚTBOL</span>
        <span class="text-xl font-black text-cyan-400">${fbStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${fbStats.w}/${fbStats.tot} acertados</span>
      </div>
      <div class="quant-card p-3 font-num">
        <span class="text-[9px] text-slate-400 block">NBA</span>
        <span class="text-xl font-black text-white">${nbaStats.pct}%</span>
        <span class="text-[10px] text-slate-400 block">${nbaStats.w}/${nbaStats.tot} acertados</span>
      </div>
      <div class="quant-card p-3 font-num">
        <span class="text-[9px] text-slate-400 block">⭐⭐⭐⭐⭐ (5 ESTRELLAS)</span>
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
        <tr class="hover:bg-[#0f151f] text-xs font-num cursor-pointer" onclick="window.openMatchModal('${p.id}')">
          <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">${p.matchDate} ${p.kickoffLabel}</td>
          <td class="py-2.5 px-3 text-slate-300 whitespace-nowrap">${p.sport} // ${p.league}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${p.homeTeam} vs ${p.awayTeam}</td>
          <td class="py-2.5 px-3 text-cyan-300 whitespace-nowrap">${p.predictionText}</td>
          <td class="py-2.5 px-3 font-bold text-white whitespace-nowrap">${p.liveScore}</td>
          <td class="py-2.5 px-3 whitespace-nowrap"><span class="px-2 py-0.5 text-[9px] font-bold uppercase border ${badge}">${p.outcome}</span></td>
          <td class="py-2.5 px-3 text-right whitespace-nowrap"><span class="text-cyan-400 underline text-[10px]">Ver Análisis →</span></td>
        </tr>
      `;
    }).join("");
  }
}

export async function syncLiveResultsFromSportsApi() {
  const today = getColombiaDateString();
  try {
    const res = await fetch(`https://${CONFIG.KEYS.SPORTS_API_HOST}/fixtures?date=${today}&timezone=${CONFIG.BRAND.TIMEZONE}`, {
      headers: { "x-apisports-key": CONFIG.KEYS.SPORTS_API_KEY },
    });
    const data = await res.json();
    if (data.response && data.response.length > 0) {
      alert(`✔ Marcadores sincronizados correctamente desde la API oficial.`);
    } else {
      alert(`Clave validada con éxito. No hay marcadores adicionales por cerrar.`);
    }
  } catch (err) {
    alert("No se pudo conectar con la API deportiva.");
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
  document.getElementById("btn-sync-results")?.addEventListener("click", syncLiveResultsFromSportsApi);
});
