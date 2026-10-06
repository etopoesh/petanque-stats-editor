export type ThrowType = "point" | "tir";

export type ThrowResult = "success" | "fail" | "miss" | "hit" | "carreau";

export type Team = "team1" | "team2";

export type Format = "triplet" | "doublet";

export type Throw = {
  id: number;
  geim: number;
  distance: string;
  team: Team;
  player: string; // имя строкой, не id — важно для переименования
  type: ThrowType;
  result: ThrowResult;
  firstPoint: boolean;
  tirAuBut: boolean;
};

export type Match = {
  id: number;
  format: Format;
  date: string; // YYYY-MM-DD
  event: string;
  team1Name: string;
  team2Name: string;
  team1Players: string[];
  team2Players: string[];
  throws: Throw[];
  gameScores: unknown[]; // не трогаем, прокидываем как есть
  finalTeam1Score: number;
  finalTeam2Score: number;
  finishedAt: string; // ISO
};
