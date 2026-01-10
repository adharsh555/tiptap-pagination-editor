import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface PaginationOptions {
    pageHeight: number; // The drawable content height (e.g., 9 inches @ 96dpi = 864px)
    margin: number;     // 1 inch @ 96dpi = 96px
    gap: number;        // Workspace gap (e.g., 32px)
}

const paginationPluginKey = new PluginKey('pagination');

/**
 * Advanced Pagination: Ensures every page break results in exactly 11" vertical distance
 * from the start of the previous page to the start of the next page.
 */
export const Pagination = Extension.create<PaginationOptions>({
    name: 'pagination',

    addOptions() {
        return {
            pageHeight: 864, // 9 inches of drawable content
            margin: 96,     // 1 inch top/bottom margin
            gap: 32,        // Space between sheets
        };
    },

    addProseMirrorPlugins() {
        const { pageHeight, margin, gap } = this.options;

        return [
            new Plugin({
                key: paginationPluginKey,
                state: {
                    init: () => DecorationSet.empty,
                    apply(tr, value) {
                        const action = tr.getMeta(paginationPluginKey);
                        if (action && action.type === 'SET_DECORATIONS') {
                            return action.decorations;
                        }
                        return value.map(tr.mapping, tr.doc);
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
                view() {
                    return {
                        update(view, prevState) {
                            // Only update if content/selection changes or if it's a layout check
                            if (view.state.doc.eq(prevState.doc) && view.state.selection.eq(prevState.selection)) {
                                // We still need to run if specific layout changes happened, but for now strict check
                                // If layout changes without doc change, we might miss it. 
                                // But usually layout changes due to doc change.
                                return;
                            }

                            const decorations: Decoration[] = [];
                            const editorDom = view.dom;
                            const editorRect = editorDom.getBoundingClientRect();
                            const editorTop = editorRect.top;

                            // Widget Height (Gap + Margins)
                            // This is the visual space we insert between 9" content blocks.
                            const widgetHeight = margin + gap + margin;

                            // We scan down the document. 
                            // targetLine is the visual Y coordinate (relative to editorTop) where the next break should be.
                            // We start at 9" (content height).
                            let targetLine = pageHeight;

                            view.state.doc.descendants((node, pos) => {
                                if (!node.isBlock) return false; // Only check block nodes (paragraphs, headings)

                                // Verify coordinates of this node
                                // We use try-catch because coordsAtPos might fail in edge cases
                                try {
                                    const startCoords = view.coordsAtPos(pos + 1);
                                    let endCoords;
                                    try {
                                        endCoords = view.coordsAtPos(pos + node.nodeSize - 1);
                                    } catch (e) {
                                        endCoords = { top: startCoords.top + 20 }; // Fallback
                                    }

                                    const startY = startCoords.top - editorTop;
                                    const endY = endCoords.top - editorTop; // Use top of last line as approximation of end

                                    // Check if this node crosses our target line(s)
                                    // A node might be huge and cross MULTIPLE target lines.
                                    while (startY < targetLine && endY >= targetLine) {
                                        // Binary Search to find the split point
                                        let low = pos + 1;
                                        let high = pos + node.nodeSize - 1;
                                        let splitPos = -1;

                                        // Optimization: If the node is massive, binary search is efficient.
                                        while (low <= high) {
                                            const mid = Math.floor((low + high) / 2);
                                            const midCoords = view.coordsAtPos(mid);
                                            const midY = midCoords.top - editorTop;

                                            // We compare midY (top of the line at mid) with targetLine.
                                            // If midY >= targetLine, it means this character is on a line that starts AFTER the break.
                                            // So we want to split BEFORE this character.
                                            if (midY >= targetLine) {
                                                splitPos = mid;
                                                high = mid - 1; // Try to find an earlier split point
                                            } else {
                                                low = mid + 1;
                                            }
                                        }

                                        if (splitPos !== -1) {
                                            // We found a split point!
                                            decorations.push(
                                                Decoration.widget(splitPos, () => {
                                                    // 1. The Container (Break out of the editor padding)
                                                    // The editor has 96px padding on left/right. 
                                                    // To span the full 816px width of the "page", we need negative margins.
                                                    const container = document.createElement('div');
                                                    container.className = 'page-break-decoration';
                                                    container.style.height = `${widgetHeight}px`;
                                                    container.style.width = '816px';
                                                    container.style.marginLeft = '-96px'; // Counteract editor padding
                                                    container.style.backgroundColor = 'transparent';
                                                    container.style.clear = 'both';

                                                    // 1. Bottom part of CURRENT page
                                                    // Use z-index to stay above the gap mask (which is z-10)
                                                    const currentTail = document.createElement('div');
                                                    currentTail.style.height = `${margin}px`;
                                                    currentTail.style.backgroundColor = 'white';
                                                    currentTail.style.width = '100%';
                                                    currentTail.style.position = 'relative';
                                                    currentTail.style.zIndex = '20';
                                                    // Directional shadow: Downwards only (positive Y, negative spread)
                                                    // This prevents shadow from showing "up" on the content
                                                    currentTail.style.boxShadow = '0 4px 6px -2px rgba(0,0,0,0.1)';
                                                    currentTail.style.borderBottom = '1px solid #e0e0e0';

                                                    // 2. The Workspace Gap
                                                    // CRITICAL: To make pages look separate ("stand out"), we must MASK the 
                                                    // parent container's side shadows. We do this by making the gap WIDER 
                                                    // than the page (covering the shadows) and same color as workspace.
                                                    const gapArea = document.createElement('div');
                                                    gapArea.style.height = `${gap}px`;
                                                    gapArea.style.backgroundColor = 'var(--workspace-bg, #f0f2f5)';
                                                    gapArea.style.width = 'calc(100% + 100px)'; // Extend out to cover parent shadows
                                                    gapArea.style.marginLeft = '-50px'; // Center the wider block
                                                    gapArea.style.position = 'relative';
                                                    gapArea.style.zIndex = '10'; // Ensure it sits on top of parent shadow

                                                    // 3. Top part of NEXT page
                                                    const nextHead = document.createElement('div');
                                                    nextHead.style.height = `${margin}px`;
                                                    nextHead.style.backgroundColor = 'white';
                                                    nextHead.style.width = '100%';
                                                    nextHead.style.position = 'relative';
                                                    nextHead.style.zIndex = '20';
                                                    // Directional shadow: Upwards only (negative Y, negative spread)
                                                    // This prevents shadow from showing "down" on the content
                                                    nextHead.style.boxShadow = '0 -4px 6px -2px rgba(0,0,0,0.1)';
                                                    nextHead.style.borderTop = '1px solid #e0e0e0';

                                                    container.appendChild(currentTail);
                                                    container.appendChild(gapArea);
                                                    container.appendChild(nextHead);
                                                    return container;
                                                }, {
                                                    side: -1,
                                                    key: `page-break-${splitPos}`
                                                })
                                            );

                                            // Increment targetLine for the next page.
                                            // The content must now travel another 9" (pageHeight).
                                            // PLUS we added a widget of height `widgetHeight`.
                                            // So the next visual target is current `targetLine` + `pageHeight` + `widgetHeight`?
                                            // Yes, because the visual coordinate system expands.
                                            targetLine += (pageHeight + widgetHeight);
                                        } else {
                                            // If we couldn't find a split pos (weird), break loop to avoid infinite
                                            break;
                                        }
                                    }
                                } catch (e) {
                                    // Ignore errors during unstable layout
                                }
                                return false; // Don't descend into block's children
                            });

                            queueMicrotask(() => {
                                if (view.isDestroyed) return;
                                const tr = view.state.tr.setMeta(paginationPluginKey, {
                                    type: 'SET_DECORATIONS',
                                    decorations: DecorationSet.create(view.state.doc, decorations)
                                });
                                view.dispatch(tr);
                            });
                        }
                    };
                },
            }),
        ];
    },
});
