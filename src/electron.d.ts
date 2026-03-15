export interface VerifyResult {
  valid: boolean
  certId?: string
  device?: string
  authority?: string
  error?: string
}

export interface ElectronAPI {
  readCertDirectory: () => Promise<CertFolder[]>
  readKey: (keyPath: string) => Promise<KeyInfo>
  verifyImage: (imgPath: string) => Promise<VerifyResult>
}

export interface CertFolder {
  name: string
  type: 'folder'
  files: CertFile[]
}

export interface CertFile {
  name: string
  path: string
}

export interface KeyInfo {
  uid: string
  authority: string
  deviceModel: string
  publicKey: string
  issuedAt: string
  expiresAt: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
