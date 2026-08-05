import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function createSamplePdfBytes() {
  const pdfDoc = await PDFDocument.create();
  
  // Page 1: Welcome & Overview
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Title Banner
  page1.drawRectangle({
    x: 0,
    y: 760,
    width: 595.28,
    height: 81.89,
    color: rgb(0.9, 0.15, 0.16),
  });

  page1.drawText('Adobe Acrobat Clone for Linux', {
    x: 40,
    y: 800,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText('Fedora, Ubuntu, Arch & Cross-Platform Desktop Edition', {
    x: 40,
    y: 775,
    size: 11,
    font: fontRegular,
    color: rgb(0.95, 0.95, 0.95),
  });

  // Body content
  let y = 720;
  
  page1.drawText('1. Executive Overview', {
    x: 40,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  y -= 25;
  const descText = [
    'Welcome to the native-style Adobe Acrobat suite built for Fedora Linux and Unix systems.',
    'This application provides high-performance rendering, document markup, digital signatures,',
    'form filling, page organization, and PDF transformation tools.',
  ];

  descText.forEach((line) => {
    page1.drawText(line, {
      x: 40,
      y,
      size: 10.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.35),
    });
    y -= 16;
  });

  y -= 15;
  page1.drawText('2. Key Features Supported', {
    x: 40,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  y -= 20;
  const features = [
    '• Annotation & Markup: Highlight, Underline, Freehand Drawing, Text Annotations',
    '• Digital Stamps & Signatures: Preset Stamps (APPROVED, DRAFT) & Draw Signature',
    '• Page Organization: Reorder, Rotate, Delete, and Extract Pages',
    '• Document Merging & Splitting: Combine multiple PDFs seamlessly',
    '• Watermarking: Add custom text watermarks with transparency',
    '• High-DPI Canvas Rendering: Powered by Mozilla PDF.js engine',
  ];

  features.forEach((feat) => {
    page1.drawText(feat, {
      x: 50,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.25),
    });
    y -= 18;
  });

  // Feature Card Box
  y -= 15;
  page1.drawRectangle({
    x: 40,
    y: y - 80,
    width: 515.28,
    height: 80,
    color: rgb(0.95, 0.96, 0.98),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });

  page1.drawText('System Information & Compatibility', {
    x: 55,
    y: y - 22,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.3, 0.6),
  });

  page1.drawText('OS: Fedora / Ubuntu / Linux Mint / Arch Linux / Debian', {
    x: 55,
    y: y - 42,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.4),
  });

  page1.drawText('Engine: PDF.js + PDF-Lib Native WebAssembly Canvas Architecture', {
    x: 55,
    y: y - 58,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.4),
  });

  // Footer
  page1.drawText('Page 1 of 2 — Acrobat Linux Professional', {
    x: 200,
    y: 30,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });


  // Page 2: Sample Form & Test Signature Area
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  
  page2.drawText('Interactive Sign-Off & Approval Form', {
    x: 40,
    y: 800,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  page2.drawText('Try adding stamps, highlight text, or drawing your signature on this page!', {
    x: 40,
    y: 778,
    size: 11,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.45),
  });

  // Table Structure
  y = 740;
  page2.drawRectangle({
    x: 40,
    y: y - 180,
    width: 515.28,
    height: 180,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.9),
    borderWidth: 1,
  });

  const tableRows = [
    ['Document ID:', 'ACRO-LNX-2026-0805'],
    ['Author:', 'Antigravity DeepMind Team'],
    ['Target Platform:', 'Fedora Workstation & Enterprise Linux'],
    ['Security Level:', 'Standard Internal Review'],
    ['Approval Status:', 'Pending Digital Signature'],
  ];

  let tableY = y - 30;
  tableRows.forEach(([label, value]) => {
    page2.drawText(label, {
      x: 55,
      y: tableY,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.25),
    });
    page2.drawText(value, {
      x: 180,
      y: tableY,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.35),
    });
    tableY -= 32;
  });

  // Signature Box
  y = 480;
  page2.drawRectangle({
    x: 40,
    y: y - 120,
    width: 250,
    height: 120,
    color: rgb(0.98, 0.98, 1),
    borderColor: rgb(0.7, 0.8, 0.95),
    borderWidth: 1.5,
  });

  page2.drawText('AUTHORIZED SIGNATURE', {
    x: 50,
    y: y - 25,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.35, 0.7),
  });

  page2.drawLine({
    start: { x: 50, y: y - 90 },
    end: { x: 270, y: y - 90 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.75),
  });

  page2.drawText('Sign here or place stamp', {
    x: 95,
    y: y - 105,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  // Notes Box
  page2.drawRectangle({
    x: 305,
    y: y - 120,
    width: 250,
    height: 120,
    color: rgb(0.99, 0.98, 0.94),
    borderColor: rgb(0.9, 0.85, 0.6),
    borderWidth: 1,
  });

  page2.drawText('REVIEWER NOTES & COMMENTS', {
    x: 315,
    y: y - 25,
    size: 10,
    font: fontBold,
    color: rgb(0.6, 0.45, 0.1),
  });

  // Footer Page 2
  page2.drawText('Page 2 of 2 — Acrobat Linux Professional', {
    x: 200,
    y: 30,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}
