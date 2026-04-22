# Recast — Vibe Translator

A Chrome extension that transforms any text into any vibe, with AI-powered voice synthesis via ElevenLabs.

Highlight text on any webpage → right-click → **"Recast this text 🎭"** → hear it transformed instantly.

Built for the **ElevenLabs × Kiro Hackathon** using spec-driven development.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Build the extension

```bash
npm run build
```

This outputs everything Chrome needs into the `dist/` folder.

### 3. Load into Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the `dist/` folder inside this project
5. The Recast 🎭 icon will appear in your Chrome toolbar

> After any code change, run `npm run build` again, then click the **refresh icon** on the Recast card at `chrome://extensions`.

### 4. Add your API keys

Click the **⚙️** icon in the popup:

- **ElevenLabs API key** — required for voice playback → [get one here](https://elevenlabs.io/app/settings/api-keys)
- **OpenAI API key** — optional; built-in transformations are used if omitted → [get one here](https://platform.openai.com/api-keys)

Keys are saved to `chrome.storage.local` and only ever sent to their respective APIs.

### 5. Test it

**Option A — Context menu (the main feature):**
1. Go to any webpage and highlight some text
2. Right-click → **"Recast this text 🎭"**
3. The popup opens with the text pre-loaded
4. Pick a mode, click **Transform**, then click **Transformed** to hear it

**Option B — Popup directly:**
1. Click the Recast icon in the toolbar
2. Paste text, pick a mode, press `Ctrl+Enter`
3. Click **Transformed** to play the ElevenLabs voice

**Quick smoke test without API keys:**
1. Load the extension
2. Click the icon → click **Example** to load a demo text
3. Click **Transform** — you should see a transformed result (uses built-in transforms, no API key needed)
4. Add your ElevenLabs key in ⚙️ Settings to enable voice playback

---

## Transformation Modes

| Mode | Example |
|------|---------|
| Corporate → Gen Z | "Please be advised" → "yo bestie fr fr 💯" |
| Angry → Passive Aggressive | "This is unacceptable!" → "I'm sure you had your reasons..." |
| Meeting → Sports Commentary | "We decided to reallocate" → "AND THERE IT IS! A STUNNING play!" |
| Rant → BBC News Anchor | "I CAN'T BELIEVE THIS!!!" → "In news this evening..." |
| Angry Customer → Professional | "Your service is terrible!" → "I understand your frustration..." |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Transform text |
| `Esc` | Clear all |

---

## Architecture

```
src/
├── background.js          # Service worker — ElevenLabs TTS + OpenAI API calls, context menu
├── content.js             # Injected into pages — captures selected text
├── App.jsx                # Popup root component
├── components/
│   ├── ModeSelector.jsx   # Transformation mode pills
│   ├── TextEditor.jsx     # Dual-pane input/output
│   ├── ControlPanel.jsx   # Action buttons
│   └── SettingsPanel.jsx  # API key management
└── services/
    └── transformationService.js  # Mock transforms (dev mode fallback)

public/
└── manifest.json          # Chrome Extension Manifest V3
```

**Why the background service worker handles API calls:**
Chrome extensions can't make cross-origin requests from popups in Manifest V3. The background service worker has `host_permissions` for `api.elevenlabs.io` and `api.openai.com`, so all API calls go through it. The popup communicates via `chrome.runtime.sendMessage`.

---

## Development

```bash
npm run dev      # Dev server at localhost:5173 (popup UI only, no extension APIs)
npm run build    # Build to dist/ for Chrome
npm run lint     # ESLint
```

After any code change, run `npm run build` and click the refresh icon on `chrome://extensions`.

---

## Tech Stack

- **React 19** + Vite
- **Chrome Extension Manifest V3**
- **ElevenLabs API** — Text-to-speech with mode-specific voices and stability settings
- **OpenAI API** — GPT-4o-mini for text transformation (falls back to built-in transforms)
- **Lucide React** — Icons

---

## License

MIT
