<p align="center">
  <img src="Custom Browser Main Page/icons/logoext.webp" alt="Custom Browser Main Page Logo" width="120" height="120" />
</p>

<h1 align="center">Custom Browser Main Page</h1>

<p align="center">
  <strong>A beautiful, fully customizable new-tab extension for your browser.</strong><br/>
  Transform your browser's new tab into a powerful, personalized dashboard.
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/custom-browser-main-page/khblnlhhfpfkfjagkbebffgognjjmhlp"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome-v2.0.1-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" /></a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/custom-browser-main-page/"><img alt="Firefox Add-ons" src="https://img.shields.io/badge/Firefox-v1.0.9-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white" /></a>
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" /></a>
  <a href="https://github.com/AgustinBeniteez/Custom-Browser-Main-Page"><img alt="Open Source" src="https://img.shields.io/badge/Open_Source-❤-red?style=for-the-badge" /></a>
</p>

<p align="center">
  <a href="https://custom-browser-main-page.vercel.app">🌐 Official Website</a> •
  <a href="#-installation">📦 Installation</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-contributing">🤝 Contributing</a>
</p>

---

## 📖 About

**Custom Browser Main Page** is an open-source browser extension that replaces the default new tab page with a stunning, highly customizable dashboard. Designed with an IDE-style settings panel, it gives you full control over every aspect of your browsing start page — from wallpapers and widgets to notes, favorites, and system monitoring.

Available for **Google Chrome** (v2.0.1) and **Mozilla Firefox** (v1.0.9 — update coming soon).

---

## ✨ Features

### 🎨 Full Visual Customization
- **Custom Wallpapers** — Use preset backgrounds, upload your own images, paste a URL, or browse the built-in wallpaper gallery.
- **Theme Colors** — Pick any accent color for the UI to match your style.
- **Dark Mode** — Toggle a sleek dark theme with a single click.
- **Custom Fonts** — Choose from 9 handpicked typefaces including Bebas Neue, Dancing Script, Roboto Mono, and more.

### 🕐 Clock & Search
- **Real-Time Clock** — Prominent, customizable clock on your new tab (color, animations, show/hide).
- **Integrated Search Bar** — Quick access to search the web right from your new tab.

### 📌 Favorites & Folders
- **Favorites Manager** — Save your most-visited sites with name and URL.
- **Folders** — Organize favorites into collapsible folders.
- **Square / List Display** — Switch between display styles.
- **Custom Folder Icons** — Upload your own open/closed folder icons.
- **Right-Click Context Menu** — Edit or delete favorites with ease.

### 📝 Notes System (IDE-Style)
- **Full Note Editor** — Create, edit, and delete notes with titles, content, colors, tags, and dates.
- **Pinned Notes** — Pin important notes to the new tab for quick reference.
- **Calendar View** — Browse notes organized by date in a built-in calendar.
- **Tags & Filtering** — Add tags and filter notes instantly.
- **Export Notes** — Export individual notes for backup.

