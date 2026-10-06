import type { Match } from "./match";

export type BackupFull = {
  backupVersion: number;
  kind: "full";
  exportedAt: string;
  current: unknown;
  history: Match[];
};

export type BackupSingle = {
  backupVersion: number;
  kind: "match";
  exportedAt: string;
  match: Match;
};

export type Backup = BackupFull | BackupSingle;

export type MatchStatus = "new" | "edited" | "unchanged";

export type EditorEntry = {
  id: number; // = Match.id
  matchDate: string; // = Match.date
  importedAt: string; // exportedAt бэкапа, откуда партия впервые пришла
  editedAt: string | null;
  edited: boolean;
  sourceChangedAfterEdit?: boolean; // raw из нового импорта разошёлся с data после правки
  sourceSnapshot?: Match; // raw-версия match на момент последней правки — база для сравнения при sourceChangedAfterEdit
  data: Match;
};

export type EditorState = {
  maxBackupVersion: number; // максимум backupVersion среди всех когда-либо импортированных бэкапов
  entries: EditorEntry[];
};

export const EMPTY_STATE: EditorState = { maxBackupVersion: 0, entries: [] };
