import { useEffect, useState } from "react";
import { useEditorStore } from "./state/store";
import { MatchList } from "./screens/MatchList/MatchList";
import { MatchEdit } from "./screens/MatchEdit/MatchEdit";
import type { Match } from "./types/match";

type Screen = { name: "list" } | { name: "edit"; id: number };

export default function App() {
  const { state, loading, error, lastImportReport, importBackup, exportBackup, saveEntry } = useEditorStore();
  const [screen, setScreen] = useState<Screen>({ name: "list" });
  const [busy, setBusy] = useState(false);

  const entryForEdit = screen.name === "edit" ? state.entries.find((e) => e.id === screen.id) : undefined;

  useEffect(() => {
    if (screen.name === "edit" && !entryForEdit) setScreen({ name: "list" });
  }, [screen, entryForEdit]);

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (error) return <div style={{ padding: 24, color: "#c0392b" }}>{error}</div>;

  if (screen.name === "edit") {
    if (!entryForEdit) return null;
    return (
      <MatchEdit
        key={entryForEdit.id}
        entry={entryForEdit}
        onCancel={() => setScreen({ name: "list" })}
        onSave={async (match: Match) => {
          await saveEntry(entryForEdit.id, match);
          setScreen({ name: "list" });
        }}
      />
    );
  }

  return (
    <MatchList
      entries={state.entries}
      justAddedIds={new Set(lastImportReport?.added ?? [])}
      busy={busy}
      onImport={async () => {
        setBusy(true);
        try {
          await importBackup();
        } catch (e) {
          alert(String(e));
        } finally {
          setBusy(false);
        }
      }}
      onExport={async () => {
        setBusy(true);
        try {
          await exportBackup();
        } catch (e) {
          alert(String(e));
        } finally {
          setBusy(false);
        }
      }}
      onSelect={(id) => setScreen({ name: "edit", id })}
    />
  );
}
