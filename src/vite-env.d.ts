/// <reference types="vite/client" />

type ElectronAPI = {
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

export {};
