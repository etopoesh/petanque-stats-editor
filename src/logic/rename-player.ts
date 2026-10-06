import type { Match, Team } from "../types/match";

export function renamePlayer(match: Match, team: Team, oldName: string, newName: string): Match {
  if (oldName === newName) return match;

  const playersKey = team === "team1" ? "team1Players" : "team2Players";
  const updatedPlayers = match[playersKey].map((p) => (p === oldName ? newName : p));

  const updatedThrows = match.throws.map((t) =>
    t.team === team && t.player === oldName ? { ...t, player: newName } : t
  );

  return {
    ...match,
    [playersKey]: updatedPlayers,
    throws: updatedThrows,
  };
}
