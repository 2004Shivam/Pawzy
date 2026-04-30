<div align="center">

# 🐾 Pawzy

### Your screen break companion that actually stops you.

[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-blueviolet?style=flat-square)](https://github.com/2004Shivam/Pawzy/releases)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron)](https://electronjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

<br/>

> Pawzy locks your screen with an animated companion at regular intervals,  
> forces you to breathe, stretch, and look away — then lets you back in.  
> No popups. No snooze. Just a cat (or dog, or panda) sitting on your work.

<br/>

![Pawzy Break Screen](production_artifacts/landing/preview.png)

</div>

---

## ✨ Why Pawzy?

Most break reminder apps send a notification you instantly dismiss. Pawzy **takes over your entire screen** with a fullscreen companion overlay — the break actually happens. It's inspired by the [Cat Gatekeeper](https://www.catgatekeeper.org/) concept but built as a standalone, zero-dependency desktop app.

- 🔒 **Truly inescapable** — fullscreen overlay, Alt+F4 blocked, Super key handled
- 🐾 **4 animated companions** — Cat, Shiba Inu, Panda, Fox
- ⏱️ **Configurable timers** — set your own work/break durations
- 💬 **Wellness prompts** — drink water, stretch, breathe — rotated every 8 seconds
- 🚀 **Launches on login** — enabled automatically, no manual setup
- 📦 **Zero install required** — single `.AppImage` on Linux, `.exe` on Windows

---

## 🎬 How It Works

```
Work session (default: 25 min)
        │
        ▼
  ┌─────────────┐
  │  WARNING    │  Tray icon pulses — 60 second heads up
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │    BREAK    │  Companion slides in from the right
  │  OVERLAY   │  Timer counts down — prompts cycle
  └─────────────┘
        │
        ▼
  Back to work — automatically
```

The Python backend (`pawzy-core`) watches your active window state and manages the schedule. The Electron frontend renders the fullscreen overlay and tray icon. They communicate over a local WebSocket on `localhost:8765`.

---

## 🐾 Meet Your Companions

| | Name | Vibe |
|---|---|---|
| 🐱 | **Neko** (Cat) | The original gatekeeper. Slides in, sits down, judges you. |
| 🐕 | **Shiba Inu** | Fluffy & loyal. Much break. Very rest. |
| 🐼 | **ChillPanda** | Somewhere & cool. Will outlast your deadline. |
| 🦊 | **FoxKit** | Swift & stylish. Takes 5 deep breaths with you. |

Choose your companion during onboarding — change anytime in Settings.

---

## 📥 Installation

### Linux (AppImage)

```bash
# Download from Releases
chmod +x Pawzy-0.1.0.AppImage
./Pawzy-0.1.0.AppImage
```

No Python, no Node, no dependencies. Double-click and go.  
Autostart is enabled automatically on first launch.

### Windows

Download `Pawzy-Setup-0.1.0.exe` from [Releases](https://github.com/2004Shivam/Pawzy/releases) and run the installer.

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- `pip install -r app_build/pawzy-core/requirements.txt`

### Run in dev mode

```bash
git clone https://github.com/2004Shivam/Pawzy.git
cd Pawzy
bash run_dev.sh
```

Both the Python backend and Electron frontend start together.  
Look for the 🐾 paw icon in your system tray.

### Build for production

**Linux AppImage:**
```bash
cd app_build/pawzy-core
pip install pyinstaller
pyinstaller --distpath ./dist --workpath ./build --noconfirm pawzy-core.spec

cd ../pawzy-ui
npm install
npm run dist
# → dist-electron/Pawzy-0.1.0.AppImage
```

**Windows `.exe` (run on Windows):**
```bash
# Same steps above — electron-builder auto-detects Windows and builds NSIS installer
npm run dist
# → dist-electron/Pawzy-Setup-0.1.0.exe
```

---

## ⚙️ Configuration

Pawzy stores your settings in `~/.pawzy/config.json`:

```json
{
  "work_minutes": 25,
  "break_minutes": 5,
  "character": "cat_gatekeeper",
  "first_launch": false
}
```

You can change all of these from the **Settings** panel (right-click the tray icon → Settings).

---

## 🗂️ Project Structure

```
Pawzy/
├── app_build/
│   ├── pawzy-core/          # Python backend
│   │   ├── main.py          # Entry point — boots all subsystems
│   │   ├── rule_engine.py   # Work/break state machine
│   │   ├── window_tracker.py
│   │   ├── ws_server.py     # WebSocket bridge to Electron
│   │   ├── tray.py          # System tray (PyQt6)
│   │   └── requirements.txt
│   │
│   └── pawzy-ui/            # Electron + React frontend
│       ├── electron/
│       │   ├── main.js      # Main process — windows, IPC, autostart
│       │   └── preload.js   # Secure renderer bridge
│       └── src/
│           ├── lockscreen/  # Break overlay + character system
│           ├── onboarding/  # First-run setup flow
│           └── settings/    # Settings UI
│
├── production_artifacts/
│   └── landing/             # Static landing page (deploy to Vercel)
│
└── run_dev.sh               # One-command dev launcher
```

---

## 🤝 Contributing

Pull requests are welcome. To add a new companion:

1. Create `src/lockscreen/characters/YourCharacter.jsx`
2. Register it in `src/lockscreen/characters/CharacterRegistry.js`
3. Add it to the onboarding picker in `src/onboarding/Onboarding.jsx`

Each character receives `{ phase: 'slide' | 'sleep', onSlideEnd: fn }` as props.

---

## 📄 License

MIT © [Shivam](https://github.com/2004Shivam)

---

<div align="center">
  <sub>Built for humans who forget they have a body. 🧘</sub>
</div>
