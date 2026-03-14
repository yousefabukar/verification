# Electron + React + TypeScript Desktop App

A cross-platform desktop application built with Electron, React, and TypeScript.

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run electron:dev
```

This will start the Vite dev server and launch the Electron app with hot module replacement (HMR).

### 3. Build for Production

Build for all platforms:
```bash
npm run build
```

Or build for specific platforms:
```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Built apps will be in the `release/` directory.

## Entry Points

### Electron Main Process (Backend)
- **File**: `electron/main.ts`
- **Purpose**: Main Electron process, creates windows, handles system events
- **This is where you**:
  - Create browser windows
  - Handle app lifecycle (startup, quit)
  - Access Node.js APIs and system features
  - Set up IPC communication with renderer

### Electron Preload Script
- **File**: `electron/preload.ts`
- **Purpose**: Security bridge between main and renderer processes
- **This is where you**:
  - Expose safe APIs to the renderer process
  - Use contextBridge to selectively expose functionality

### React App (Frontend)
- **Entry File**: `src/main.tsx`
- **Main Component**: `src/App.tsx`
- **Purpose**: React application UI
- **This is where you**:
  - Build your UI components
  - Handle user interactions
  - Manage application state

## Project Structure

```
verification/
├── electron/
│   ├── main.ts          # Electron main process (ENTRY POINT)
│   └── preload.ts       # Preload script for security
├── src/
│   ├── main.tsx         # React entry point (ENTRY POINT)
│   ├── App.tsx          # Main React component
│   ├── App.css          # Component styles
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite bundler configuration
└── README.md           # This file
```

## Development Tips

- **Hot Reload**: Changes to React components auto-reload
- **DevTools**: Opens automatically in development mode
- **TypeScript**: Full type checking enabled
- **Cross-platform**: Builds work on Windows, macOS, and Linux

## Next Steps

1. Modify `src/App.tsx` to build your UI
2. Add IPC handlers in `electron/main.ts` for backend logic
3. Expose APIs in `electron/preload.ts` for frontend-backend communication
4. Install additional dependencies as needed
