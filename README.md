<div align="center">

# 🐱 Cat Gatekeeper for Desktop — Pawzy

### The desktop version of Cat Gatekeeper that actually works.

[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-blueviolet?style=flat-square)](https://github.com/2004Shivam/Pawzy/releases)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?style=flat-square&logo=electron)](https://electronjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

<br/>

> **Pawzy** is a free, open-source desktop app that hijacks your **entire OS screen** during scheduled breaks.
> Unlike the Cat Gatekeeper Chrome extension (which only blocks 6 websites), Pawzy works on every app,
> game, browser, and Discord — at the OS level. No new-tab bypass. No Alt+F4. Inescapable.

<br/>

**[🌐 cat-gatekeeper-desktop.vercel.app](https://cat-gatekeeper-desktop.vercel.app) · [📥 Download Now](https://github.com/2004Shivam/Pawzy/releases/latest)**

</div>

---

## 🐱 Cat Gatekeeper Alternative — For Your Entire Desktop

Love [Cat Gatekeeper](https://chromewebstore.google.com/detail/cat-gatekeeper/elbikiflgfhjdjmficnigpeegjbhdidh)? Pawzy takes that brilliant idea much further.

Cat Gatekeeper is a Chrome extension that works on a handful of websites. **Pawzy is a full desktop app that hijacks your entire screen** — every app, every site, every distraction. There's no "open a new tab" trick. There's no Brave/Firefox workaround. It works at the OS level.

| Feature | Cat Gatekeeper | 🐾 Pawzy |
|---|---|---|
| Works on YouTube, TikTok, Instagram | ⚠️ 6 sites only | ✅ All sites |
| Works on desktop apps (games, IDE, Spotify) | ❌ Browser only | ✅ Entire OS |
| Bypass-proof (no new-tab workaround) | ❌ Open new tab = reset | ✅ OS-level, unescapable |
| Works on Brave, Firefox, Arc | ❌ Chrome only | ✅ Any browser (or none) |
| Multiple animal companions | 1 (cat only) | ✅ 4+ companions |
| 100% free | ✅ | ✅ |

> **Keywords:** cat gatekeeper alternative · cat gatekeeper desktop · cat gatekeeper not working · forced break timer · screen hijack break timer · inescapable pomodoro · 20-20-20 rule app linux · eye break timer windows

---

## ✨ Why Pawzy?

Most break reminder apps send a notification you instantly dismiss. Pawzy **takes over your entire screen** with a fullscreen companion overlay — the break actually happens. It's inspired by the [Cat Gatekeeper](https://chromewebstore.google.com/detail/cat-gatekeeper/elbikiflgfhjdjmficnigpeegjbhdidh) concept but rebuilt as a standalone, zero-dependency desktop app with no website restrictions.

- 🔒 **Truly inescapable** — fullscreen overlay, Alt+F4 blocked, Super key handled
- 🖥️ **Works everywhere** — YouTube, TikTok, VS Code, Steam, your IDE — anything
- 🐾 **4 animated companions** — Cat, Shiba Inu, Capybara, Monkey
- ⏱️ **Configurable timers** — set your own work/break durations
- 💬 **Wellness prompts** — drink water, stretch, breathe — rotated every 8 seconds
- 🚀 **Launches on login** — enabled automatically, no manual setup
- 📦 **Zero install required** — single `.AppImage` on Linux, `.exe` on Windows
- 🔌 **100% offline** — no accounts, no servers, no tracking

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
| 🦦 | **Capybara** | Maximum chill energy. Just sits there and radiates peace. |
| 🐒 | **Monkey**   | Playful & curious. Swings in to make sure you take that break. |

Choose your companion during onboarding — change anytime in Settings.

---

## 📥 Installation

### Linux (AppImage)

```bash
chmod +x Pawzy-0.1.0.AppImage
./Pawzy-0.1.0.AppImage
```

No Python, no Node, no dependencies. Double-click and go.
Autostart is enabled automatically on first launch.

### Windows

Download `Pawzy.Setup.0.1.0.exe` from [Releases](https://github.com/2004Shivam/Pawzy/releases) and run the installer.

**Note:** Windows may show a SmartScreen warning. Click **'More info' → 'Run anyway'**. The app is completely open source and safe.

---

## 🛠️ Development Setup

*End users do NOT need Python or Node.js — just download the release!*

- Node.js 20+, Python 3.11+
- `pip install -r app_build/pawzy-core/requirements.txt`

```bash
git clone https://github.com/2004Shivam/Pawzy.git
cd Pawzy
bash run_dev.sh
```

---

## ⚙️ Configuration

Pawzy stores settings in `~/.pawzy/config.json`:

```json
{
  "work_minutes": 25,
  "break_minutes": 5,
  "character": "cat",
  "first_launch": false
}
```

Change everything from the **Settings** panel (right-click tray icon → Settings).

---

## 🗂️ Project Structure

```
Pawzy/
├── app_build/
│   ├── pawzy-core/          # Python backend (rule engine, tray, WS server)
│   └── pawzy-ui/            # Electron + React frontend (lockscreen, settings)
├── production_artifacts/
│   └── landing/             # Static landing page → cat-gatekeeper-desktop.vercel.app
└── run_dev.sh               # One-command dev launcher
```

---

## 🤝 Contributing

To add a new companion:
1. Create `src/lockscreen/characters/YourCharacter.jsx`
2. Register in `src/lockscreen/characters/CharacterRegistry.js`
3. Add to onboarding picker in `src/onboarding/Onboarding.jsx`

---

## 📄 License

MIT © [Shivam](https://github.com/2004Shivam)

---

<div align="center">
  <sub>Inspired by <a href="https://chromewebstore.google.com/detail/cat-gatekeeper/elbikiflgfhjdjmficnigpeegjbhdidh">Cat Gatekeeper</a> · Built for humans who forget they have a body. 🧘</sub>
</div>
