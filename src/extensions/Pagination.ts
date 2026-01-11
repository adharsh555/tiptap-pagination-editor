import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface PaginationOptions {
    usablePageHeight: number; // 9 inches = 864px
    totalPageHeight: number;  // 11 inches = 1056px
    margin: number;           // 1 inch = 96px
    gap: number;              // 40px
}

const paginationPluginKey = new PluginKey('pagination');

/**
 * Syncs the visual "Page Masks" (borders) with the content height.
 */
function syncPageMasks(pageCount: number) {
    const layer = document.getElementById('page-mask-layer');
    if (!layer) return;

    if (layer.childElementCount === pageCount) return;

    layer.innerHTML = '';

    for (let i = 0; i < pageCount; i++) {
        const mask = document.createElement('div');
        mask.className = 'page-mask';
        layer.appendChild(mask);
    }
}

/**
 * Sequential Flow Pagination Extension:
 * Flows content into fixed-size pages without clipping or data loss.
 * Now with Line-Aware Splitting to prevent sliced words/lines.
 */
export const Pagination = Extension.create<PaginationOptions>({
    name: 'pagination',

    addOptions() {
        return {
            usablePageHeight: 864,
            totalPageHeight: 1056,
            margin: 96,
            gap: 40,
        };
    },

    addProseMirrorPlugins() {
        const { usablePageHeight, margin, gap } = this.options;

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
                            if (view.state.doc.eq(prevState.doc) && view.state.selection.eq(prevState.selection)) {
                                return;
                            }

                            const decorations: Decoration[] = [];

                            let currentHeightOnPage = 0;
                            let totalPagesCount = 1;

                            view.state.doc.descendants((node, pos) => {
                                if (!node.isBlock) return false;

                                try {
                                    const nodeDom = view.nodeDOM(pos) as HTMLElement;
                                    if (!nodeDom) return false;

                                    const styles = window.getComputedStyle(nodeDom);
                                    const marginTop = parseFloat(styles.marginTop) || 0;
                                    const marginBottom = parseFloat(styles.marginBottom) || 0;

                                    const nodeRect = nodeDom.getBoundingClientRect();
                                    const totalNodeVisualHeight = nodeRect.height + marginTop + marginBottom;

                                    let startCoords;
                                    try {
                                        startCoords = view.coordsAtPos(pos + 1);
                                    } catch (e) {
                                        return false;
                                    }

                                    // Overflow Detection
                                    if (currentHeightOnPage + totalNodeVisualHeight > usablePageHeight + 1) {

                                        let spaceRemainingOnPage = usablePageHeight - currentHeightOnPage;
                                        if (spaceRemainingOnPage < 0) spaceRemainingOnPage = 0;

                                        // Binary search for the first character that overflows the usable area
                                        let low = pos + 1;
                                        let high = pos + node.nodeSize - 1;
                                        let overflowPos = -1;

                                        while (low <= high) {
                                            const mid = Math.floor((low + high) / 2);
                                            let midCoords;
                                            try {
                                                midCoords = view.coordsAtPos(mid);
                                            } catch (e) {
                                                break;
                                            }

                                            // Use BOTTOM to ensure the entire line fits
                                            const midRelativeY = midCoords.bottom - startCoords.top + marginTop;

                                            if (midRelativeY > spaceRemainingOnPage + 1) {
                                                overflowPos = mid;
                                                high = mid - 1;
                                            } else {
                                                low = mid + 1;
                                            }
                                        }

                                        let splitPos = -1;
                                        if (overflowPos !== -1) {
                                            // LINE-AWARE BACKTRACKING:
                                            // Find the start of the line that overflowed.
                                            let lineStartPos = overflowPos;
                                            const targetTop = view.coordsAtPos(overflowPos).top;
                                            while (lineStartPos > pos + 1) {
                                                try {
                                                    if (view.coordsAtPos(lineStartPos - 1).top < targetTop - 2) {
                                                        break;
                                                    }
                                                    lineStartPos--;
                                                } catch (e) { break; }
                                            }
                                            splitPos = lineStartPos;
                                        }

                                        if (splitPos !== -1 && splitPos > pos + 1 && splitPos < pos + node.nodeSize - 1) {
                                            // SPLIT: Part of the node fits.
                                            let splitVisualBottom;
                                            try {
                                                // The splitting point's "visual bottom" is actually the bottom of the PREVIOUS line.
                                                splitVisualBottom = view.coordsAtPos(splitPos - 1).bottom;
                                            } catch (e) {
                                                splitVisualBottom = startCoords.top + spaceRemainingOnPage;
                                            }

                                            const actualVisualHeightOfFittingPart = splitVisualBottom - startCoords.top + marginTop;
                                            const emptySpaceAfterSplit = usablePageHeight - (currentHeightOnPage + actualVisualHeightOfFittingPart);

                                            const spacerHeight = emptySpaceAfterSplit + (margin * 2) + gap;

                                            decorations.push(
                                                Decoration.widget(splitPos, () => {
                                                    const container = document.createElement('div');
                                                    container.className = 'page-break-decoration';
                                                    container.style.height = `${spacerHeight}px`;
                                                    container.style.width = '100%';
                                                    container.style.pointerEvents = 'none';
                                                    return container;
                                                }, { side: 1, key: `split-${splitPos}` })
                                            );

                                            totalPagesCount++;
                                            currentHeightOnPage = totalNodeVisualHeight - actualVisualHeightOfFittingPart;
                                        } else {
                                            // PUSH: Whole node moves to next page
                                            const spacerHeight = spaceRemainingOnPage + (margin * 2) + gap;
                                            decorations.push(
                                                Decoration.widget(pos, () => {
                                                    const container = document.createElement('div');
                                                    container.className = 'page-break-decoration';
                                                    container.style.height = `${spacerHeight}px`;
                                                    container.style.width = '100%';
                                                    container.style.pointerEvents = 'none';
                                                    return container;
                                                }, { side: -1, key: `push-${pos}` })
                                            );
                                            totalPagesCount++;
                                            currentHeightOnPage = totalNodeVisualHeight;
                                        }
                                    } else {
                                        currentHeightOnPage += totalNodeVisualHeight;
                                    }
                                } catch (e) {
                                    // ignore instability
                                }

                                return false; // Handled
                            });

                            // 2. Sync Masks
                            queueMicrotask(() => syncPageMasks(totalPagesCount));

                            // 3. Dispatch
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
