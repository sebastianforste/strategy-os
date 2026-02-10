
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Layers, Trash2, Edit3, Copy, Plus } from "lucide-react";
import { getTemplates, deleteTemplate, createTemplate } from "../actions/template";

interface Template {
    id: string;
    name: string;
    content: string;
    category: string;
    createdAt: Date;
}

interface TemplateVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: Template) => void;
    currentContent?: string; // If passed, allows saving as new template
}

export default function TemplateVaultModal({ isOpen, onClose, onSelect, currentContent }: TemplateVaultModalProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"list" | "create">("list");
    
    // Create State
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateCategory, setNewTemplateCategory] = useState("Hook");

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            if (currentContent) setView("create");
            else setView("list");
        }
    }, [isOpen, currentContent]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await getTemplates();
            // Need to map Date strings back to Date objects if serialized
            setTemplates(data as any); 
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentContent || !newTemplateName) return;
        try {
            await createTemplate(currentContent, newTemplateName, newTemplateCategory);
            // Refresh list and switch view
            await fetchTemplates();
            setView("list");
        } catch (e) {
            console.error("Failed to save template", e);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this template?")) {
            await deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Layers className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Template Vault</h3>
                            <p className="text-xs text-neutral-500 font-mono">REUSABLE STRATEGY ASSETS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {view === "list" ? (
                        <>
                            {/* Search Bar */}
                            <div className="p-4 border-b border-white/5 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Search templates..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                {currentContent && (
                                     <button 
                                        onClick={() => setView("create")}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                                     >
                                        <Plus className="w-4 h-4" /> Save Current
                                     </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {loading ? (
                                    <p className="text-center text-neutral-500 text-xs py-10">Loading vault...</p>
                                ) : filteredTemplates.length === 0 ? (
                                    <div className="text-center py-20 opacity-50">
                                        <Layers className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                                        <p className="text-neutral-500 text-sm">No templates found.</p>
                                    </div>
                                ) : (
                                    filteredTemplates.map(template => (
                                        <div 
                                            key={template.id}
                                            onClick={() => onSelect(template)}
                                            className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2 inline-block">
                                                        {template.category}
                                                    </span>
                                                    <h4 className="font-bold text-neutral-200 group-hover:text-white">{template.name}</h4>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDelete(template.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-neutral-500 line-clamp-2 font-mono">{template.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-8 flex flex-col h-full">
                            <h4 className="text-lg font-bold text-white mb-6">Save Strategy as Template</h4>
                            
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase font-bold mb-2 block">Template Name</label>
                                    <input 
                                        type="text" 
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 transition-colors"
                                        placeholder="e.g. Viral Hook Structure"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase font-bold mb-2 block">Category</label>
                                    <select 
                                        value={newTemplateCategory}
                                        onChange={(e) => setNewTemplateCategory(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 transition-colors appearance-none"
                                    >
                                        <option value="Hook">Hook Framework</option>
                                        <option value="Story">Storytelling</option>
                                        <option value="Listicle">Listicle / Value</option>
                                        <option value="Thread">X Thread</option>
                                        <option value="Offer">Sales / Offer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 uppercase font-bold mb-2 block">Preview Content</label>
                                    <div className="p-4 bg-black/20 border border-white/5 rounded-xl h-32 overflow-y-auto text-xs text-neutral-400 font-mono">
                                        {currentContent}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                                <button 
                                    onClick={() => setView("list")}
                                    className="flex-1 py-3 text-sm font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={!newTemplateName}
                                    className="flex-1 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save to Vault
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
