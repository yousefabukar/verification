import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs/promises'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const veritas = require('../../veritas-core/bindings/core')

// Electron main process entry point
function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'build', 'icon.png')
    : path.join(__dirname, '../build/icon.png')

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // In development, load from vite dev server
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('read-cert-directory', async () => {
  try {
    const certsPath = app.isPackaged
      ? path.join(process.resourcesPath, 'certificates')
      : path.join(process.cwd(), 'certificates')
    const authorities = await fs.readdir(certsPath)

    const tree = await Promise.all(
      authorities.map(async (authority) => {
        const authorityPath = path.join(certsPath, authority)
        const stat = await fs.stat(authorityPath)

        if (!stat.isDirectory()) return null

        const files = await fs.readdir(authorityPath)
        const certFiles = await Promise.all(
          files
            .filter((f) => f.endsWith('.vpk'))
            .map(async (file) => {
              const filePath = path.join(authorityPath, file)
              return { name: file, path: filePath }
            })
        )

        return {
          name: authority,
          type: 'folder',
          files: certFiles,
        }
      })
    )

    return tree.filter(Boolean)
  } catch (error) {
    console.error('Error reading certificates:', error)
    return []
  }
})

ipcMain.handle('verify-image', async (_, imgPath: string) => {
  try {
    const sigInfo = veritas.siginfo(imgPath)
    const certId: string = sigInfo.cert_id

    // Find the key whose key_id matches the cert_id embedded in the image
    const certsPath = app.isPackaged
      ? path.join(process.resourcesPath, 'certificates')
      : path.join(process.cwd(), 'certificates')

    const authorities = await fs.readdir(certsPath)
    let matchedKeyPath: string | null = null
    let matchedPkInfo: any = null

    for (const authority of authorities) {
      const authorityPath = path.join(certsPath, authority)
      const stat = await fs.stat(authorityPath)
      if (!stat.isDirectory()) continue

      const files = await fs.readdir(authorityPath)
      for (const file of files.filter((f) => f.endsWith('.vpk'))) {
        const filePath = path.join(authorityPath, file)
        const pkInfo = veritas.keyread(filePath)
        if (pkInfo.key_id === certId) {
          matchedKeyPath = filePath
          matchedPkInfo = pkInfo
          break
        }
      }
      if (matchedKeyPath) break
    }

    if (!matchedKeyPath) {
      return { valid: false, error: `No trusted key found for certificate ID: ${certId}` }
    }

    const valid = veritas.verify(imgPath, matchedKeyPath)
    return {
      valid,
      certId,
      device: matchedPkInfo.device_model,
      authority: matchedPkInfo.authority,
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error?.message ?? 'Image could not be verified as authentic',
    }
  }
})

ipcMain.handle('read-key', async (_, keyPath: string) => {
  const pkInfo = veritas.keyread(keyPath)
  return {
    keyId: pkInfo.key_id,
    authority: pkInfo.authority,
    deviceModel: pkInfo.device_model,
    issued: pkInfo.issued,
  }
})
