import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  showWindow: () => ipcRenderer.invoke('show-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window')
});

export type ElectronAPI = {
  showNotification: (title: string, body: string) => Promise<boolean>;
  quitApp: () => Promise<void>;
  showWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
};

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
