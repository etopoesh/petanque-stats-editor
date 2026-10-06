import type { ElectronAPI } from "../../electron/preload";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export const api: ElectronAPI = window.electronAPI;
