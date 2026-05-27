// All 68 STM Montreal metro stations with image coordinates (1591x2400 — HD official 2026 map)
// lines: g=green, o=orange, b=blue, y=yellow; commas for transfers

export type Line = 'g' | 'o' | 'b' | 'y'

export interface Station {
  id: string
  name: string
  x: number
  y: number
  lines: Line[]
}

function slugifyStation(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const LINE_COLORS: Record<Line, string> = {
  g: '#00A651',
  o: '#EF8B22',
  y: '#E0AE00',
  b: '#0083CA',
}

export const LINE_NAMES: Record<Line, string> = {
  g: 'Verte',
  o: 'Orange',
  y: 'Jaune',
  b: 'Bleue',
}

const raw: Array<[string, number, number, string]> = [
  // Orange line (2) — Montmorency → Côte-Vertu — calibré manuellement
  ['Montmorency', 291, 272, 'o'],
  ['De La Concorde', 422, 268, 'o'],
  ['Cartier', 548, 282, 'o'],
  ['Henri-Bourassa', 599, 326, 'o'],
  ['Sauvé', 639, 371, 'o'],
  ['Crémazie', 683, 415, 'o'],
  ['Jarry', 728, 460, 'o'],
  ['Beaubien', 817, 550, 'o'],
  ['Rosemont', 862, 595, 'o'],
  ['Laurier', 907, 639, 'o'],
  ['Mont-Royal', 952, 684, 'o'],
  ['Sherbrooke', 997, 729, 'o'],
  ['Champ-de-Mars', 1123, 900, 'o'],
  ["Place-d'Armes", 1074, 949, 'o'],
  ['Square-Victoria-OACI', 1039, 988, 'o'],
  ['Bonaventure', 987, 1038, 'o'],
  ["Lucien-L'Allier", 921, 1102, 'o'],
  ['Georges-Vanier', 853, 1169, 'o'],
  ['Place-Saint-Henri', 702, 1246, 'o'],
  ['Vendôme', 638, 1178, 'o'],
  ['Villa-Maria', 570, 1110, 'o'],
  ['Côte-Sainte-Catherine', 457, 1000, 'o'],
  ['Plamondon', 412, 955, 'o'],
  ['Namur', 367, 910, 'o'],
  ['De La Savane', 322, 865, 'o'],
  ['Du Collège', 277, 820, 'o'],
  ['Côte-Vertu', 232, 775, 'o'],
  // Green line (1) — Honoré-Beaugrand → Angrignon
  ['Honoré-Beaugrand', 1312, 235, 'g'],
  ['Radisson', 1357, 190, 'g'],
  ['Langelier', 1267, 280, 'g'],
  ['Cadillac', 1222, 325, 'g'],
  ['Assomption', 1186, 369, 'g'],
  ['Viau', 1235, 435, 'g'],
  ['Pie-IX', 1199, 481, 'g'],
  ['Joliette', 1154, 526, 'g'],
  ['Préfontaine', 1117, 571, 'g'],
  ['Frontenac', 1168, 640, 'g'],
  ['Papineau', 1133, 684, 'g'],
  ['Beaudry', 1088, 729, 'g'],
  ['Saint-Laurent', 976, 844, 'g'],
  ['Place-des-Arts', 934, 892, 'g'],
  ['McGill', 865, 955, 'g'],
  ['Peel', 818, 1003, 'g'],
  ['Guy-Concordia', 771, 1046, 'g'],
  ['Atwater', 724, 1092, 'g'],
  ['Charlevoix', 832, 1294, 'g'],
  ['LaSalle', 798, 1336, 'g'],
  ["De L'Église", 769, 1369, 'g'],
  ['Verdun', 705, 1375, 'g'],
  ['Jolicoeur', 639, 1375, 'g'],
  ['Monk', 570, 1377, 'g'],
  ['Angrignon', 517, 1375, 'g'],
  // Blue line (5) — Saint-Michel → Snowdon
  ['Saint-Michel', 953, 325, 'b'],
  ["D'Iberville", 896, 381, 'b'],
  ['Fabre', 840, 437, 'b'],
  ['De Castelnau', 715, 563, 'b'],
  ['Parc', 673, 605, 'b'],
  ['Acadie', 688, 679, 'b'],
  ['Outremont', 733, 724, 'b'],
  ['Édouard-Montpetit', 727, 820, 'b'],
  ['Université-de-Montréal', 658, 889, 'b'],
  ['Côte-des-Neiges', 592, 955, 'b'],
  // Yellow line (4) — Berri-UQAM → Longueuil
  ['Jean-Drapeau', 1286, 777, 'y'],
  ['Longueuil–UdeS', 1354, 715, 'y'],
  // Transfers (multi-line)
  ['Jean-Talon', 772, 505, 'o,b'],
  ['Snowdon', 502, 1045, 'o,b'],
  ['Lionel-Groulx', 785, 1239, 'g,o'],
  ['Berri-UQAM', 1044, 774, 'g,o,y'],
]

export const STATIONS: Station[] = raw.map(([name, x, y, lines]) => ({
  id: slugifyStation(name),
  name,
  x,
  y,
  lines: lines.split(',') as Line[],
}))
