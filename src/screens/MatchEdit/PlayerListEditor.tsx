import { useState } from "react";

export function PlayerListEditor({
  players,
  onRename,
}: {
  players: string[];
  onRename: (index: number, newName: string) => void;
}) {
  // Локальная копия — источник истины для набора текста между keystroke-ами.
  // Единственный писатель во внешние players — эта же форма через onRename,
  // поэтому пересинхронизация с props после монтирования не нужна.
  const [names, setNames] = useState<string[]>(() => [...players]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {names.map((name, i) => (
        <input
          key={i}
          value={name}
          onChange={(e) => {
            const next = [...names];
            next[i] = e.target.value;
            setNames(next);
          }}
          onBlur={() => {
            const trimmed = names[i].trim();
            if (trimmed && trimmed !== players[i]) onRename(i, trimmed);
          }}
          style={{ padding: 6 }}
        />
      ))}
    </div>
  );
}
