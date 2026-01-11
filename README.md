# LegalDraft Pro: Tiptap Pagination Editor
*Submission for OpenSphere Full-Stack Intern Assignment*

## 🚀 Deliverables
- **Live Demo**: [https://tiptap-pagination-editor-alpha.vercel.app/](https://tiptap-pagination-editor-alpha.vercel.app/)
- **GitHub Repository**: [adharsh555/tiptap-pagination-editor](https://github.com/adharsh555/tiptap-pagination-editor)

## 📋 Overview
LegalDraft Pro is a specialized Tiptap-based editor designed for the immigration law workflow. It implements a **Sequential Flow Layout Engine** that provides real-time pagination with exact US Letter (8.5" x 11") parity. This ensures that what the user drafts—critical for USCIS submissions—is exactly what will be printed.

---

## 🧠 Technical Approach: How Pagination Works

Calculating page breaks in a web-based rich text editor is non-trivial because the DOM is naturally a "lone scroll." My approach simulates a true word-processor layout engine.

### 1. Sequential Measurement Engine
The editor processes the document as a continuous sequence of block nodes.
- **Visual Height Accumulation**: It uses `getBoundingClientRect()` and `getComputedStyle()` to capture the real visual height of every paragraph and heading, including variable line-heights and margins.
- **Usable Content Tracking**: Content is measured against a **1056px** (11") vertical stride, with a **864px** (9") content area limit to respect the 1-inch top/bottom margins.

### 2. Line-Aware Backtracking (The "Surgical Split")
To prevent the "horizontal clipping" (where a line is cut in half horizontally), I implemented a backtracking logic:
- **Detection**: The engine identifies the exact character that initiates an overflow.
- **Backtrack**: It then scans backward until it finds the start of that specific line (detecting the point where the `y-coordinate` changes).
- **Atomic Move**: The entire line is moved to the next page using a dynamic **Widget Decoration**, ensuring characters are never sliced and the visual transition is seamless.

---

## ⚖️ Trade-offs and Limitations

1. **Measurement Overhead**: Recalculating the height of all blocks on every update is highly accurate but computationally expensive for very long documents (50+ pages). In a production environment, I would move to an **Intersection Observer** or **Windowing** approach to only calculate visible pages.
2. **Fixed 96 DPI**: The engine assumes a standard 96 DPI for pixel-to-inch conversion. While standard for web browsers, OS-level scaling can occasionally cause sub-pixel desync.
3. **Atomic Blocks**: Certain complex blocks like tables are currently treated as atomic. If a table row is larger than a page, it requires more complex nested row-splitting logic.

---

## 🚀 Future Improvements

1. **Dynamic Headers/Footers**: Adding support for recurring text at the top and bottom of every page.
2. **Page Numbering**: Automated `Page X of Y` rendering in the footer area.
3. **Table Row Splitting**: Implementing logic to split table rows across pages while repeating header rows.
4. **Performance Optimization**: Moving the layout calculation to a Web Worker to keep the main thread 100% responsive during massive content reflows.

---

## 🛠️ Getting Started

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
