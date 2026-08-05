<div align="center">

# 📄 Open Acrobat - Professional PDF Suite

### *A 100% Free & Open-Source Adobe Acrobat Clone for Fedora, Linux, PC, iPad, and Mobile*

![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Fedora](https://img.shields.io/badge/Fedora-Workstation-blueviolet.svg?style=for-the-badge&logo=fedora)
![Linux](https://img.shields.io/badge/Linux-Ubuntu%20%7C%20Arch%20%7C%20Debian-FCC624.svg?style=for-the-badge&logo=linux)
![Cross Platform](https://img.shields.io/badge/Platform-PC%20%7C%20iPad%20%7C%20Mobile-success.svg?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-100%25%20Free-success.svg?style=for-the-badge)

[Features](#-key-features) • [Quickstart](#-quickstart) • [Shortcuts](#-keyboard-shortcuts) • [Fedora Packaging](#-fedora--linux-desktop-packaging) • [License](#-license)

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
git clone https://github.com/Corazonpirate27/open-acrobat.git

# 2. Enter project folder
cd open-acrobat

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
| `Ctrl + O` / `Cmd + O` | Open PDF file |
| `Ctrl + S` / `Cmd + S` | Save & Export PDF |
| `Ctrl + P` / `Cmd + P` | Print Document |
| `Ctrl + / -` | Zoom In / Zoom Out |
| `Ctrl + Z` | Undo Annotation |
| `H` | Hand Pan Tool |
| `V` | Select & Drag Elements |
| `T` | Write Text Anywhere |
| `P` | Freehand Pen |
| `S` | Stamp & Signature Tool |
| `M` | Merge PDFs Modal |
| `W` | Watermark Modal |
| `?` | Keyboard Shortcuts Cheatsheet |
| `Delete` / `Backspace` | Remove Selected Element |

---

## 📦 Fedora & Linux Desktop Packaging

To launch or build the native Linux desktop application:

```bash
# Run native desktop app
cd ~/open-acrobat/dist-desktop/linux-unpacked
./open-acrobat

# Build standalone AppImage & RPM packages
npm run dist
```

---

## 🛠️ Tech Stack

- **PDF Engine**: [PDF.js](https://mozilla.github.io/pdf.js/) & [PDF-Lib](https://pdf-lib.js.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **UI Framework & Styling**: Vanilla JS & Tailwind CSS
- **Effects**: Canvas Confetti

---

## 📄 License

**Open Acrobat** is 100% Free & Open-Source Software distributed under the permissive [MIT License](LICENSE).
