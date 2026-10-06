import type { BackupFull, EditorState } from "../types/editor";

export function buildExport(state: EditorState): BackupFull {
  return {
    backupVersion: state.maxBackupVersion,
    kind: "full",
    exportedAt: new Date().toISOString(),
    current: null, // статичная заглушка — редактор не хранит и не редактирует current по записям
    history: state.entries.map((e) => e.data),
  };
}