### 🔧 Widgets
- **System Status** — Monitor CPU and RAM usage in real time (Chrome only).
- **Weather Widget** — Live weather data powered by [Open-Meteo](https://open-meteo.com/) with city selection and custom location search.
- **Pomodoro Timer** — Built-in work/break timer with mute controls.
- **Calendar Widget** — Compact calendar view with navigation.
- **Important Notes Widget** — Quick glance at your most recent notes.
- **Merge Widgets** — Option to combine System Status & Weather into a single panel.

### 🧩 Layout & Templates
- **Edit Mode** — Drag-and-drop repositioning of all widgets.
- **Widget Visibility** — Show or hide any widget from the widgets menu.
- **Layout Templates** — Save, apply, export, and import custom layout templates.
- **Import / Export Layouts** — Share your setup with others via JSON files.

### 🌍 Multi-Language Support
Full translations for **8 languages**:
| Language | Code |
|---|---|
| 🇬🇧 English | `en` |
| 🇪🇸 Español | `es` |
| va Valenciano | `val` |
| 🇫🇷 Français | `fr` |
| 🇷🇺 Русский | `ru` |
| 🇨🇳 中文 | `zh` |
| 🇯🇵 日本語 | `ja` |
| 🇰🇷 한국어 | `ko` |

### ⚡ Performance
- **Performance Configuration** — Fine-tuned settings for animation quality, rendering optimization, and resource management.

---

## 📦 Installation

### Google Chrome (v2.0.1 — Latest)

**Install from the Chrome Web Store** (recommended):

<p align="center">
  <a href="https://chromewebstore.google.com/detail/custom-browser-main-page/khblnlhhfpfkfjagkbebffgognjjmhlp">
    <img src="https://img.shields.io/badge/Install_on-Chrome_Web_Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Install on Chrome Web Store" />
  </a>
</p>

<details>
<summary>🔧 Manual install (Developer mode)</summary>

1. Clone this repository:
   ```bash
   git clone https://github.com/AgustinBeniteez/Custom-Browser-Main-Page.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **"Load unpacked"**.
5. Select the `Custom Browser Main Page` folder from the cloned repository.
6. Open a new tab and enjoy! 🎉

</details>

### Mozilla Firefox (v1.0.9)

> ⚠️ **Note:** The Firefox version is currently behind the Chrome version and is pending an update.

**Install from Firefox Add-ons** (recommended):

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/custom-browser-main-page/">
    <img src="https://img.shields.io/badge/Install_on-Firefox_Add--ons-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white" alt="Install on Firefox Add-ons" />
  </a>
</p>

<details>
<summary>🔧 Manual install (Developer mode)</summary>

1. Clone this repository:
   ```bash
   git clone https://github.com/AgustinBeniteez/Custom-Browser-Main-Page.git
   ```
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on..."**.
4. Select the `manifest.json` file inside the `Custom Browser Main Page - firefox` folder.
5. Open a new tab and enjoy!

</details>

---

## 📂 Project Structure

```
Custom-Browser-Main-Page/
├── Custom Browser Main Page/          # Chrome Extension (v2.0.1)
│   ├── manifest.json                  # Chrome Manifest V3 configuration
│   ├── newtab.html                    # Main new-tab page
│   ├── styles.css                     # Core stylesheet
│   ├── script.js                      # Entry point
│   ├── pre-layout.js                  # Pre-render layout logic
│   ├── performance.config.js          # Performance tuning
│   ├── modules/                       # JavaScript modules
│   │   ├── background-manager.js      #   Background/wallpaper logic
│   │   ├── clock-search.js            #   Clock & search bar
│   │   ├── edit-mode.js               #   Drag-and-drop layout editing
│   │   ├── favorites.js               #   Favorites & folders
│   │   ├── features.js                #   Feature toggles & settings
│   │   ├── i18n.js                    #   Internationalization engine
│   │   ├── ide-tabs.js                #   IDE-style tab navigation
│   │   ├── notes.js                   #   Notes system
│   │   ├── pomodoro.js                #   Pomodoro timer widget
│   │   ├── search.js                  #   Search functionality
│   │   ├── settings.js                #   Settings management
│   │   ├── state.js                   #   Application state
│   │   ├── storage.js                 #   Storage abstraction
│   │   ├── system-status.js           #   CPU/RAM monitoring
│   │   ├── templates.js               #   Layout templates system
│   │   └── ui.js                      #   UI utilities
│   ├── translations/                  # Language files
│   │   ├── lang.json                  #   All translation strings
│   │   └── translations.js            #   Translation loader
│   ├── icons/                         # Extension icons & logos
│   └── fondos/                        # Preset background images
│
├── Custom Browser Main Page - firefox/ # Firefox Extension (v1.0.9)
│   └── (similar structure)
│
├── README.md
└── LICENSE
```

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! This is an open-source project licensed under the [MIT License](LICENSE).

### How to Contribute

#### 🐛 Reporting Bugs
If you find a bug, please [open an issue](https://github.com/AgustinBeniteez/Custom-Browser-Main-Page/issues/new) with:
- A clear, descriptive **title**.
- Steps to **reproduce** the bug.
- What you **expected** to happen vs. what **actually** happened.
- Your **browser** and **extension version** (Chrome v2.0.1 or Firefox v1.0.9).
- Screenshots or screen recordings if possible.

#### 💡 Suggesting Features
Have an idea? [Open a feature request issue](https://github.com/AgustinBeniteez/Custom-Browser-Main-Page/issues/new) with:
- A clear description of the feature.
- Why it would be useful.
- Any mockups or references if applicable.

#### 🔧 Submitting Code (Pull Requests)

1. **Fork** the repository.
2. **Create** a new branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make** your changes in the appropriate directory:
   - For Chrome: `Custom Browser Main Page/`
   - For Firefox: `Custom Browser Main Page - firefox/`
4. **Test** your changes by loading the extension locally in your browser.
5. **Commit** your changes with a clear message:
   ```bash
   git commit -m "feat: add awesome new feature"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
7. **Open a Pull Request** against the `main` branch.

### 📋 Contribution Guidelines

- Keep code **clean and readable**.
- Follow the existing **code style** and structure.
- Add **translation keys** to `translations/lang.json` if your feature includes user-facing text.
- Test on both **Chrome and Firefox** when possible.
- One pull request per feature or fix.

### 🏷️ Issue Labels

| Label | Description |
|---|---|
| `bug` | Something isn't working correctly |
| `enhancement` | New feature or improvement request |
| `help wanted` | Looking for community contributions |
| `good first issue` | Great for newcomers to the project |
| `documentation` | Improvements to docs or README |
| `firefox` | Specific to the Firefox version |
| `chrome` | Specific to the Chrome version |

---

## 🛠️ Technologies

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, animations, glassmorphism effects
- **Vanilla JavaScript** — ES Modules, no external frameworks
- **Manifest V3** — Modern Chrome extension API
- **Font Awesome 6** — Icon library
- **Open-Meteo API** — Weather data (no API key required)

---

## 👤 Author

**Agustin Benitez**

- 🌐 [Website](https://agustinbeniteez.github.io/)
- 🐙 [GitHub](https://github.com/AgustinBeniteez)
- 📦 [Project Page](https://agustinbeniteez.github.io/Custom-Browser-Main-Page/)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software. Attribution is appreciated but not required.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/AgustinBeniteez">Agustin Benitez</a>
</p>
