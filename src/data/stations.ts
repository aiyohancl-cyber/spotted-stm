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
  ['Montmorency', 291, 562, 'o'],
  ['De La Concorde', 422, 558, 'o'],
  ['Cartier', 548, 572, 'o'],
  ['Henri-Bourassa', 599, 616, 'o'],
  ['Sauvé', 639, 661, 'o'],
  ['Crémazie', 683, 705, 'o'],
  ['Jarry', 728, 750, 'o'],
  ['Beaubien', 817, 840, 'o'],
  ['Rosemont', 862, 885, 'o'],
  ['Laurier', 907, 929, 'o'],
  ['Mont-Royal', 952, 974, 'o'],
  ['Sherbrooke', 997, 1019, 'o'],
  ['Champ-de-Mars', 1123, 1190, 'o'],
  ["Place-d'Armes", 1074, 1239, 'o'],
  ['Square-Victoria-OACI', 1039, 1278, 'o'],
  ['Bonaventure', 987, 1328, 'o'],
  ["Lucien-L'Allier", 921, 1392, 'o'],
  ['Georges-Vanier', 853, 1459, 'o'],
  ['Place-Saint-Henri', 702, 1536, 'o'],
  ['Vendôme', 638, 1468, 'o'],
  ['Villa-Maria', 570, 1400, 'o'],
  ['Côte-Sainte-Catherine', 457, 1290, 'o'],
  ['Plamondon', 412, 1245, 'o'],
  ['Namur', 367, 1200, 'o'],
  ['De La Savane', 322, 1155, 'o'],
  ['Du Collège', 277, 1110, 'o'],
  ['Côte-Vertu', 232, 1065, 'o'],
  // Green line (1) — Honoré-Beaugrand → Angrignon
  ['Honoré-Beaugrand', 1312, 525, 'g'],
  ['Radisson', 1357, 480, 'g'],
  ['Langelier', 1267, 570, 'g'],
  ['Cadillac', 1222, 615, 'g'],
  ['Assomption', 1186, 659, 'g'],
  ['Viau', 1235, 725, 'g'],
  ['Pie-IX', 1199, 771, 'g'],
  ['Joliette', 1154, 816, 'g'],
  ['Préfontaine', 1117, 861, 'g'],
  ['Frontenac', 1168, 930, 'g'],
  ['Papineau', 1133, 974, 'g'],
  ['Beaudry', 1088, 1019, 'g'],
  ['Saint-Laurent', 976, 1134, 'g'],
  ['Place-des-Arts', 934, 1182, 'g'],
  ['McGill', 865, 1245, 'g'],
  ['Peel', 818, 1293, 'g'],
  ['Guy-Concordia', 771, 1336, 'g'],
  ['Atwater', 724, 1382, 'g'],
  ['Charlevoix', 832, 1584, 'g'],
  ['LaSalle', 798, 1626, 'g'],
  ["De L'Église", 769, 1659, 'g'],
  ['Verdun', 705, 1665, 'g'],
  ['Jolicoeur', 639, 1665, 'g'],
  ['Monk', 570, 1667, 'g'],
  ['Angrignon', 517, 1665, 'g'],
  // Blue line (5) — Saint-Michel → Snowdon
  ['Saint-Michel', 953, 615, 'b'],
  ["D'Iberville", 896, 671, 'b'],
  ['Fabre', 840, 727, 'b'],
  ['De Castelnau', 715, 853, 'b'],
  ['Parc', 673, 895, 'b'],
  ['Acadie', 688, 969, 'b'],
  ['Outremont', 733, 1014, 'b'],
  ['Édouard-Montpetit', 727, 1110, 'b'],
  ['Université-de-Montréal', 658, 1179, 'b'],
  ['Côte-des-Neiges', 592, 1245, 'b'],
  // Yellow line (4) — Berri-UQAM → Longueuil
  ['Jean-Drapeau', 1286, 1067, 'y'],
  ['Longueuil–UdeS', 1354, 1005, 'y'],
  // Transfers (multi-line)
  ['Jean-Talon', 772, 795, 'o,b'],
  ['Snowdon', 502, 1335, 'o,b'],
  ['Lionel-Groulx', 785, 1529, 'g,o'],
  ['Berri-UQAM', 1044, 1064, 'g,o,y'],
]

export const STATIONS: Station[] = raw.map(([name, x, y, lines]) => ({
  id: slugifyStation(name),
  name,
  x,
  y,
  lines: lines.split(',') as Line[],
}))
