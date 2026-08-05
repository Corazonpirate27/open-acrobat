<div align="center">

# 📄 Acrobat Linux - Professional PDF Suite

### *A fast, open-source Adobe Acrobat clone for Fedora, Linux, PC, iPad, and Mobile*

![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Fedora](https://img.shields.io/badge/Fedora-Workstation-blueviolet.svg?style=for-the-badge&logo=fedora)
![Linux](https://img.shields.io/badge/Linux-Ubuntu%20%7C%20Arch%20%7C%20Debian-FCC624.svg?style=for-the-badge&logo=linux)
![Cross Platform](https://img.shields.io/badge/Platform-PC%20%7C%20iPad%20%7C%20Mobile-success.svg?style=for-the-badge)

[Features](#-key-features) • [Quickstart](#-quickstart) • [Shortcuts](#-keyboard-shortcuts) • [Fedora Packaging](#-fedora--linux-desktop-packaging) • [Tech Stack](#-tech-stack)

---

</div>

## ✨ Key Features

- 📑 **PDF Rendering & Navigation**
  - High-DPI canvas rendering powered by Mozilla PDF.js.
  - Multi-page continuous scrolling, thumbnail sidebar navigation, and zoom controls (`Ctrl++`, `Ctrl+-`).
  
- ✍️ **Write Text Anywhere**
  - Click anywhere on any PDF page to type floating text.
  - Includes instant Save (`✓`) and Close/Cancel (`✕`) controls for full editing freedom.
  
- 🔤 **Selectable & Copyable Text**
  - Select document text, double-click words, drag cursor over text, and copy text to clipboard (`Ctrl+C`).
  
- 🖍️ **Markup & Annotations**
  - Text highlighting, freehand vector pen drawing, shape bounding boxes, and sticky notes.
  
- 🖋️ **Digital Signatures & Preset Stamps**
  - Touch-friendly digital signature drawing pad.
  - Official preset stamps: `✓ APPROVED`, `✕ REJECTED`, `🔒 CONFIDENTIAL`, `📝 DRAFT`.
  
- 📑 **Page Organizer & Assembly**
  - Reorder, rotate 90°, delete, or extract pages before exporting.
  
- 🔀 **PDF Merging & Watermarks**
  - Merge multiple PDF files into one and add custom transparent text watermarks.
  
- 💾 **Save & Export**
  - Burn annotations, text, and signatures into a clean, downloadable PDF file (`pdf-lib`).
  
- 📱 **Cross-Platform & Touch Optimized**
  - Responsive design with touch gesture support for **PC**, **iPad (Apple Pencil)**, **iOS Safari**, and **Android** mobile devices.

---

## 🚀 Quickstart

### Prerequisites
- Node.js `v18+`
- npm `v9+`

### Installation & Local Run

```bash
# 1. Clone repository
git clone https://github.com/Corazonpirate27/acro-linux.git

# 2. Enter project folder
cd pdf-acrobat-clone

# 3. Install dependencies
npm install

# 4. Launch local dev server
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + O` | Open PDF file |
| `Ctrl + S` | Save & Export PDF |
| `Ctrl + / -` | Zoom In / Zoom Out |
| `H` | Hand Pan Tool |
| `V` | Select & Drag Elements |
| `T` | Write Text Anywhere |
| `P` | Freehand Pen |
| `Delete` | Remove Selected Element |

---

## 📦 Fedora & Linux Desktop Packaging

To create a native Linux `.AppImage` or Fedora `.rpm` package:

```bash
# Install packaging tools
npm install -D electron electron-builder

# Build native Linux packages
npx electron-builder --linux rpm AppImage
```

---

## 🛠️ Tech Stack

- **PDF Engine**: [PDF.js](https://mozilla.github.io/pdf.js/) & [PDF-Lib](https://pdf-lib.js.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **UI Framework & Styling**: Vanilla JS & Tailwind CSS
- **Effects**: Canvas Confetti

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
# open-acrobat
