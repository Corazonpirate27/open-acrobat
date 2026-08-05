import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { createSamplePdfBytes } from './samplePdf.js';

// Configure local Vite-bundled PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// State Management
const state = {
  pdfBytes: null,           // Original/Current PDF ArrayBuffer/Uint8Array
  pdfDocLib: null,          // pdf-lib PDFDocument instance
  pdfJsDoc: null,           // PDF.js Document instance
  fileName: 'document.pdf',
  numPages: 0,
  currentPage: 1,
  scale: window.innerWidth < 640 ? 0.75 : 1.0, // Auto-scale for mobile vs PC
  rotation: 0,              // Global viewing rotation override
  activeTool: 'hand',       // 'hand', 'select', 'highlight', 'draw', 'text', 'shape', 'stamp'
  annotations: {},          // Map: pageNum -> Array of annot objects
  selectedAnnot: null,      // Active selected annotation object
  pageRotations: {},        // Map: pageNum -> rotation (0, 90, 180, 270)
  pageOrder: [],            // Array of original 1-based page indices
  mergeSelectedFiles: [],   // Array of File objects to merge
  
  // Tool properties
  color: '#facc15',
  size: 4,
  opacity: 0.5,
  activeStampText: 'APPROVED',
  signatureImgData: null,
};

// DOM References
const elements = {
  app: document.getElementById('app'),
  docName: document.getElementById('doc-name'),
  fileInput: document.getElementById('file-input'),
  btnOpenFile: document.getElementById('btn-open-file'),
  btnSavePdf: document.getElementById('btn-save-pdf'),
  
  // Navigation & Zoom
  pageNumInput: document.getElementById('page-num-input'),
  pageCount: document.getElementById('page-count'),
  btnPrevPage: document.getElementById('btn-prev-page'),
  btnNextPage: document.getElementById('btn-next-page'),
  btnZoomIn: document.getElementById('btn-zoom-in'),
  btnZoomOut: document.getElementById('btn-zoom-out'),
  zoomLevel: document.getElementById('zoom-level'),

  // Workspace
  pdfContainer: document.getElementById('pdf-container'),
  emptyState: document.getElementById('empty-state'),
  pagesWrapper: document.getElementById('pages-wrapper'),
  thumbnailContainer: document.getElementById('thumbnail-container'),
  annotationsList: document.getElementById('annotations-list'),

  // Sidebars
  leftSidebar: document.getElementById('left-sidebar'),
  rightInspector: document.getElementById('right-inspector'),
  toggleLeftSidebar: document.getElementById('toggle-left-sidebar'),
  toggleInspector: document.getElementById('toggle-inspector'),
  activeToolBadge: document.getElementById('active-tool-badge'),

  // Desktop Tools
  toolHand: document.getElementById('tool-hand'),
  toolSelect: document.getElementById('tool-select'),
  toolHighlight: document.getElementById('tool-highlight'),
  toolDraw: document.getElementById('tool-draw'),
  toolText: document.getElementById('tool-text'),
  toolShape: document.getElementById('tool-shape'),
  toolStamp: document.getElementById('tool-stamp'),
  toolPageMgr: document.getElementById('tool-page-mgr'),
  toolMerge: document.getElementById('tool-merge'),

  // Mobile Bottom Dock Tools
  mToolHand: document.getElementById('m-tool-hand'),
  mToolSelect: document.getElementById('m-tool-select'),
  mToolText: document.getElementById('m-tool-text'),
  mToolHighlight: document.getElementById('m-tool-highlight'),
  mToolDraw: document.getElementById('m-tool-draw'),
  mToolStamp: document.getElementById('m-tool-stamp'),

  // Inspector Properties
  propColor: document.getElementById('prop-color'),
  propSize: document.getElementById('prop-size'),
  propSizeVal: document.getElementById('prop-size-val'),
  propOpacity: document.getElementById('prop-opacity'),
  propOpacityVal: document.getElementById('prop-opacity-val'),
  sigCanvas: document.getElementById('sig-canvas'),
  sigClearBtn: document.getElementById('sig-clear-btn'),
  sigApplyBtn: document.getElementById('sig-apply-btn'),

  // Modals
  modalPageMgr: document.getElementById('modal-page-mgr'),
  pageMgrGrid: document.getElementById('page-mgr-grid'),
  btnPageMgrApply: document.getElementById('btn-page-mgr-apply'),
  
  modalWatermark: document.getElementById('modal-watermark'),
  wmText: document.getElementById('wm-text'),
  wmSize: document.getElementById('wm-size'),
  wmOpacity: document.getElementById('wm-opacity'),
  btnApplyWatermark: document.getElementById('btn-apply-watermark'),
  
  modalMerge: document.getElementById('modal-merge'),
  mergeFilesInput: document.getElementById('merge-files-input'),
  btnSelectMergeFiles: document.getElementById('btn-select-merge-files'),
  mergeFilesList: document.getElementById('merge-files-list'),
  btnRunMerge: document.getElementById('btn-run-merge'),

  // Dropzone buttons
  dropOpenBtn: document.getElementById('drop-open-btn'),
  dropDemoBtn: document.getElementById('drop-demo-btn'),

  // Menu items
  menuOpen: document.getElementById('menu-open'),
  menuOpenDemo: document.getElementById('menu-open-demo'),
  menuSave: document.getElementById('menu-save'),
  menuExportPng: document.getElementById('menu-export-png'),
  menuMerge: document.getElementById('menu-merge'),
  menuPrint: document.getElementById('menu-print'),
  menuUndo: document.getElementById('menu-undo'),
  menuClearAnnots: document.getElementById('menu-clear-annots'),
  menuZoomIn: document.getElementById('menu-zoom-in'),
  menuZoomOut: document.getElementById('menu-zoom-out'),
  menuFitWidth: document.getElementById('menu-fit-width'),
  menuFitPage: document.getElementById('menu-fit-page'),
  menuRotateCw: document.getElementById('menu-rotate-cw'),
  menuRotateCcw: document.getElementById('menu-rotate-ccw'),
  menuToolPageMgr: document.getElementById('menu-tool-page-mgr'),
  menuToolWatermark: document.getElementById('menu-tool-watermark'),
  menuToolStamp: document.getElementById('menu-tool-stamp'),
  menuShortcuts: document.getElementById('menu-shortcuts'),
  menuAbout: document.getElementById('menu-about'),
};

