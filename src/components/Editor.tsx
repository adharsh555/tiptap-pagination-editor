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
    onSelectTemplate,
    docTitle,
    setDocTitle
}: {
    editor: TiptapEditor | null,
    onNew: () => void,
    onDelete: () => void,
    isAutoSave: boolean,
    setIsAutoSave: (val: boolean) => void,
    onManualSave: (title: string, content: string) => void,
    onSelectTemplate: (content: string) => void,
    docTitle: string,
    setDocTitle: (val: string) => void
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
        if (!editor) return;
        setSaveStatus("Saving...");
        onManualSave(docTitle, editor.getHTML());
        setTimeout(() => setSaveStatus("Saved"), 1000);
    };

    if (!editor) return null;

    return (
        <div className="w-full bg-[#f9fbfd] select-none print:hidden flex flex-col">
            {/* Top Header Layer: Title & Menus */}
            <div className="flex items-center px-4 pt-2 pb-1 gap-4">
                <div className="bg-blue-600 p-1.5 rounded-md cursor-pointer hover:bg-blue-700 transition" onClick={onNew}>
                    <FileText size={20} className="text-white" />
                </div>
                <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 group">
                        <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className="bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-[#1f1f1f] px-1 rounded -ml-1 w-fit min-w-[100px] hover:border hover:border-gray-300 transition-all font-medium"
                        />
                        <div className="text-[11px] text-gray-400 font-medium lowercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Save size={10} /> {saveStatus}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded border border-gray-200 text-xs font-semibold text-[#444746] transition-all bg-white shadow-sm"
                        title="Drafting Templates"
                    >
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">i</div>
                        Templates
                        <ChevronDown size={14} className={`transition-transform text-gray-500 ${showTemplates ? 'rotate-180' : ''}`} />
                    </button>

                    {showTemplates && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowTemplates(false)} />
                            <div className="absolute top-14 right-4 w-72 bg-white rounded-xl shadow-[0_10px_38px_rgba(0,0,0,0.15)] border border-gray-200 text-gray-800 z-40 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                    Quick Structures
                                </div>
                                {LEGAL_TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => {
                                            if (confirm("Load template?")) onSelectTemplate(tpl.content);
                                            setShowTemplates(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-[#f8f9fa] flex flex-col gap-0.5 transition-colors group"
                                    >
                                        <span className="text-sm font-semibold text-[#1f1f1f] group-hover:text-blue-600">{tpl.name}</span>
                                        <span className="text-[10px] text-gray-500 leading-tight">{tpl.description}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Toolbar Layer: Formatting */}
            <div className="mx-4 my-1 flex items-center gap-1 bg-[#edf2fa] rounded-full px-4 h-10 shadow-sm border border-transparent hover:border-gray-200 transition-all">
                <button
                    onClick={onNew}
                    title="New Document"
                    className="toolbar-btn"
                >
                    <Plus size={18} />
                </button>
                <button
                    onClick={onDelete}
                    title="Clear Document"
                    className="toolbar-btn hover:text-red-600"
                >
                    <Trash2 size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
                    title="Italic"
                >
                    <Italic size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
                    title="Underline"
                >
                    <UnderlineIcon size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                    title="Bullet Points"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </button>

                <div className="flex-grow" />

                <div className="flex items-center gap-2 mr-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Auto-Save</span>
                    <button
                        onClick={() => setIsAutoSave(!isAutoSave)}
                        className={`w-7 h-3.5 rounded-full relative transition-colors ${isAutoSave ? 'bg-blue-500' : 'bg-gray-400'}`}
                    >
                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${isAutoSave ? 'left-4' : 'left-0.5'}`} />
                    </button>
                </div>

                {!isAutoSave && (
                    <button
                        onClick={handleManualSaveClick}
                        className="toolbar-btn text-blue-600 font-bold text-xs"
                    >
                        <Save size={14} className="mr-1" /> SAVE
                    </button>
                )}

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1 hover:bg-gray-200 rounded transition text-[#444746] font-semibold text-xs"
                >
                    <Printer size={16} /> Print
                </button>
            </div>
        </div>
    );
};

export default function Editor() {
    const [mounted, setMounted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isAutoSave, setIsAutoSave] = useState(true);
    const [docTitle, setDocTitle] = useState("LegalDraft Pro - Untitled");

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

    // Hydration
    useEffect(() => {
        if (!editor) return;

        const savedContent = localStorage.getItem('legaldraft_content');
        const savedTitle = localStorage.getItem('legaldraft_title');
        const savedAutoSave = localStorage.getItem('legaldraft_autosave');

        if (savedContent) {
            editor.commands.setContent(savedContent);
        }
        if (savedTitle) {
            setDocTitle(savedTitle);
        }
        if (savedAutoSave !== null) {
            setIsAutoSave(savedAutoSave === 'true');
        }

        setMounted(true);
        setIsHydrated(true);
    }, [editor]);

    // Save title & settings to localStorage
    useEffect(() => {
        if (isHydrated && mounted) {
            localStorage.setItem('legaldraft_title', docTitle);
            localStorage.setItem('legaldraft_autosave', isAutoSave.toString());
        }
    }, [docTitle, isAutoSave, isHydrated, mounted]);

    // Auto-save content
    useEffect(() => {
        if (!editor || !isAutoSave || !isHydrated || !mounted) return;

        const handleUpdate = () => {
            localStorage.setItem('legaldraft_content', editor.getHTML());
        };

        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, isAutoSave, isHydrated, mounted]);

    const handleNew = () => {
        if (editor && confirm("Start a new document? Any unsaved changes will be lost.")) {
            const defaultContent = '<h1>New Document</h1><p>Start typing...</p>';
            const defaultTitle = 'LegalDraft Pro - Untitled';
            editor.commands.setContent(defaultContent);
            setDocTitle(defaultTitle);
            localStorage.setItem('legaldraft_content', defaultContent);
            localStorage.setItem('legaldraft_title', defaultTitle);
        }
    };

    const handleDelete = () => {
        if (editor && confirm("Are you sure you want to clear this document?")) {
            editor.commands.clearContent();
            localStorage.removeItem('legaldraft_content');
        }
    };

    const handleManualSave = (title: string, content: string) => {
        localStorage.setItem('legaldraft_title', title);
        localStorage.setItem('legaldraft_content', content);
        console.log("Saved to localStorage:", { title, content });
        alert("Document saved locally.");
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
                docTitle={docTitle}
                setDocTitle={setDocTitle}
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
