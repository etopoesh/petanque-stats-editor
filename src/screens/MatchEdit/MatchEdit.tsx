import { useState } from "react";
import type { EditorEntry } from "../../types/editor";
import type { Match } from "../../types/match";
import { renamePlayer } from "../../logic/rename-player";
import { PlayerListEditor } from "./PlayerListEditor";

export function MatchEdit({
  entry,
  onSave,
  onCancel,
}: {
  entry: EditorEntry;
  onSave: (match: Match) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Match>(entry.data);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 560 }}>
      <button onClick={onCancel} style={{ marginBottom: 16 }}>
        ← Назад
      </button>

      {entry.sourceChangedAfterEdit && (
        <p style={{ color: "#c0392b" }}>
          ⚠ После вашей правки бэкап для этой партии импортировался заново с другими данными. Сверьте вручную —
          сохранение снимет это предупреждение.
        </p>
      )}

      <label style={labelStyle}>
        Дата
        <input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Событие
        <input
          value={draft.event}
          onChange={(e) => setDraft({ ...draft, event: e.target.value })}
          style={inputStyle}
        />
      </label>

      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            Команда 1
            <input
              value={draft.team1Name}
              onChange={(e) => setDraft({ ...draft, team1Name: e.target.value })}
              style={inputStyle}
            />
          </label>
          <PlayerListEditor
            players={draft.team1Players}
            onRename={(i, newName) => {
              const oldName = draft.team1Players[i];
              setDraft(renamePlayer(draft, "team1", oldName, newName));
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            Команда 2
            <input
              value={draft.team2Name}
              onChange={(e) => setDraft({ ...draft, team2Name: e.target.value })}
              style={inputStyle}
            />
          </label>
          <PlayerListEditor
            players={draft.team2Players}
            onRename={(i, newName) => {
              const oldName = draft.team2Players[i];
              setDraft(renamePlayer(draft, "team2", oldName, newName));
            }}
          />
        </div>
      </div>

      <button onClick={() => onSave(draft)} style={{ marginTop: 24 }}>
        Сохранить
      </button>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: 12, fontSize: 14 } as const;
const inputStyle = { display: "block", width: "100%", padding: 6, marginTop: 4 } as const;