// Initialize Application
async function init() {
  setupDropdownMenus();
  setupEventListeners();
  setupDragAndDrop();
  setupSignatureCanvas();
  
  // Collapse sidebars by default on mobile screens
  if (window.innerWidth < 768) {
    elements.leftSidebar.classList.add('hidden');
    elements.rightInspector.classList.add('hidden');
    elements.toggleLeftSidebar.classList.remove('active');
    elements.toggleInspector.classList.remove('active');
  }

  // Load sample demo PDF automatically on startup
  setTimeout(() => {
    loadDemoPdf();
  }, 300);
}

// Dropdown Menu Toggles for File, Edit, View, Tools, Help
function setupDropdownMenus() {
  const menuPairs = [
    { btnId: 'btn-menu-file', dropId: 'dropdown-file' },
    { btnId: 'btn-menu-edit', dropId: 'dropdown-edit' },
    { btnId: 'btn-menu-view', dropId: 'dropdown-view' },
    { btnId: 'btn-menu-tools', dropId: 'dropdown-tools' },
    { btnId: 'btn-menu-help', dropId: 'dropdown-help' },
  ];

  menuPairs.forEach(({ btnId, dropId }) => {
    const btn = document.getElementById(btnId);
    const drop = document.getElementById(dropId);
    if (btn && drop) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isOpen = drop.classList.contains('show');
        document.querySelectorAll('.dropdown-menu').forEach((d) => d.classList.remove('show'));
        if (!isOpen) {
          drop.classList.add('show');
        }
      });
    }
  });

  // Close menus when clicking anywhere outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach((d) => d.classList.remove('show'));
  });

  // Close menu when clicking any dropdown item
  document.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach((d) => d.classList.remove('show'));
    });
  });
}

// Load Demo PDF
async function loadDemoPdf() {
  try {
    const sampleBytes = await createSamplePdfBytes();
    await loadPdfFromBytes(sampleBytes, 'Acrobat_Linux_Overview.pdf');
  } catch (err) {
    console.error('Failed to load demo PDF:', err);
  }
}

// Load PDF from ArrayBuffer / Uint8Array
async function loadPdfFromBytes(bytes, name = 'document.pdf') {
  try {
    state.pdfBytes = bytes;
    state.fileName = name;
    elements.docName.textContent = name;

    const loadingTask = pdfjsLib.getDocument({
      data: bytes.slice(0),
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: true,
    });

    state.pdfJsDoc = await loadingTask.promise;
    state.numPages = state.pdfJsDoc.numPages;
    elements.pageCount.textContent = state.numPages;

    try {
      state.pdfDocLib = await PDFDocument.load(bytes.slice(0), { ignoreEncryption: true });
    } catch (pdfLibErr) {
      console.warn('pdf-lib warning:', pdfLibErr);
      state.pdfDocLib = null;
    }

    state.pageOrder = Array.from({ length: state.numPages }, (_, i) => i + 1);
    state.pageRotations = {};
    state.annotations = {};
    state.currentPage = 1;
    elements.pageNumInput.value = 1;

    elements.emptyState.classList.add('hidden');
    elements.pagesWrapper.classList.remove('hidden');

    await renderAllPages();
    await renderThumbnails();

  } catch (err) {
    console.error('Error opening PDF document:', err);
    alert(`Could not display PDF file "${name}". Error: ${err.message || err}`);
  }
}

// Render All Pages
async function renderAllPages() {
  elements.pagesWrapper.innerHTML = '';

  for (let i = 0; i < state.pageOrder.length; i++) {
    const origPageNum = state.pageOrder[i];
    const displayPageNum = i + 1;

    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';
    pageContainer.dataset.pageNum = displayPageNum;
    pageContainer.dataset.origPageNum = origPageNum;

    const canvas = document.createElement('canvas');
    canvas.className = 'canvas-layer';

    const textLayer = document.createElement('div');
    textLayer.className = 'text-layer';
    textLayer.dataset.pageNum = displayPageNum;

    const overlay = document.createElement('div');
    overlay.className = `annotation-layer ${state.activeTool === 'hand' || state.activeTool === 'select' ? 'pass-through' : ''}`;
    overlay.dataset.pageNum = displayPageNum;

    pageContainer.appendChild(canvas);
    pageContainer.appendChild(textLayer);
    pageContainer.appendChild(overlay);
    elements.pagesWrapper.appendChild(pageContainer);

    await renderSinglePage(origPageNum, displayPageNum, canvas, textLayer, overlay);
    setupOverlayInteraction(overlay, displayPageNum);
  }

  updateAnnotationsList();
}

// Render a single PDF Page with Canvas & Selectable Text Layer
async function renderSinglePage(origPageNum, displayPageNum, canvas, textLayer, overlay) {
  try {
    const page = await state.pdfJsDoc.getPage(origPageNum);
    
    const rot = (state.pageRotations[origPageNum] || 0) + state.rotation;
    const viewport = page.getViewport({ scale: state.scale, rotation: rot });

    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);

    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';

    textLayer.style.width = Math.floor(viewport.width) + 'px';
    textLayer.style.height = Math.floor(viewport.height) + 'px';

    overlay.style.width = Math.floor(viewport.width) + 'px';
    overlay.style.height = Math.floor(viewport.height) + 'px';

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      transform,
      viewport,
    };

    await page.render(renderContext).promise;

    // Extract and Render Selectable Text Layer
    try {
      const textContent = await page.getTextContent();
      textLayer.innerHTML = '';

      textContent.items.forEach((item) => {
        if (!item.str || item.str.trim() === '') return;
        
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);

        const span = document.createElement('span');
        span.textContent = item.str;
        span.style.left = `${tx[4]}px`;
        span.style.top = `${tx[5] - fontHeight}px`;
        span.style.fontSize = `${fontHeight}px`;
        span.style.fontFamily = item.fontName || 'sans-serif';
        
        textLayer.appendChild(span);
      });
    } catch (textErr) {
      console.warn('Text layer extraction warning:', textErr);
    }

    renderPageAnnotations(overlay, displayPageNum);
  } catch (err) {
    console.error(`Error rendering page ${displayPageNum}:`, err);
  }
}

