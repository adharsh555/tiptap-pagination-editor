# LegalDraft Pro: Tiptap Pagination Editor
*Submission for OpenSphere Full-Stack Intern Assignment*

## Overview
LegalDraft Pro is a specialized Tiptap-based editor designed for the immigration law workflow. It solves the "content measurement" challenge by implementing real-time pagination with exact US Letter (8.5" x 11") parity, ensuring that what the user drafts is exactly what will be printed for USCIS submissions.

## Live Demo & Repository
- **Live Demo**: [https://tiptap-pagination-editor-alpha.vercel.app/](https://tiptap-pagination-editor-alpha.vercel.app/)
- **GitHub Repository**: [adharsh555/tiptap-pagination-editor](https://github.com/adharsh555/tiptap-pagination-editor)

---

## Technical Approach: How Pagination Works

### 1. The Measurement Engine
Pagination in rich text is difficult because DOM nodes don't have a fixed "page" concept. My approach uses a custom **Tiptap Extension** that taps into the `view.update` hook:
- **Node-Level Measurement**: The extension iterates through the editor's rendered DOM content.
- **DPI-Aware Calculation**: It calculates the cumulative height of block nodes (paragraphs, headings, lists) against a baseline of **1056px** (11 inches at 96 DPI).
- **Slack-Based Decorations**: When the content exceeds the Drawable Height (9 inches of content + 2 inches of margins), it calculates the "slack" (empty space left on the page).

### 2. High-Fidelity Page Breaks
Unlike simple dividers, LegalDraft Pro uses a **Widget Decoration** strategy:
- It inserts a dynamic-height decoration that accounts for: **[Slack] + [Bottom Margin] + [Workspace Gap] + [Top Margin]**.
- This ensures that the distance from the top of Page 1 to the top of Page 2 is **exactly 1088px** (11 inches + 32px workspace gap), matching the vertical rhythm of Google Docs.

### 3. Print Parity
I used **CSS Paged Media** rules (`@media print`) and strict `box-sizing: border-box` styling to ensure that the 1-inch margins in the editor translate perfectly to the binary PDF output.

---

## Trade-offs and Limitations

- **Block-Level Splitting**: Currently, page breaks occur *between* Tiptap nodes. If a single paragraph is longer than 11 inches, it will not be split mid-paragraph in this version. 
- **Performance**: Recalculating heights on every change is efficient for 5-10 page documents, but for a 100-page petition, this would transition to an Intersection Observer or "Windowing" approach to maintain 60fps.
- **DPI Reliance**: The 96dpi assumption is standard for most browsers but can vary with OS-level scaling. Future iterations would use a hidden "ruler" element to calibrate DPI dynamically.

---

## Improvements with More Time
1. **Paragraph/Row Splitting**: Implementing a logic to split multi-line paragraphs across pages using `line-height` math.
2. **Table Pagination**: Handling page breaks inside table rows (repeating headers).
3. **Dynamic Headers/Footers**: Allowing users to double-click the top/bottom margins to edit recurring document headers.
4. **Offline Persistence**: Using IndexDB/Supabase for robust local-first drafting.

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
