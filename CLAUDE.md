# Trusted Capture: AI Image Verification System

## Overview

This project provides a way to **cryptographically verify whether an image was captured by a trusted physical camera**, rather than being AI-generated or modified.

Instead of detecting AI images using machine learning, we prove authenticity using:

- Secure image hashing
- TPM-backed digital signatures
- Metadata embedding
- Signature verification

If an image cannot produce a valid signature from a trusted device, it is considered **unverified and potentially AI generated**.

---

# System Architecture

The system consists of two main applications:

1. **Capture Application (Electron)**
2. **Verification Application (Rust backend)**

Workflow:

```
Camera → Image → Hash → TPM Signature → Metadata Embed → Saved Image
                                                        ↓
                                           Verification Software
                                                        ↓
                                      Signature + Hash Validation
```

---

# Architecture Diagram

```
                    ┌──────────────────────────┐
                    │     Capture Application   │
                    │        (Electron)         │
                    └─────────────┬────────────┘
                                  │
                                  │ Webcam Stream
                                  ▼
                        ┌──────────────────┐
                        │ Webcam Interface │
                        │ getUserMedia API │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Image Capture     │
                        │ Frame Extraction  │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Image Processor  │
                        │ Extract RGB Data │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ SHA-256 Hasher   │
                        │ Image Fingerprint│
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ TPM Signing      │
                        │ Device Private   │
                        │ Key              │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Metadata Embedder│
                        │ Hash + Signature │
                        │ Certificate ID   │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Signed Image     │
                        │ PNG / JPEG       │
                        └────────┬─────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  Verification Application │
                    │      (Rust Backend)      │
                    └─────────────┬────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Metadata Reader │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Hash Recompute  │
                         │ SHA-256         │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Signature Check │
                         │ Public Key      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Verification    │
                         │ Result Output   │
                         └─────────────────┘
```

---

# Component Breakdown

## 1. Capture Application (Electron)

Purpose: capture a webcam image and generate a **cryptographic authenticity proof**.

### Technologies

- Electron
- Node.js
- Web Camera API
- Node Crypto

### Responsibilities

- Capture image from webcam
- Extract image data
- Generate hash
- Request signature from TPM
- Embed verification metadata

---

## 2. Image Hashing

The image is converted into raw RGB data and hashed using SHA-256.

### Process

```
Image → RGB byte array → SHA256 → Image Hash
```

### Purpose

- Create a **unique fingerprint of the image**
- Any modification will change the hash

---

## 3. TPM Signing

The computed hash is signed using a **device private key stored in the TPM**.

### Process

```
Image Hash
     ↓
TPM private key signs hash
     ↓
Digital Signature
```

### Security Benefit

- The private key **cannot be extracted**
- Only trusted hardware can produce the signature

---

## 4. Metadata Embedding

Verification data is stored inside the image metadata.

### Stored Fields

```
{
  imageHash,
  signature,
  certificateID,
  timestamp
}
```

### Storage Options

- EXIF metadata (JPEG)
- PNG text metadata fields

This ensures the verification proof **travels with the image file**.

---

# Verification Application

The verification application checks whether the image is authentic.

Implemented using a **Rust backend**.

### Responsibilities

1. Read metadata from image
2. Extract signature and hash
3. Recompute image hash
4. Verify signature using public key
5. Output verification result

---

## Verification Flow

```
Upload Image
     ↓
Extract Metadata
     ↓
Recompute Image Hash
     ↓
Decrypt Signature using Public Key
     ↓
Compare Hash Values
     ↓
Return Result
```

---

# Verification Logic

If:

```
recomputedHash == decryptedSignatureHash
```

Result:

```
✔ Image verified
Captured by trusted device
```

Otherwise:

```
⚠ Image not verified
Possible AI generation or tampering
```

---

# Technology Stack

| Layer | Technology |
|------|------------|
| Frontend Capture | Electron |
| Camera Access | Web Media API |
| Cryptography | Node Crypto |
| Signing | TPM / Secure key |
| Metadata | EXIF / PNG metadata |
| Verification Backend | Rust |
| Hash Algorithm | SHA-256 |

---

# Security Model

The system assumes:

- The private signing key is protected inside a **TPM**
- Images can only be signed **during trusted capture**
- Modifying the image invalidates the signature

This ensures that only images captured by trusted hardware can produce a valid authenticity proof.

---

# Potential Future Improvements

Possible extensions beyond the hackathon:

- Hardware camera attestation
- Certificate authority for trusted devices
- Blockchain proof of capture
- Secure timestamping
- Browser extension verification

