"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs/promises");
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (!electron.app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("read-cert-directory", async () => {
  try {
    const certsPath = electron.app.isPackaged ? path.join(process.resourcesPath, "certificates") : path.join(process.cwd(), "certificates");
    const authorities = await fs.readdir(certsPath);
    const tree = await Promise.all(
      authorities.map(async (authority) => {
        const authorityPath = path.join(certsPath, authority);
        const stat = await fs.stat(authorityPath);
        if (!stat.isDirectory()) return null;
        const files = await fs.readdir(authorityPath);
        const certFiles = await Promise.all(
          files.filter((f) => f.endsWith(".vpk")).map(async (file) => {
            const filePath = path.join(authorityPath, file);
            return { name: file, path: filePath };
          })
        );
        return {
          name: authority,
          type: "folder",
          files: certFiles
        };
      })
    );
    return tree.filter(Boolean);
  } catch (error) {
    console.error("Error reading certificates:", error);
    return [];
  }
});
electron.ipcMain.handle("read-key", async (_, keyPath) => {
  try {
    const content = await fs.readFile(keyPath, "utf-8");
    const data = JSON.parse(content);
    return {
      uid: data.uid,
      authority: data.authority,
      deviceModel: data.deviceModel,
      publicKey: data.publicKey,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    console.error("Error reading key:", error);
    throw error;
  }
});
