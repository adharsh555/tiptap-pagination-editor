# Tiptap Pagination Editor (Legal Edition)

A professional, Tiptap-based document editor with real-time pagination, specifically designed for legal professionals (e.g., immigration cover letters and petitions).

## Features

- **Real-time Pagination**: Content automatically flows across pages as you type, with visual US Letter (8.5" x 11") boundaries.
- **Formal Legal Aesthetic**: Serif typography (Playfair Display), justified text, and a high-contrast integrated header.
- **Template Selection System**: An info-icon dropdown providing instant structures for I-140 Cover Letters, Support Letters, and more.
- **Optional Auto-Save**: Toggle between automatic saving and manual control for intentional document persistence.
- **US Letter Proportions**: 1-inch margins and standard 12pt equivalent font size.
- **Integrated Header Toolbar**: Professional branding with document naming and high-visibility utility tools (New/Clear/Export).
- **Print Perfection**: CSS-paged media logic ensures that the "Print to PDF" output matches the editor's visual page breaks.

## Live Demo & Repository

- **Live Demo**: [View Live Editor](https://tiptap-pagination-editor.vercel.app) *(Replace with your final Vercel URL)*
- **GitHub Repository**: [adharsh555/tiptap-pagination-editor](https://github.com/adharsh555/tiptap-pagination-editor)

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

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technical Approach

### 1. Dynamic Page Calculations
The core pagination logic is implemented as a custom Tiptap extension. It uses the `view.update` hook to monitor changes in the document. 
- It iterates through the rendered DOM children of the editor.
- Measures the height of each block-level element (paragraphs, headings, lists).
- When the cumulative height exceeds the target page height (calculated based on US Letter 11" at screen DPI), it inserts a **Widget Decoration** at that position.
- This decoration visually separates the content without breaking the underlying ProseMirror document structure.

### 2. Trade-offs and Limitations
- **Paragraph Splitting**: Currently, page breaks occur *between* block-level nodes. If a single paragraph is extremely long (longer than a page), it won't be split mid-paragraph in this prototype. Solving this would require more complex line-height measurement or `nodeViews`.
- **DPI Variances**: Browser scaling and DPI can slightly affect height measurements. The `pageHeight` constant is tuned for standard 96 DPI.

### 3. Future Improvements
- **Multi-line Paragraph Splitting**: Use line-level measurement to split paragraphs across pages.
- **Table Handling**: Implement logic to handle page breaks within large tables, ensuring headers repeat correctly.
- **Section Headers/Footers**: Add dedicated support for dynamic recurring headers and page numbering (e.g., "Page X of Y").
- **Offline Proofing**: Integration with spellcheckers tailored for legal terminology.

## Deployment & Storage

This application is ready for production. It is optimized for deployment to **Vercel**, which provides the best experience for Next.js applications. For persistent storage, we recommend integrating **Supabase** or **Vercel Postgres**.

### Quick Deploy Tip
1. Push this code to GitHub.
2. Connect the repo to Vercel.
3. Your professional legal editor will be live in minutes!


