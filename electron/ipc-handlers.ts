import { ipcMain, dialog, BrowserWindow } from "electron";
import fs from "node:fs/promises";
import { readState, writeState } from "./state-store";
import type { EditorState, Backup, BackupFull } from "../src/types/editor";

export function registerIpcHandlers(): void {
  ipcMain.handle("state:load", async (): Promise<EditorState> => {
    return readState();
  });

  ipcMain.handle("state:save", async (_event, state: EditorState): Promise<void> => {
    await writeState(state);
  });

  ipcMain.handle("backup:import", async (event): Promise<Backup | null> => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(win ?? undefined, {
      title: "Импорт бэкапа",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    const raw = await fs.readFile(result.filePaths[0], "utf-8");
    const parsed = JSON.parse(raw) as Backup;
    if (parsed.kind !== "full" && parsed.kind !== "match") {
      throw new Error("Не похоже на бэкап петанк-трекера: нет поля kind='full'|'match'");
    }
    return parsed;
  });

  ipcMain.handle("backup:export", async (event, backup: BackupFull): Promise<boolean> => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showSaveDialog(win ?? undefined, {
      title: "Экспорт бэкапа",
      defaultPath: `petanque-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return false;

    await fs.writeFile(result.filePath, JSON.stringify(backup, null, 2), "utf-8");
    return true;
  });
}
