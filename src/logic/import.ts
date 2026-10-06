import type { Match } from "../types/match";
import type { Backup, EditorState } from "../types/editor";

export type ImportReport = {
  added: number[]; // новые id — подсветить в UI как «новая»
  refreshed: number[]; // id уже был, edited=false — data перезаписана свежими raw-данными
  keptEdited: number[]; // id уже был, edited=true — data не тронута
  sourceChanged: number[]; // подмножество keptEdited, где raw разошёлся с sourceSnapshot — показать предупреждение
};

function extractMatches(backup: Backup): Match[] {
  return backup.kind === "full" ? backup.history : [backup.match];
}

// Сравнение по значению для plain JSON-объектов Match — вложенных Date/Map/etc в схеме нет,
// поэтому сравнение через сериализацию с одинаковым порядком ключей (объекты собираются
// в коде по одной и той же форме) достаточно надёжно для этой задачи.
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function mergeImport(state: EditorState, backup: Backup): { state: EditorState; report: ImportReport } {
  const importedAt = backup.exportedAt;
  const byId = new Map(state.entries.map((e) => [e.id, e]));
  const report: ImportReport = { added: [], refreshed: [], keptEdited: [], sourceChanged: [] };

  for (const match of extractMatches(backup)) {
    const current = byId.get(match.id);

    if (!current) {
      byId.set(match.id, {
        id: match.id,
        matchDate: match.date,
        importedAt,
        editedAt: null,
        edited: false,
        data: match,
      });
      report.added.push(match.id);
      continue;
    }

    if (!current.edited) {
      byId.set(match.id, {
        ...current,
        matchDate: match.date,
        importedAt,
        data: match,
      });
      report.refreshed.push(match.id);
      continue;
    }

    // edited=true: data не трогаем, обновляем только importedAt.
    // sourceSnapshot может отсутствовать (например, старая запись до введения этого поля) —
    // тогда сравнивать не с чем, флаг не поднимаем.
    const sourceChanged = current.sourceSnapshot ? !deepEqual(match, current.sourceSnapshot) : false;
    byId.set(match.id, {
      ...current,
      importedAt,
      sourceChangedAfterEdit: sourceChanged,
    });
    report.keptEdited.push(match.id);
    if (sourceChanged) report.sourceChanged.push(match.id);
  }

  return {
    state: {
      maxBackupVersion: Math.max(state.maxBackupVersion, backup.backupVersion),
      entries: Array.from(byId.values()),
    },
    report,
  };
}
