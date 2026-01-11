# LegalDraft Pro: Tiptap Pagination Editor
*Submission for OpenSphere Full-Stack Intern Assignment*

## Overview
LegalDraft Pro is a specialized Tiptap-based editor designed for the immigration law workflow. It implements a **Sequential Flow Layout Engine** that provides real-time pagination with exact US Letter (8.5" x 11") parity. This ensures that what the user drafts—critical for USCIS submissions—is exactly what will be printed, with zero data loss or visual clipping.

## Live Demo & Repository
- **Live Demo**: [https://tiptap-pagination-editor-alpha.vercel.app/](https://tiptap-pagination-editor-alpha.vercel.app/)
- **GitHub Repository**: [adharsh555/tiptap-pagination-editor](https://github.com/adharsh555/tiptap-pagination-editor)

---

## Technical Architecture: Sequential Flow Layout

LegalDraft Pro moves beyond simple line-count estimation. It implements a true document layout engine.

### 1. Sequential Measurement Engine
The editor processes the document as a continuous sequence of block nodes (paragraphs, headings, lists). 
- **DOM-Reflective Height**: It uses `getBoundingClientRect()` and `getComputedStyle()` to capture the real visual height of content, including variable line heights, margins, and complex formatting.
- **Visual Stride**: Content is tracked against a **1056px** (11") vertical cycle.

### 2. Line-Aware Backtracking (Zero-Clipping Split)
Unlike basic editors that might "slice" a line of text horizontally across two pages, LegalDraft Pro features **Line-Aware Backtracking**:
- **Binary Search Detection**: The engine identifies the exact character that initiates an overflow.
- **Rhythmic Backtrack**: It then scans backward to find the start of that line.
- **Atomic Page Move**: The engine moves the *entire line* to the next page, ensuring that characters are never horizontally sliced and that the visual transition is seamless.

### 3. High-Fidelity Geometry
- **Page Stride**: Each page change results in exactly **1096px** of vertical distance (1056px page + 40px workspace gap).
- **Dynamic Spacers**: The distance is maintained via a dynamic `widget decoration` that bridges the gap between the last fitting line on Page N and the top of Page N+1.

### 4. Print & PDF Parity
The editor achieves 1:1 print parity using strictly controlled CSS variables and `@media print` rules. The 1-inch margins in the editor are mapped directly to physical margins in the PDF output.

---

## Fulfilled Project Scope

As per the project requirements:
- [x] **Visual Page Breaks**: Clear, dynamic separation between US Letter pages.
- [x] **Match Print Output**: Strict 8.5" x 11" geometry with 1" margins for USCIS standards.
- [x] **Standard Formatting**: Full support for Headings, Lists, and Rich Text.
- [x] **Graceful Edge Cases**: 
    - Paragraphs spanning pages are split cleanly between lines.
    - Content reflows instantly during typing or pasting.
- [x] **Enhancements**:
    - **Templates**: Pre-built structures for legal drafting.
    - **Print/PDF**: Clean 1:1 export functionality.
    - **Auto-Save**: Local persistence for document safety.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/adharsh555/tiptap-pagination-editor.git
   cd tiptap-pagination-editor
   ```
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)