// Render Thumbnails in Left Sidebar
async function renderThumbnails() {
  elements.thumbnailContainer.innerHTML = '';

  for (let i = 0; i < state.pageOrder.length; i++) {
    const origPageNum = state.pageOrder[i];
    const displayPageNum = i + 1;

    const thumbItem = document.createElement('div');
    thumbItem.className = `p-2 rounded bg-neutral-950 border border-neutral-800 flex flex-col items-center gap-1.5 cursor-pointer hover:border-red-500/60 transition ${displayPageNum === state.currentPage ? 'ring-2 ring-red-600' : ''}`;
    thumbItem.dataset.pageNum = displayPageNum;

    const canvas = document.createElement('canvas');
    canvas.className = 'rounded shadow max-w-full h-auto bg-white';

    const label = document.createElement('span');
    label.className = 'text-[11px] font-mono text-neutral-400';
    label.textContent = `Page ${displayPageNum}`;

    thumbItem.appendChild(canvas);
    thumbItem.appendChild(label);
    elements.thumbnailContainer.appendChild(thumbItem);

    try {
      const page = await state.pdfJsDoc.getPage(origPageNum);
      const viewport = page.getViewport({ scale: 0.2, rotation: state.pageRotations[origPageNum] || 0 });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.warn('Thumbnail render warning:', err);
    }

    thumbItem.addEventListener('click', () => {
      scrollToPage(displayPageNum);
      if (window.innerWidth < 768) {
        elements.leftSidebar.classList.add('hidden');
        elements.toggleLeftSidebar.classList.remove('active');
      }
    });
  }
}

// Drag & Drop File Handling Setup
function setupDragAndDrop() {
  const container = elements.pdfContainer;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    container.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  container.addEventListener('dragover', () => {
    container.classList.add('border-red-500', 'bg-neutral-900/80');
  });

  container.addEventListener('dragleave', () => {
    container.classList.remove('border-red-500', 'bg-neutral-900/80');
  });

  container.addEventListener('drop', async (e) => {
    container.classList.remove('border-red-500', 'bg-neutral-900/80');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const buffer = await file.arrayBuffer();
        await loadPdfFromBytes(buffer, file.name);
      } else {
        alert('Please drop a valid PDF document.');
      }
    }
  });
}

// Scroll to Page
function scrollToPage(pageNum) {
  state.currentPage = pageNum;
  elements.pageNumInput.value = pageNum;
  
  const targetPage = elements.pagesWrapper.querySelector(`[data-page-num="${pageNum}"]`);
  if (targetPage) {
    targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  Array.from(elements.thumbnailContainer.children).forEach((child) => {
    if (child.dataset.pageNum == pageNum) {
      child.classList.add('ring-2', 'ring-red-600');
    } else {
      child.classList.remove('ring-2', 'ring-red-600');
    }
  });
}

// Tool Selection Switcher with Mobile Bottom Dock Sync
function setActiveTool(tool) {
  state.activeTool = tool;
  
  const toolsMap = {
    hand: [elements.toolHand, elements.mToolHand],
    select: [elements.toolSelect, elements.mToolSelect],
    highlight: [elements.toolHighlight, elements.mToolHighlight],
    draw: [elements.toolDraw, elements.mToolDraw],
    text: [elements.toolText, elements.mToolText],
    shape: [elements.toolShape, null],
    stamp: [elements.toolStamp, elements.mToolStamp],
  };

  Object.entries(toolsMap).forEach(([name, btns]) => {
    btns.forEach((el) => {
      if (el) {
        if (name === tool) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  });

  elements.activeToolBadge.textContent = tool.toUpperCase();

  const overlays = document.querySelectorAll('.annotation-layer');
  overlays.forEach((overlay) => {
    if (tool === 'hand' || tool === 'select') {
      overlay.classList.add('pass-through');
    } else {
      overlay.classList.remove('pass-through');
    }
  });

  if (tool === 'hand') {
    elements.pdfContainer.style.cursor = 'grab';
  } else if (tool === 'select') {
    elements.pdfContainer.style.cursor = 'default';
  } else if (tool === 'text') {
    elements.pdfContainer.style.cursor = 'text';
  } else {
    elements.pdfContainer.style.cursor = 'crosshair';
  }
}

// Create Direct Floating Inline Editor anywhere on the PDF page
function spawnInlineTextEditor(overlay, pageNum, x, y, initialText = '') {
  const existingWrapper = overlay.querySelector('.inline-text-wrapper');
  if (existingWrapper) existingWrapper.remove();

  const wrapper = document.createElement('div');
  wrapper.className = 'inline-text-wrapper';
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;

  const toolbar = document.createElement('div');
  toolbar.className = 'inline-text-toolbar';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'editor-btn editor-btn-close';
  closeBtn.title = 'Close / Cancel';
  closeBtn.innerHTML = '&times;';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'editor-btn editor-btn-save';
  saveBtn.title = 'Save Text';
  saveBtn.innerHTML = '✓';

  toolbar.appendChild(closeBtn);
  toolbar.appendChild(saveBtn);

  const editor = document.createElement('div');
  editor.contentEditable = 'true';
  editor.className = 'inline-text-editor';
  editor.style.color = state.color;
  editor.style.fontSize = `${Math.max(14, state.size * 3)}px`;
  editor.textContent = initialText;

  wrapper.appendChild(toolbar);
  wrapper.appendChild(editor);
  overlay.appendChild(wrapper);

  setTimeout(() => {
    editor.focus();
  }, 50);

  let isHandled = false;

  const saveText = () => {
    if (isHandled) return;
    isHandled = true;
    const textVal = editor.textContent.trim();
    if (textVal) {
      addAnnotation(pageNum, {
        id: Date.now(),
        type: 'text',
        text: textVal,
        color: state.color,
        size: Math.max(14, state.size * 3),
        x, y,
      });
    }
    wrapper.remove();
  };

  const closeText = () => {
    if (isHandled) return;
    isHandled = true;
    wrapper.remove();
  };

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeText();
  });

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    saveText();
  });

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveText();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeText();
    }
  });
}

