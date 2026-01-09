"use client";

import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Pagination } from '@/extensions/Pagination';
import { useState, useEffect } from 'react';
import { LEGAL_TEMPLATES } from '@/data/templates';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Type,
    Printer,
    FileText,
    Save,
    Trash2,
    Plus,
    ChevronDown
} from 'lucide-react';

const Toolbar = ({
    editor,
    onNew,
    onDelete,
    isAutoSave,
    setIsAutoSave,
    onManualSave,
    onSelectTemplate
}: {
    editor: TiptapEditor | null,
    onNew: () => void,
    onDelete: () => void,
    isAutoSave: boolean,
    setIsAutoSave: (val: boolean) => void,
    onManualSave: () => void,
    onSelectTemplate: (content: string) => void
}) => {
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [showTemplates, setShowTemplates] = useState(false);

    useEffect(() => {
        if (!editor || !isAutoSave) return;
        const handleUpdate = () => {
            setSaveStatus("Saving...");
            setTimeout(() => setSaveStatus("Saved"), 1000);
        };
        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, isAutoSave]);

    const handleManualSaveClick = () => {
        setSaveStatus("Saving...");
        onManualSave();
        setTimeout(() => setSaveStatus("Saved"), 1000);
    };

    if (!editor) return null;

    return (
        <div className="w-full bg-[#1a2a40] text-white border-b border-gray-800 select-none print:hidden">
            <div className="max-w-screen-xl mx-auto px-6 h-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded-md">
                        <FileText size={18} className="text-white" />
                    </div>
                    <input
                        type="text"
                        defaultValue="Untitled Legal Document"
                        className="bg-transparent border-none focus:outline-none text-sm font-semibold tracking-wide w-64 hover:bg-white/10 px-2 py-1 rounded transition text-white"
                    />
                </div>
                <div className="flex items-center gap-4">
                    {/* Template Selection */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-xs font-bold transition-all active:scale-95"
                            title="Legal Templates"
                        >
                            <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px]">i</div>
                            Templates
                            <ChevronDown size={12} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                        </button>

                        {showTemplates && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowTemplates(false)} />
                                <div className="absolute top-10 right-0 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 text-gray-800 z-40 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">
                                        Select Legal Structure
                                    </div>
                                    {LEGAL_TEMPLATES.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => {
                                                onSelectTemplate(tpl.content);
                                                setShowTemplates(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col gap-0.5 transition-colors group"
                                        >
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">{tpl.name}</span>
                                            <span className="text-[10px] text-gray-400 leading-tight">{tpl.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Auto-Save</span>
                        <button
                            onClick={() => setIsAutoSave(!isAutoSave)}
                            className={`w-8 h-4 rounded-full relative transition-colors ${isAutoSave ? 'bg-blue-500' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isAutoSave ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    {!isAutoSave && (
                        <button
                            onClick={handleManualSaveClick}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all active:scale-95"
                        >
                            <Save size={14} /> Save Now
                        </button>
                    )}

                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2 min-w-[60px]">
                        <Save size={12} /> {saveStatus}
                    </div>
                    <div className="h-4 w-px bg-gray-600" />
                    <button
                        onClick={onNew}
                        title="New Document"
                        className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        title="Clear Document"
                        className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white text-gray-700 border-b border-gray-200 shadow-sm relative z-20">
                <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-1">
                    <div className="flex items-center gap-0.5 mr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Bold"
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Italic"
                        >
                            <Italic size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Underline"
                        >
                            <UnderlineIcon size={18} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-gray-200 mx-2" />

                    <div className="flex items-center gap-0.5 mx-2">
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Heading 1"
                        >
                            <Heading1 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Heading 2"
                        >
                            <Heading2 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setParagraph().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('paragraph') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Paragraph"
                        >
                            <Type size={18} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-gray-200 mx-2" />

                    <div className="flex items-center gap-0.5 mx-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Bullet Points"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
                            title="Numbered List"
                        >
                            <ListOrdered size={18} />
                        </button>
                    </div>

                    <div className="flex-grow" />

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a2a40] text-white rounded font-semibold text-sm hover:bg-black transition-all"
                    >
                        <Printer size={16} /> Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Editor() {
    const [mounted, setMounted] = useState(false);
    const [isAutoSave, setIsAutoSave] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Pagination.configure({
                pageHeight: 864, // 9 inches @ 96dpi
                margin: 96,      // 1 inch @ 96dpi
                gap: 32          // Workspace gap
            }),
            Placeholder.configure({
                placeholder: 'Begin your legal drafting here...',
            }),
        ],
        content: `
      <h1>Untitled Legal Document</h1>
      <p>Start drafting by choosing a template from the toolbar info button or begin typing here...</p>
    `,
        editorProps: {
            attributes: {
                class: 'focus:outline-none',
            },
        },
        immediatelyRender: false,
    });

    const handleNew = () => {
        if (editor && confirm("Start a new document? Any unsaved changes will be lost.")) {
            editor.commands.setContent('<h1>New Document</h1><p>Start typing...</p>');
        }
    };

    const handleDelete = () => {
        if (editor && confirm("Are you sure you want to clear this document?")) {
            editor.commands.clearContent();
        }
    };

    const handleManualSave = () => {
        // Logic for manual save (e.g., API call)
        console.log("Manual save triggered:", editor?.getHTML());
    };

    const handleSelectTemplate = (content: string) => {
        if (editor && confirm("Load this template? Current content will be replaced.")) {
            editor.commands.setContent(content);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Toolbar
                editor={editor}
                onNew={handleNew}
                onDelete={handleDelete}
                isAutoSave={isAutoSave}
                setIsAutoSave={setIsAutoSave}
                onManualSave={handleManualSave}
                onSelectTemplate={handleSelectTemplate}
            />
            <div className="flex-grow overflow-y-auto bg-[#f0f2f5] pt-12 pb-32">
                <div className="editor-container">
                    <div className="page-container">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        </div>
    );
}
