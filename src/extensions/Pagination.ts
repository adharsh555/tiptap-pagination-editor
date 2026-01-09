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
                            // Only update if content or selection changed significantly
                            if (view.state.doc.eq(prevState.doc) && view.state.selection.eq(prevState.selection)) {
                                return;
                            }

                            const decorations: Decoration[] = [];
                            const editorDom = view.dom;
                            const children = Array.from(editorDom.children);

                            let currentHeight = 0;
                            let nextPageNumber = 1;

                            children.forEach((child) => {
                                if (child.classList.contains('page-break-decoration')) return;

                                const rect = child.getBoundingClientRect();
                                const style = window.getComputedStyle(child);
                                const marginTop = parseFloat(style.marginTop);
                                const marginBottom = parseFloat(style.marginBottom);

                                // Total height this node occupies in the flow
                                const nodeHeight = rect.height + marginTop + marginBottom;

                                if (currentHeight + nodeHeight > pageHeight) {
                                    const pos = view.posAtDOM(child, 0);

                                    // Calculate "Slack": How much empty space is left in the 9" area
                                    const slack = pageHeight - currentHeight;

                                    // The decoration height must cover:
                                    // 1. Slack (to reach the end of the drawable 9")
                                    // 2. Bottom margin of current page (1")
                                    // 3. Workspace gap
                                    // 4. Top margin of next page (1")
                                    const decorationHeight = slack + margin + gap + margin;

                                    nextPageNumber++;

                                    decorations.push(
                                        Decoration.widget(pos, () => {
                                            const container = document.createElement('div');
                                            container.className = 'page-break-decoration';
                                            container.style.height = `${decorationHeight}px`;

                                            const line = document.createElement('div');
                                            line.className = 'page-break-line';

                                            const label = document.createElement('div');
                                            label.className = 'page-break-label';
                                            label.innerText = `PAGE ${nextPageNumber}`;

                                            container.appendChild(line);
                                            container.appendChild(label);
                                            return container;
                                        }, {
                                            side: -1,
                                            key: `page-break-${pos}`
                                        })
                                    );

                                    // Reset height for the new page starting with this node
                                    currentHeight = nodeHeight;
                                } else {
                                    currentHeight += nodeHeight;
                                }
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
