import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  showNotification: (title, body) => ipcRenderer.invoke("show-notification", title, body),
  quitApp: () => ipcRenderer.invoke("quit-app"),
  showWindow: () => ipcRenderer.invoke("show-window"),
  minimizeWindow: () => ipcRenderer.invoke("minimize-window")
});
//# sourceMappingURL=preload.js.map
