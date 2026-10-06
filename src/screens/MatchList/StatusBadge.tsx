import type { MatchStatus } from "../../types/editor";

const LABELS: Record<MatchStatus, string> = {
  new: "новая",
  edited: "отредактирована",
  unchanged: "без изменений",
};

const COLORS: Record<MatchStatus, string> = {
  new: "#1d6f42",
  edited: "#946f00",
  unchanged: "#555",
};

export function StatusBadge({ status, warning }: { status: MatchStatus; warning?: boolean }) {
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <span style={{ color: COLORS[status], fontWeight: 600 }}>{LABELS[status]}</span>
      {warning && (
        <span title="Источник изменился после правки — сверьте вручную" style={{ color: "#c0392b" }}>
          ⚠
        </span>
      )}
    </span>
  );
}
