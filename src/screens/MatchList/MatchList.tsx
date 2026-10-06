import type { CSSProperties } from "react";
import type { EditorEntry, MatchStatus } from "../../types/editor";
import { StatusBadge } from "./StatusBadge";

function statusOf(entry: EditorEntry, justAdded: ReadonlySet<number>): MatchStatus {
  if (entry.edited) return "edited";
  if (justAdded.has(entry.id)) return "new";
  return "unchanged";
}

export function MatchList({
  entries,
  justAddedIds,
  onImport,
  onExport,
  onSelect,
  busy,
}: {
  entries: EditorEntry[];
  justAddedIds: ReadonlySet<number>;
  onImport: () => void;
  onExport: () => void;
  onSelect: (id: number) => void;
  busy: boolean;
}) {
  const sorted = [...entries].sort((a, b) => b.matchDate.localeCompare(a.matchDate));

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button onClick={onImport} disabled={busy}>
          Импортировать бэкап
        </button>
        <button onClick={onExport} disabled={busy || entries.length === 0}>
          Экспортировать
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={cellStyle}>Дата</th>
            <th style={cellStyle}>Событие</th>
            <th style={cellStyle}>Команды</th>
            <th style={cellStyle}>Счёт</th>
            <th style={cellStyle}>Импортирован</th>
            <th style={cellStyle}>Правка</th>
            <th style={cellStyle}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => {
            const status = statusOf(entry, justAddedIds);
            return (
              <tr
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  background: status === "new" ? "#f0fff4" : undefined,
                }}
              >
                <td style={cellStyle}>{entry.data.date}</td>
                <td style={cellStyle}>{entry.data.event}</td>
                <td style={cellStyle}>
                  {entry.data.team1Name} vs {entry.data.team2Name}
                </td>
                <td style={cellStyle}>
                  {entry.data.finalTeam1Score}:{entry.data.finalTeam2Score}
                </td>
                <td style={cellStyle}>{formatDate(entry.importedAt)}</td>
                <td style={cellStyle}>{entry.editedAt ? formatDate(entry.editedAt) : "—"}</td>
                <td style={cellStyle}>
                  <StatusBadge status={status} warning={entry.sourceChangedAfterEdit} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {entries.length === 0 && <p style={{ color: "#888" }}>Партий пока нет — импортируйте бэкап.</p>}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const cellStyle: CSSProperties = { padding: "8px 12px" };
