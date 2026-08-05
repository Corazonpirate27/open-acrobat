# 📄 Adobe Acrobat Clone - Linux & Cross-Platform Edition

A high-performance, feature-rich desktop & web PDF application built for **Fedora Workstation, Ubuntu, Arch Linux**, as well as **PC, iPad, iOS, and Android** devices. Powered by WebAssembly, PDF.js, and PDF-Lib.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Fedora%20%7C%20Linux%20%7C%20Web%20%7C%20Mobile-red.svg)

---

## ✨ Features

- 📑 **PDF Rendering & Viewing**: Multi-page scroll, high-DPI canvas rendering, thumbnail navigation sidebar, page jump, and zoom controls (`Ctrl++`, `Ctrl+-`).
- ✍️ **Write Text Anywhere**: Click anywhere on any PDF page to insert floating, inline-editable text boxes. Includes instant Save (`✓`) and Close/Cancel (`✕`) controls.
- 🖍️ **Markup & Annotation Suite**: Text highlighting, freehand vector pen drawing, shape bounding boxes, and custom sticky notes.
- 🖋️ **Digital Signatures & Preset Stamps**:
  - Touch-friendly digital signature canvas to draw & place your signature anywhere.
  - Preset official stamps: `APPROVED`, `REJECTED`, `CONFIDENTIAL`, `DRAFT`.
- 📑 **Page Organizer & Assembly**: Reorder, rotate 90°, delete, or extract pages before saving.
- 🔀 **PDF Merging & Watermarking**: Combine multiple PDFs into a single file and add transparent text watermarks.
- 💾 **Save & Export**: Save modified PDFs with burned-in annotations/signatures or export individual pages as PNG images.
- 📱 **Cross-Platform Responsive**: Touch gesture enabled for iPad (Apple Pencil support), iOS Safari, Android, and PC.

---

## 🚀 Quickstart

### Prerequisites
- Node.js `v18+`
- npm `v9+`

### Installation & Execution

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pdf-acrobat-clone.git

# Change directory
cd pdf-acrobat-clone

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📦 Native Desktop App (Fedora / Linux)

To run as a native desktop application on Fedora Linux:

```bash
# Install Electron & Builder
npm install -D electron electron-builder

# Build native RPM / AppImage desktop packages
npx electron-builder --linux rpm AppImage
```

---

## 🛠️ Built With

- [PDF.js](https://mozilla.github.io/pdf.js/) — High-performance PDF parsing and canvas rendering.
- [pdf-lib](https://pdf-lib.js.org/) — Native PDF modification, text embedding, and document assembly.
- [Vite](https://vitejs.dev/) — Lightning-fast web application build tool.
- [Tailwind CSS](https://tailwindcss.com/) — Modern desktop UI styling.
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) — Celebration effects on document export.

---

## 📄 License

MIT License © 2026
