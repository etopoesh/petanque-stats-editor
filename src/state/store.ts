import { useCallback, useEffect, useState } from "react";
import { api } from "../ipc/api";
import type { Match } from "../types/match";
import type { EditorState } from "../types/editor";
import { EMPTY_STATE } from "../types/editor";
import { mergeImport, type ImportReport } from "../logic/import";
import { buildExport } from "../logic/export";

export function useEditorStore() {
  const [state, setState] = useState<EditorState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastImportReport, setLastImportReport] = useState<ImportReport | null>(null);

  useEffect(() => {
    api
      .loadState()
      .then((s) => setState(s))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next: EditorState) => {
    setState(next);
    await api.saveState(next);
  }, []);

  const importBackup = useCallback(async (): Promise<ImportReport | null> => {
    const backup = await api.importBackup();
    if (!backup) return null;
    const { state: nextState, report } = mergeImport(state, backup);
    await persist(nextState);
    setLastImportReport(report);
    return report;
  }, [state, persist]);

  const exportBackup = useCallback(async (): Promise<boolean> => {
    return api.exportBackup(buildExport(state));
  }, [state]);

  const saveEntry = useCallback(
    async (id: number, updatedMatch: Match) => {
      const now = new Date().toISOString();
      const nextEntries = state.entries.map((e) => {
        if (e.id !== id) return e;
        const firstEdit = !e.edited;
        return {
          ...e,
          matchDate: updatedMatch.date,
          editedAt: now,
          edited: true,
          // на первой правке фиксируем raw-снимок как базу для будущих sourceChangedAfterEdit-сравнений
          sourceSnapshot: firstEdit ? e.data : e.sourceSnapshot,
          sourceChangedAfterEdit: false, // предупреждение считаем отработанным
          data: updatedMatch,
        };
      });
      await persist({ ...state, entries: nextEntries });
    },
    [state, persist]
  );

  return { state, loading, error, lastImportReport, importBackup, exportBackup, saveEntry };
}
