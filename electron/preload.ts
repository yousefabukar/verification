import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  readCertDirectory: () => ipcRenderer.invoke('read-cert-directory'),
  readKey: (keyPath: string) => ipcRenderer.invoke('read-key', keyPath),
})