// Get Touch or Mouse Relative Coordinates
function getRelativeCoords(e, overlay) {
  const rect = overlay.getBoundingClientRect();
  let clientX = e.clientX;
  let clientY = e.clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

// Overlay Interactive Drawing & Touch/Pointer Setup for Mobile, iPad, and PC
function setupOverlayInteraction(overlay, pageNum) {
  let isDrawing = false;
  let currentAnnot = null;
  let points = [];

  const handleStart = (e) => {
    if (state.activeTool === 'hand' || state.activeTool === 'select') return;
    if (e.target.closest('.inline-text-wrapper')) return;

    const { x, y } = getRelativeCoords(e, overlay);

    if (state.activeTool === 'text') {
      spawnInlineTextEditor(overlay, pageNum, x, y);
      return;
    }

    if (state.activeTool === 'draw') {
      isDrawing = true;
      points = [{ x, y }];
      currentAnnot = {
        id: Date.now(),
        type: 'draw',
        color: state.color,
        size: state.size,
        opacity: state.opacity,
        points: points,
      };
    } else if (state.activeTool === 'highlight') {
      isDrawing = true;
      currentAnnot = {
        id: Date.now(),
        type: 'highlight',
        color: state.color,
        opacity: state.opacity,
        x, y, width: 0, height: 0,
      };
    } else if (state.activeTool === 'shape') {
      isDrawing = true;
      currentAnnot = {
        id: Date.now(),
        type: 'shape',
        color: state.color,
        size: state.size,
        opacity: state.opacity,
        x, y, width: 0, height: 0,
      };
    } else if (state.activeTool === 'stamp') {
      if (state.signatureImgData) {
        addAnnotation(pageNum, {
          id: Date.now(),
          type: 'signature',
          imgData: state.signatureImgData,
          x: x - 60, y: y - 25, width: 120, height: 50,
        });
      } else {
        addAnnotation(pageNum, {
          id: Date.now(),
          type: 'stamp',
          text: state.activeStampText,
          x: x - 50, y: y - 18, width: 100, height: 36,
        });
      }
    }
  };

  const handleMove = (e) => {
    if (!isDrawing || !currentAnnot) return;
    const { x, y } = getRelativeCoords(e, overlay);

    if (currentAnnot.type === 'draw') {
      currentAnnot.points.push({ x, y });
      renderPageAnnotations(overlay, pageNum, currentAnnot);
    } else if (currentAnnot.type === 'highlight' || currentAnnot.type === 'shape') {
      currentAnnot.width = x - currentAnnot.x;
      currentAnnot.height = y - currentAnnot.y;
      renderPageAnnotations(overlay, pageNum, currentAnnot);
    }
  };

  const handleEnd = () => {
    if (isDrawing && currentAnnot) {
      isDrawing = false;
      addAnnotation(pageNum, currentAnnot);
      currentAnnot = null;
    }
  };

  overlay.addEventListener('mousedown', handleStart);
  overlay.addEventListener('mousemove', handleMove);
  overlay.addEventListener('mouseup', handleEnd);

  // Touch Screen Events (iPad / Mobile / Tablets)
  overlay.addEventListener('touchstart', (e) => {
    if (state.activeTool !== 'hand' && state.activeTool !== 'select') {
      e.preventDefault();
    }
    handleStart(e);
  }, { passive: false });

  overlay.addEventListener('touchmove', (e) => {
    if (isDrawing) {
      e.preventDefault();
      handleMove(e);
    }
  }, { passive: false });

  overlay.addEventListener('touchend', handleEnd);
}

// Add Annotation to page state
function addAnnotation(pageNum, annot) {
  if (!state.annotations[pageNum]) {
    state.annotations[pageNum] = [];
  }
  state.annotations[pageNum].push(annot);

  const overlay = elements.pagesWrapper.querySelector(`.annotation-layer[data-page-num="${pageNum}"]`);
  if (overlay) {
    renderPageAnnotations(overlay, pageNum);
  }

  updateAnnotationsList();
}

// Make Annotation Element Touch & Mouse Draggable
function makeElementDraggable(element, annot, overlay, pageNum) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  if (state.selectedAnnot === annot) {
    const deleteBadge = document.createElement('button');
    deleteBadge.className = 'annot-delete-badge';
    deleteBadge.title = 'Delete element';
    deleteBadge.innerHTML = '&times;';

    const handleDelete = (e) => {
      e.stopPropagation();
      e.preventDefault();
      state.annotations[pageNum] = state.annotations[pageNum].filter((a) => a !== annot);
      state.selectedAnnot = null;
      renderAllPages();
      updateAnnotationsList();
    };

    deleteBadge.addEventListener('click', handleDelete);
    deleteBadge.addEventListener('touchstart', handleDelete, { passive: false });
    element.appendChild(deleteBadge);
  }

  const startDrag = (clientX, clientY, e) => {
    if (state.activeTool === 'select') {
      if (e.target.classList.contains('annot-delete-badge')) return;

      selectAnnotation(annot);
      isDragging = true;
      startX = clientX - annot.x;
      startY = clientY - annot.y;

      const onMove = (moveEv) => {
        if (!isDragging) return;
        let curX = moveEv.clientX;
        let curY = moveEv.clientY;
        if (moveEv.touches && moveEv.touches.length > 0) {
          curX = moveEv.touches[0].clientX;
          curY = moveEv.touches[0].clientY;
        }
        annot.x = curX - startX;
        annot.y = curY - startY;
        element.style.left = annot.x + 'px';
        element.style.top = annot.y + 'px';
      };

      const onEnd = () => {
        isDragging = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
        updateAnnotationsList();
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }
  };

  element.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    startDrag(e.clientX, e.clientY, e);
  });

  element.addEventListener('touchstart', (e) => {
    if (state.activeTool === 'select') {
      e.stopPropagation();
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY, e);
    }
  }, { passive: false });

  if (annot.type === 'text') {
    element.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      state.annotations[pageNum] = state.annotations[pageNum].filter((a) => a !== annot);
      renderPageAnnotations(overlay, pageNum);
      spawnInlineTextEditor(overlay, pageNum, annot.x, annot.y, annot.text);
    });
  }
}

