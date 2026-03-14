# Veritas Verification

## What is this?

This app checks if an image was captured by a real camera or if it's AI-generated/modified.

It works by verifying cryptographic signatures that get embedded in photos when they're taken with our capture app. If an image has a valid signature, it's real. If not, it could be AI-generated or tampered with.

## How verification works

1. You upload an image (or drag and drop it)
2. The app extracts embedded metadata (hash + signature + device ID)
3. It recalculates a fingerprint from the actual pixel data
4. It verifies the signature using the device's public key
5. If the fingerprints match and signature is valid → **verified ✓**
6. If anything's wrong → **unverified ✗**

## Why signatures can't be faked

- The signature is created by a hardware chip (TPM) that won't give up its private key
- Only the original capture device can create valid signatures
- Copying metadata to a different image won't work - the signature is bound to specific pixel data
- Editing even one pixel changes the hash and breaks verification

## What you can trust

**Verification passes** → Image came from a trusted camera, unmodified
**Verification fails** → Either AI-generated, edited, or signature was stripped

## Quick Start

```bash
# Install and run
npm install
npm run electron:dev
```

This opens the verification app where you can check images.

## Tech

- **Frontend**: Electron + React + TypeScript
- **Crypto**: SHA-256 hash verification + signature checking
- **Backend**: Rust