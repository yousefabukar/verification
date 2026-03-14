import { useState, useEffect } from 'react'
import './App.css'
import { CertFolder, KeyInfo } from './electron'

type VerificationResult = {
  valid: boolean
  device?: string
  authority?: string
  error?: string
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [certTree, setCertTree] = useState<CertFolder[]>([])
  const [selectedKey, setSelectedKey] = useState<KeyInfo | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.readCertDirectory().then(setCertTree)
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setVerificationResult(null)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setVerificationResult(null)
    }
  }

  const handleVerify = () => {
    // TODO: Call Rust backend via bindings
    // Mock verification for now
    setVerificationResult({
      valid: true,
      device: 'iPhone 15 Pro',
      authority: 'Apple',
    })
  }

  const toggleFolder = (name: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleKeyClick = async (keyPath: string) => {
    if (window.electronAPI) {
      const keyInfo = await window.electronAPI.readKey(keyPath)
      setSelectedKey(keyInfo)
      setShowModal(true)
    }
  }

  return (
    <div className="app">
      <div className="split-view">
        <div className="verify-panel">
          <h2>Verify Image</h2>
          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {!previewUrl ? (
              <>
                <p>Drop image or click to select</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </>
            ) : (
              <img src={previewUrl} alt="Preview" className="preview" />
            )}
          </div>

          {selectedFile && (
            <div className="actions">
              <button onClick={handleVerify}>Verify</button>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  setVerificationResult(null)
                }}
              >
                Clear
              </button>
            </div>
          )}

          {verificationResult && (
            <div className={`result ${verificationResult.valid ? 'valid' : 'invalid'}`}>
              {verificationResult.valid ? (
                <>
                  <p className="status">✓ Verified</p>
                  <p>Device: {verificationResult.device}</p>
                  <p>Authority: {verificationResult.authority}</p>
                </>
              ) : (
                <>
                  <p className="status">✗ Unverified</p>
                  <p>{verificationResult.error || 'Image could not be verified'}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="keys-panel">
          <h2>Trusted Keys</h2>
          <div className="file-tree">
            {certTree.map((folder) => (
              <div key={folder.name} className="folder">
                <button
                  className="folder-header"
                  onClick={() => toggleFolder(folder.name)}
                >
                  <span className="icon">{expandedFolders.has(folder.name) ? '▼' : '▶'}</span>
                  <span className="folder-name">{folder.name}</span>
                  <span className="count">{folder.files.length}</span>
                </button>
                {expandedFolders.has(folder.name) && (
                  <div className="files">
                    {folder.files.map((file) => (
                      <button
                        key={file.name}
                        className="file"
                        onClick={() => handleKeyClick(file.path)}
                      >
                        <span className="icon">🔑</span>
                        <span className="file-name">{file.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedKey && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Key Information</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="key-field">
                <label>UID</label>
                <div className="value mono">{selectedKey.uid}</div>
              </div>
              <div className="key-field">
                <label>Authority</label>
                <div className="value">{selectedKey.authority}</div>
              </div>
              <div className="key-field">
                <label>Device Model</label>
                <div className="value">{selectedKey.deviceModel}</div>
              </div>
              <div className="key-field">
                <label>Issued</label>
                <div className="value">{selectedKey.issuedAt}</div>
              </div>
              <div className="key-field">
                <label>Expires</label>
                <div className="value">{selectedKey.expiresAt}</div>
              </div>
              <div className="key-field">
                <label>Public Key</label>
                <div className="value mono key-preview">{selectedKey.publicKey}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