// Render Annotations on Overlay Element
function renderPageAnnotations(overlay, pageNum, liveTempAnnot = null) {
  overlay.innerHTML = '';

  const annots = [...(state.annotations[pageNum] || [])];
  if (liveTempAnnot) annots.push(liveTempAnnot);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  overlay.appendChild(svg);

  annots.forEach((annot) => {
    if (annot.type === 'draw') {
      if (annot.points.length < 2) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M ${annot.points[0].x} ${annot.points[0].y}`;
      for (let i = 1; i < annot.points.length; i++) {
        d += ` L ${annot.points[i].x} ${annot.points[i].y}`;
      }
      path.setAttribute('d', d);
      path.setAttribute('stroke', annot.color);
      path.setAttribute('stroke-width', annot.size);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', annot.opacity);
      svg.appendChild(path);

    } else if (annot.type === 'highlight') {
      const rect = document.createElement('div');
      rect.className = `annot-element ${state.selectedAnnot === annot ? 'selected' : ''}`;
      rect.style.left = Math.min(annot.x, annot.x + annot.width) + 'px';
      rect.style.top = Math.min(annot.y, annot.y + annot.height) + 'px';
      rect.style.width = Math.abs(annot.width) + 'px';
      rect.style.height = Math.abs(annot.height) + 'px';
      rect.style.backgroundColor = annot.color;
      rect.style.opacity = annot.opacity;
      rect.style.mixBlendMode = 'multiply';

      makeElementDraggable(rect, annot, overlay, pageNum);
      overlay.appendChild(rect);

    } else if (annot.type === 'shape') {
      const rect = document.createElement('div');
      rect.className = `annot-element ${state.selectedAnnot === annot ? 'selected' : ''}`;
      rect.style.left = Math.min(annot.x, annot.x + annot.width) + 'px';
      rect.style.top = Math.min(annot.y, annot.y + annot.height) + 'px';
      rect.style.width = Math.abs(annot.width) + 'px';
      rect.style.height = Math.abs(annot.height) + 'px';
      rect.style.border = `${annot.size}px solid ${annot.color}`;
      rect.style.opacity = annot.opacity;

      makeElementDraggable(rect, annot, overlay, pageNum);
      overlay.appendChild(rect);

    } else if (annot.type === 'text') {
      const textDiv = document.createElement('div');
      textDiv.className = `annot-element font-sans font-semibold px-1 rounded ${state.selectedAnnot === annot ? 'selected' : ''}`;
      textDiv.style.left = annot.x + 'px';
      textDiv.style.top = annot.y + 'px';
      textDiv.style.color = annot.color;
      textDiv.style.fontSize = annot.size + 'px';
      textDiv.textContent = annot.text;

      makeElementDraggable(textDiv, annot, overlay, pageNum);
      overlay.appendChild(textDiv);

    } else if (annot.type === 'stamp') {
      const stampDiv = document.createElement('div');
      stampDiv.className = `annot-element border-2 font-bold flex items-center justify-center rounded uppercase tracking-wider ${state.selectedAnnot === annot ? 'selected' : ''}`;
      stampDiv.style.left = annot.x + 'px';
      stampDiv.style.top = annot.y + 'px';
      stampDiv.style.width = annot.width + 'px';
      stampDiv.style.height = annot.height + 'px';
      stampDiv.style.fontSize = '12px';
      stampDiv.textContent = annot.text;

      if (annot.text === 'APPROVED') {
        stampDiv.style.borderColor = '#10b981';
        stampDiv.style.color = '#10b981';
        stampDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
      } else if (annot.text === 'REJECTED') {
        stampDiv.style.borderColor = '#ef4444';
        stampDiv.style.color = '#ef4444';
        stampDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      } else {
        stampDiv.style.borderColor = '#f59e0b';
        stampDiv.style.color = '#f59e0b';
        stampDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
      }

      makeElementDraggable(stampDiv, annot, overlay, pageNum);
      overlay.appendChild(stampDiv);

    } else if (annot.type === 'signature') {
      const img = document.createElement('img');
      img.className = `annot-element ${state.selectedAnnot === annot ? 'selected' : ''}`;
      img.src = annot.imgData;
      img.style.left = annot.x + 'px';
      img.style.top = annot.y + 'px';
      img.style.width = annot.width + 'px';
      img.style.height = annot.height + 'px';

      makeElementDraggable(img, annot, overlay, pageNum);
      overlay.appendChild(img);
    }
  });
}

// Select Annotation for inspector editing or removal
function selectAnnotation(annot) {
  state.selectedAnnot = annot;
  
  if (annot.color) {
    state.color = annot.color;
    elements.propColor.value = annot.color;
  }
  if (annot.size) {
    state.size = Math.round(annot.size / 3);
    elements.propSize.value = state.size;
    elements.propSizeVal.textContent = `${state.size}px`;
  }

  renderAllPages();
}

// Update Annotations List Sidebar
function updateAnnotationsList() {
  elements.annotationsList.innerHTML = '';
  let count = 0;

  Object.entries(state.annotations).forEach(([pageNum, annots]) => {
    annots.forEach((annot, idx) => {
      count++;
      const item = document.createElement('div');
      item.className = 'p-2 rounded bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between hover:border-neutral-700 transition';
      
      const info = document.createElement('div');
      info.className = 'flex flex-col';
      
      const typeSpan = document.createElement('span');
      typeSpan.className = 'font-semibold text-white capitalize';
      typeSpan.textContent = `${annot.type} (Page ${pageNum})`;
      
      const detailSpan = document.createElement('span');
      detailSpan.className = 'text-[10px] text-neutral-400 truncate max-w-[120px]';
      detailSpan.textContent = annot.text || `${annot.color || ''}`;

      info.appendChild(typeSpan);
      info.appendChild(detailSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'text-neutral-500 hover:text-red-400 text-sm px-1';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.addEventListener('click', () => {
        state.annotations[pageNum].splice(idx, 1);
        renderAllPages();
        updateAnnotationsList();
      });

      item.appendChild(info);
      item.appendChild(deleteBtn);
      elements.annotationsList.appendChild(item);
    });
  });

  if (count === 0) {
    elements.annotationsList.innerHTML = '<div class="text-center text-xs text-neutral-500 py-10">No annotations added yet</div>';
  }
}

// Setup Touch-Friendly Signature Drawing Canvas
function setupSignatureCanvas() {
  const canvas = elements.sigCanvas;
  const ctx = canvas.getContext('2d');
  let drawing = false;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  const getCanvasPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    drawing = true;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const moveDraw = (e) => {
    if (!drawing) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => { drawing = false; };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDraw(e);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    moveDraw(e);
  }, { passive: false });
  canvas.addEventListener('touchend', endDraw);

  elements.sigClearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.signatureImgData = null;
  });

  elements.sigApplyBtn.addEventListener('click', () => {
    state.signatureImgData = canvas.toDataURL('image/png');
    setActiveTool('stamp');
    alert('Signature ready! Tap anywhere on the PDF page to place your signature.');
  });
}

// Export Current Page as PNG Image
function exportCurrentPageAsPng() {
  const activePageContainer = elements.pagesWrapper.querySelector(`[data-page-num="${state.currentPage}"]`);
  if (!activePageContainer) return alert('No active PDF page to export.');

  const canvas = activePageContainer.querySelector('canvas');
  if (!canvas) return alert('Page canvas not ready.');

  const imageUri = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${state.fileName.replace(/\.pdf$/i, '')}_Page_${state.currentPage}.png`;
  link.href = imageUri;
  link.click();
}

// Save PDF with Annotations burned into PDF bytes using pdf-lib
async function savePdfDocument() {
  if (!state.pdfBytes) return;

  try {
    const pdfDoc = await PDFDocument.load(state.pdfBytes.slice(0), { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < state.pageOrder.length; i++) {
      const origPageNum = state.pageOrder[i];
      const displayPageNum = i + 1;
      const annots = state.annotations[displayPageNum] || [];
      const page = pdfDoc.getPage(origPageNum - 1);
      const { height } = page.getSize();

      for (const annot of annots) {
        if (annot.type === 'text') {
          page.drawText(annot.text, {
            x: annot.x / state.scale,
            y: height - (annot.y / state.scale) - 15,
            size: annot.size / state.scale,
            font,
            color: hexToRgb(annot.color),
          });
        } else if (annot.type === 'stamp') {
          page.drawRectangle({
            x: annot.x / state.scale,
            y: height - (annot.y / state.scale) - (annot.height / state.scale),
            width: annot.width / state.scale,
            height: annot.height / state.scale,
            borderColor: annot.text === 'APPROVED' ? rgb(0.1, 0.7, 0.4) : rgb(0.9, 0.2, 0.2),
            borderWidth: 2,
            color: rgb(0.95, 0.98, 0.95),
          });
          page.drawText(annot.text, {
            x: (annot.x + 10) / state.scale,
            y: height - (annot.y / state.scale) - 24,
            size: 12,
            font,
            color: annot.text === 'APPROVED' ? rgb(0.1, 0.7, 0.4) : rgb(0.9, 0.2, 0.2),
          });
        } else if (annot.type === 'signature' && annot.imgData) {
          const pngImage = await pdfDoc.embedPng(annot.imgData);
          page.drawImage(pngImage, {
            x: annot.x / state.scale,
            y: height - (annot.y / state.scale) - (annot.height / state.scale),
            width: annot.width / state.scale,
            height: annot.height / state.scale,
          });
        }
      }
    }

    const modifiedBytes = await pdfDoc.save();
    
    const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Saved_${state.fileName}`;
    link.click();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

  } catch (err) {
    console.error('Error saving PDF:', err);
    alert('Failed to save PDF: ' + err.message);
  }
}

// Convert Hex Color to pdf-lib rgb()
function hexToRgb(hex) {
  if (!hex) return rgb(0, 0, 0);
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// Open Page Manager Modal
function openPageManagerModal() {
  elements.pageMgrGrid.innerHTML = '';

  for (let i = 0; i < state.pageOrder.length; i++) {
    const displayPageNum = i + 1;
    const origPageNum = state.pageOrder[i];

    const card = document.createElement('div');
    card.className = 'p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col items-center gap-2 relative group';

    const numSpan = document.createElement('span');
    numSpan.className = 'text-xs font-bold text-neutral-300';
    numSpan.textContent = `Page ${displayPageNum}`;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'flex gap-1 mt-1';
    
    const rotateBtn = document.createElement('button');
    rotateBtn.className = 'px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-white min-h-[32px]';
    rotateBtn.textContent = '↻ 90°';
    rotateBtn.addEventListener('click', () => {
      state.pageRotations[origPageNum] = ((state.pageRotations[origPageNum] || 0) + 90) % 360;
      renderAllPages();
      openPageManagerModal();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'px-2.5 py-1.5 bg-red-950 hover:bg-red-800 text-xs rounded text-red-300 min-h-[32px]';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => {
      state.pageOrder.splice(i, 1);
      openPageManagerModal();
    });

    btnGroup.appendChild(rotateBtn);
    btnGroup.appendChild(deleteBtn);

    card.appendChild(numSpan);
    card.appendChild(btnGroup);
    elements.pageMgrGrid.appendChild(card);
  }

  elements.modalPageMgr.classList.remove('hidden');
}

// Setup Watermark Modal
function setupWatermarkModal() {
  elements.btnApplyWatermark.addEventListener('click', async () => {
    const wmTextVal = elements.wmText.value.trim() || 'CONFIDENTIAL';
    const wmSizeVal = parseInt(elements.wmSize.value) || 48;
    const wmOpacityVal = (parseInt(elements.wmOpacity.value) || 25) / 100;

    if (!state.pdfBytes) return alert('No PDF opened.');

    try {
      const pdfDoc = await PDFDocument.load(state.pdfBytes.slice(0), { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(wmTextVal, {
          x: width / 4,
          y: height / 2,
          size: wmSizeVal,
          font,
          color: rgb(0.8, 0.2, 0.2),
          opacity: wmOpacityVal,
          rotate: degrees(45),
        });
      });

      const modifiedBytes = await pdfDoc.save();
      elements.modalWatermark.classList.add('hidden');
      await loadPdfFromBytes(modifiedBytes, `Watermarked_${state.fileName}`);
    } catch (err) {
      alert('Watermark error: ' + err.message);
    }
  });
}

// Setup PDF Merge Modal
function setupMergeModal() {
  elements.btnSelectMergeFiles.addEventListener('click', () => {
    elements.mergeFilesInput.value = '';
    elements.mergeFilesInput.click();
  });

  elements.mergeFilesInput.addEventListener('change', (e) => {
    state.mergeSelectedFiles = Array.from(e.target.files);
    elements.mergeFilesList.innerHTML = '';

    if (state.mergeSelectedFiles.length === 0) {
      elements.mergeFilesList.innerHTML = '<li class="text-neutral-500 text-center py-2">No files selected</li>';
      return;
    }

    state.mergeSelectedFiles.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800 text-xs';
      li.innerHTML = `<span class="truncate font-medium text-white">${index + 1}. ${file.name}</span><span class="text-neutral-500 text-[10px]">${(file.size / 1024).toFixed(1)} KB</span>`;
      elements.mergeFilesList.appendChild(li);
    });
  });

  elements.btnRunMerge.addEventListener('click', async () => {
    if (state.mergeSelectedFiles.length < 2) {
      return alert('Please select at least 2 PDF files to merge.');
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of state.mergeSelectedFiles) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      elements.modalMerge.classList.add('hidden');
      await loadPdfFromBytes(mergedBytes, 'Merged_Document.pdf');
    } catch (err) {
      alert('Failed to merge PDFs: ' + err.message);
    }
  });
}

// Setup Event Listeners
function setupEventListeners() {
  setupWatermarkModal();
  setupMergeModal();

  // File Open Buttons
  elements.btnOpenFile.addEventListener('click', () => {
    elements.fileInput.value = '';
    elements.fileInput.click();
  });
  elements.dropOpenBtn.addEventListener('click', () => {
    elements.fileInput.value = '';
    elements.fileInput.click();
  });
  elements.menuOpen.addEventListener('click', () => {
    elements.fileInput.value = '';
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const buffer = await file.arrayBuffer();
      await loadPdfFromBytes(buffer, file.name);
    }
  });

  // Demo Buttons
  elements.dropDemoBtn.addEventListener('click', loadDemoPdf);
  elements.menuOpenDemo.addEventListener('click', loadDemoPdf);

  // Save & Export
  elements.btnSavePdf.addEventListener('click', savePdfDocument);
  elements.menuSave.addEventListener('click', savePdfDocument);
  elements.menuExportPng.addEventListener('click', exportCurrentPageAsPng);
  elements.menuPrint.addEventListener('click', () => window.print());

  // Merge & Watermark Modals
  elements.menuMerge.addEventListener('click', () => elements.modalMerge.classList.remove('hidden'));
  elements.toolMerge.addEventListener('click', () => elements.modalMerge.classList.remove('hidden'));
  elements.menuToolWatermark.addEventListener('click', () => elements.modalWatermark.classList.remove('hidden'));
  elements.menuToolStamp.addEventListener('click', () => setActiveTool('stamp'));

  // Navigation
  elements.btnPrevPage.addEventListener('click', () => {
    if (state.currentPage > 1) scrollToPage(state.currentPage - 1);
  });
  elements.btnNextPage.addEventListener('click', () => {
    if (state.currentPage < state.numPages) scrollToPage(state.currentPage + 1);
  });
  elements.pageNumInput.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    if (val >= 1 && val <= state.numPages) scrollToPage(val);
  });

  // Zoom & View Options
  elements.btnZoomIn.addEventListener('click', () => {
    state.scale += 0.15;
    elements.zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
    renderAllPages();
  });
  elements.menuZoomIn.addEventListener('click', () => {
    state.scale += 0.15;
    elements.zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
    renderAllPages();
  });

  elements.btnZoomOut.addEventListener('click', () => {
    if (state.scale > 0.3) {
      state.scale -= 0.15;
      elements.zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
      renderAllPages();
    }
  });
  elements.menuZoomOut.addEventListener('click', () => {
    if (state.scale > 0.3) {
      state.scale -= 0.15;
      elements.zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
      renderAllPages();
    }
  });

  elements.menuFitWidth.addEventListener('click', () => {
    const containerWidth = elements.pdfContainer.clientWidth - 40;
    state.scale = Math.min(1.8, Math.max(0.4, containerWidth / 600));
    elements.zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
    renderAllPages();
  });

  elements.menuFitPage.addEventListener('click', () => {
    state.scale = 0.9;
    elements.zoomLevel.textContent = `90%`;
    renderAllPages();
  });

  elements.menuRotateCw.addEventListener('click', () => {
    state.rotation = (state.rotation + 90) % 360;
    renderAllPages();
  });

  elements.menuRotateCcw.addEventListener('click', () => {
    state.rotation = (state.rotation + 270) % 360;
    renderAllPages();
  });

  // Edit Menu Options
  elements.menuUndo.addEventListener('click', () => {
    const currAnnots = state.annotations[state.currentPage];
    if (currAnnots && currAnnots.length > 0) {
      currAnnots.pop();
      renderAllPages();
      updateAnnotationsList();
    }
  });

  elements.menuClearAnnots.addEventListener('click', () => {
    if (confirm('Clear all annotations on this document?')) {
      state.annotations = {};
      renderAllPages();
      updateAnnotationsList();
    }
  });

  // Desktop Tools
  elements.toolHand.addEventListener('click', () => setActiveTool('hand'));
  elements.toolSelect.addEventListener('click', () => setActiveTool('select'));
  elements.toolHighlight.addEventListener('click', () => setActiveTool('highlight'));
  elements.toolDraw.addEventListener('click', () => setActiveTool('draw'));
  elements.toolText.addEventListener('click', () => setActiveTool('text'));
  elements.toolShape.addEventListener('click', () => setActiveTool('shape'));
  elements.toolStamp.addEventListener('click', () => setActiveTool('stamp'));
  elements.toolPageMgr.addEventListener('click', openPageManagerModal);
  elements.menuToolPageMgr.addEventListener('click', openPageManagerModal);

  // Mobile Bottom Dock Tools
  if (elements.mToolHand) elements.mToolHand.addEventListener('click', () => setActiveTool('hand'));
  if (elements.mToolSelect) elements.mToolSelect.addEventListener('click', () => setActiveTool('select'));
  if (elements.mToolText) elements.mToolText.addEventListener('click', () => setActiveTool('text'));
  if (elements.mToolHighlight) elements.mToolHighlight.addEventListener('click', () => setActiveTool('highlight'));
  if (elements.mToolDraw) elements.mToolDraw.addEventListener('click', () => setActiveTool('draw'));
  if (elements.mToolStamp) elements.mToolStamp.addEventListener('click', () => setActiveTool('stamp'));

  // Sidebar Toggles
  elements.toggleLeftSidebar.addEventListener('click', () => {
    elements.leftSidebar.classList.toggle('hidden');
    elements.toggleLeftSidebar.classList.toggle('active');
  });
  elements.toggleInspector.addEventListener('click', () => {
    elements.rightInspector.classList.toggle('hidden');
    elements.toggleInspector.classList.toggle('active');
  });

  // Sidebar Tabs
  const tabThumbs = document.getElementById('tab-thumbs');
  const tabAnnots = document.getElementById('tab-annots');
  const tabOutline = document.getElementById('tab-outline');
  const panelThumbs = document.getElementById('panel-thumbs');
  const panelAnnots = document.getElementById('panel-annots');
  const panelOutline = document.getElementById('panel-outline');

  tabThumbs.addEventListener('click', () => {
    tabThumbs.classList.add('active');
    tabAnnots.classList.remove('active');
    tabOutline.classList.remove('active');
    panelThumbs.classList.remove('hidden');
    panelAnnots.classList.add('hidden');
    panelOutline.classList.add('hidden');
  });

  tabAnnots.addEventListener('click', () => {
    tabAnnots.classList.add('active');
    tabThumbs.classList.remove('active');
    tabOutline.classList.remove('active');
    panelAnnots.classList.remove('hidden');
    panelThumbs.classList.add('hidden');
    panelOutline.classList.add('hidden');
  });

  tabOutline.addEventListener('click', () => {
    tabOutline.classList.add('active');
    tabThumbs.classList.remove('active');
    tabAnnots.classList.remove('active');
    panelOutline.classList.remove('hidden');
    panelThumbs.classList.add('hidden');
    panelAnnots.classList.add('hidden');
  });

  // Property Inspector Changes
  elements.propColor.addEventListener('input', (e) => {
    state.color = e.target.value;
    if (state.selectedAnnot && state.selectedAnnot.type === 'text') {
      state.selectedAnnot.color = e.target.value;
      renderAllPages();
    }
  });

  document.querySelectorAll('.color-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.color = btn.dataset.color;
      elements.propColor.value = state.color;
      if (state.selectedAnnot && state.selectedAnnot.type === 'text') {
        state.selectedAnnot.color = state.color;
        renderAllPages();
      }
    });
  });

  elements.propSize.addEventListener('input', (e) => {
    state.size = parseInt(e.target.value);
    elements.propSizeVal.textContent = `${state.size}px`;
    if (state.selectedAnnot && state.selectedAnnot.type === 'text') {
      state.selectedAnnot.size = Math.max(14, state.size * 3);
      renderAllPages();
    }
  });

  elements.propOpacity.addEventListener('input', (e) => {
    state.opacity = parseInt(e.target.value) / 100;
    elements.propOpacityVal.textContent = `${e.target.value}%`;
  });

  document.querySelectorAll('.stamp-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeStampText = btn.dataset.stamp;
      state.signatureImgData = null;
      setActiveTool('stamp');
    });
  });

  // Page Manager Modal Apply
  elements.btnPageMgrApply.addEventListener('click', () => {
    elements.modalPageMgr.classList.add('hidden');
    renderAllPages();
    renderThumbnails();
  });

  // Close modals
  document.querySelectorAll('.modal-close-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.modalPageMgr.classList.add('hidden');
      elements.modalWatermark.classList.add('hidden');
      elements.modalMerge.classList.add('hidden');
    });
  });

  // Shortcuts Modal
  elements.menuShortcuts.addEventListener('click', () => {
    alert(`Acrobat Linux Keyboard Shortcuts:
- Ctrl + O: Open PDF file
- Ctrl + S: Save PDF
- Ctrl + / -: Zoom In / Zoom Out
- H: Hand tool (Pan)
- V: Select tool (Drag/Move elements)
- T: Write Text Anywhere (Click & Type)
- P: Freehand Pen
- Delete: Remove selected text/element`);
  });

  elements.menuAbout.addEventListener('click', () => {
    alert(`Acrobat Linux Edition
Version 1.0.0 (Fedora / iPad / Mobile Ready)
Built with WebAssembly, PDF.js, and PDF-Lib.`);
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      elements.fileInput.value = '';
      elements.fileInput.click();
    } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      savePdfDocument();
    } else if (e.key.toLowerCase() === 'h') {
      setActiveTool('hand');
    } else if (e.key.toLowerCase() === 'v') {
      setActiveTool('select');
    } else if (e.key.toLowerCase() === 'p') {
      setActiveTool('draw');
    } else if (e.key.toLowerCase() === 't') {
      setActiveTool('text');
    } else if (e.key === 'Delete' && state.selectedAnnot) {
      Object.keys(state.annotations).forEach((p) => {
        state.annotations[p] = state.annotations[p].filter((a) => a !== state.selectedAnnot);
      });
      state.selectedAnnot = null;
      renderAllPages();
      updateAnnotationsList();
    }
  });
}

// Start application when DOM ready
document.addEventListener('DOMContentLoaded', init);
