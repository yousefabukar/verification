"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  readCertDirectory: () => electron.ipcRenderer.invoke("read-cert-directory"),
  readKey: (keyPath) => electron.ipcRenderer.invoke("read-key", keyPath)
});
