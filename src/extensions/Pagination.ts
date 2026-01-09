import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface PaginationOptions {
    pageHeight: number;
}

const paginationPluginKey = new PluginKey('pagination');

/**
 * Handles real-time page break markers by measuring node heights.
 */
export const Pagination = Extension.create<PaginationOptions>({
    name: 'pagination',

    addOptions() {
        return {
            pageHeight: 920, // Calibrated height
        };
    },

    addProseMirrorPlugins() {
        const { pageHeight } = this.options;

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
                            const editorDom = view.dom;
                            const children = Array.from(editorDom.children);

                            let currentHeight = 0;
                            let nextPageNumber = 2; // The first break transitions to page 2

                            children.forEach((child) => {
                                if (child.classList.contains('page-break-decoration')) return;

                                const rect = child.getBoundingClientRect();
                                const style = window.getComputedStyle(child);
                                const marginTop = parseFloat(style.marginTop);
                                const marginBottom = parseFloat(style.marginBottom);
                                const fullHeight = rect.height + marginTop + marginBottom;

                                if (currentHeight + fullHeight > pageHeight) {
                                    const pos = view.posAtDOM(child, 0);
                                    const displayPage = nextPageNumber++;

                                    decorations.push(
                                        Decoration.widget(pos, () => {
                                            const container = document.createElement('div');
                                            container.className = 'page-break-decoration';

                                            const line = document.createElement('div');
                                            line.className = 'page-break-line';

                                            const label = document.createElement('div');
                                            label.className = 'page-break-label';
                                            label.innerText = `PAGE ${displayPage}`;

                                            container.appendChild(line);
                                            container.appendChild(label);
                                            return container;
                                        }, {
                                            side: -1,
                                            key: `page-break-${pos}`
                                        })
                                    );
                                    currentHeight = fullHeight;
                                } else {
                                    currentHeight += fullHeight;
                                }
                            });

                            // Apply decorations via a microtask to ensure we are outside the ProseMirror update cycle
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
