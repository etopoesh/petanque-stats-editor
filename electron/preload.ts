import { contextBridge, ipcRenderer } from "electron";
import type { EditorState, Backup, BackupFull } from "../src/types/editor";

const electronAPI = {
  loadState: (): Promise<EditorState> => ipcRenderer.invoke("state:load"),
  saveState: (state: EditorState): Promise<void> => ipcRenderer.invoke("state:save", state),
  importBackup: (): Promise<Backup | null> => ipcRenderer.invoke("backup:import"),
  exportBackup: (backup: BackupFull): Promise<boolean> => ipcRenderer.invoke("backup:export", backup),
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
