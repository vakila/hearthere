# Project Conversion Log: Vanilla TS → React

## Date: 2026-04-21

## Summary

Converted the hearthere project from a vanilla TypeScript + Vite setup to a React application while preserving all existing functionality (MapLibre globe, Tone.js audio synthesis).

## Changes Made

### Dependencies Added

- `react` ^19.0.0
- `react-dom` ^19.0.0
- `@types/react` (dev)
- `@types/react-dom` (dev)
- `@vitejs/plugin-react` ^6.0.1 (dev)

### Dependencies Updated

- `vite` → ^8.0.9 (required for @vitejs/plugin-react compatibility)

### Configuration Files

#### `vite.config.ts`
- Added React plugin import and configuration

#### `tsconfig.json`
- Added `"jsx": "react-jsx"` compiler option

#### `index.html`
- Replaced static HTML structure with `<div id="root">` for React mounting

### New Files Created

#### `src/main.tsx`
React entry point using `createRoot` with StrictMode.

#### `src/components/App.tsx`
Root component composing Globe and Controls, integrating the `useAudio` hook.

#### `src/components/Globe.tsx`
React wrapper for MapLibre GL map initialization and rendering. Handles:
- Map creation in `useEffect` with cleanup on unmount
- Globe projection setup
- Stations layer with hover cursor changes
- `onInit` callback for audio initialization

#### `src/components/Controls.tsx`
UI component for play/pause button and synth controls display.

#### `src/hooks/useAudio.ts`
Custom hook managing audio state and Tone.js initialization:
- `init()` - initializes audio context
- `toggle()` - play/pause audio
- `playing` - current playback state

### Files Modified

#### `src/style.css`
- Updated CSS selectors from `#app`, `#map`, `#info` to `.app`, `.map-container`, `.info-card`
- Updated media queries accordingly

#### `src/voices.ts`
- Removed unused variables (`lfo20`, `vco2`, `lfo21`, `filter2`, `lfo22`, `delay2`)
- Removed unused function parameters
- Fixed `window.voices` and `window.mixer` type assertions

#### `src/play.ts`
- Removed unused imports (`getVoice1`, `getVoice2`, `getVoice3`, `getVoiceD`, `F3maj`)
- Fixed `window` property type assertions

#### `src/globe.ts`
Not directly modified - logic moved to `Globe.tsx` component.

#### `src/main.ts`
Deleted - replaced by `main.tsx`

## Architecture

```
src/
├── main.tsx           # React entry point
├── components/
│   ├── App.tsx       # Root component
│   ├── Globe.tsx     # MapLibre map component
│   └── Controls.tsx   # UI controls
├── hooks/
│   └── useAudio.ts   # Audio synthesis hook
└── ...
```

## Notes

- Build passes successfully (`npm run build`)
- Dev server available via `npm run dev`
- Some unused code in `voices.ts` (getVoice2, getVoice3, getVoiceD) remains for future use
- Window globals for debugging preserved with proper type assertions