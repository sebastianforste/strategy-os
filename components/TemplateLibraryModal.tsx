import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, FileText, Plus, Trash2, ArrowRight } from "lucide-react";
import { Template, getTemplates, deleteTemplate, extractVariables, fillTemplate } from "../utils/template-service";

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export default function TemplateLibraryModal({ isOpen, onClose, onSelect }: TemplateLibraryModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fillerValues, setFillerValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setSelectedTemplate(null);
      setFillerValues({});
    }
  }, [isOpen]);

  const loadTemplates = () => {
    setTemplates(getTemplates().sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this template?")) {
        deleteTemplate(id);
        loadTemplates(); // Refresh
        if (selectedTemplate?.id === id) setSelectedTemplate(null);
    }
  };

  const handleTemplateClick = (template: Template) => {
      setSelectedTemplate(template);
      // Initialize filler values
      const vars = extractVariables(template.content);
      const initialValues: Record<string, string> = {};
      vars.forEach(v => initialValues[v] = "");
      setFillerValues(initialValues);
  };

  const handleUseTemplate = () => {
      if (!selectedTemplate) return;
      const filledContent = fillTemplate(selectedTemplate.content, fillerValues);
      onSelect(filledContent);
      onClose();
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-4xl h-[80vh] overflow-hidden flex"
        >
            {/* Left Sidebar: List */}
            <div className="w-1/3 border-r border-neutral-800 flex flex-col bg-neutral-900/50">
                <div className="p-4 border-b border-neutral-800">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Library
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-neutral-600 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500 text-sm">
                            <p>No templates found.</p>
                            <p className="text-xs mt-1">Save posts as templates to see them here.</p>
                        </div>
                    ) : (
                        filteredTemplates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleTemplateClick(t)}
                                className={`w-full text-left p-3 rounded-lg transition-colors group relative ${selectedTemplate?.id === t.id ? "bg-neutral-800 border border-neutral-700" : "hover:bg-neutral-800/50 border border-transparent"}`}
                            >
                                <div className="font-medium text-white text-sm truncate pr-6">{t.name}</div>
                                <div className="text-xs text-neutral-500 truncate mt-1 opactiy-80">{t.content.substring(0, 40)}...</div>
                                <div 
                                    onClick={(e) => handleDelete(e, t.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-600 hover:text-red-500 hover:bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-neutral-800">
                    <button onClick={onClose} className="w-full py-2 text-sm text-neutral-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                </div>
            </div>

            {/* Right Pane: Preview & Filler */}
            <div className="flex-1 flex flex-col bg-[#0A0A0A]">
                {selectedTemplate ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-neutral-800">
                            <h3 className="text-xl font-bold text-white mb-2">{selectedTemplate.name}</h3>
                            <div className="flex gap-2">
                                {extractVariables(selectedTemplate.content).length > 0 ? (
                                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                                        {extractVariables(selectedTemplate.content).length} Variables Detected
                                    </span>
                                ) : (
                                    <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">Static Template</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Variable Form */}
                            {extractVariables(selectedTemplate.content).length > 0 && (
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-blue-400" />
                                        Fill in the blanks
                                    </h4>
                                    <div className="space-y-4">
                                        {extractVariables(selectedTemplate.content).map(variable => (
                                            <div key={variable}>
                                                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">
                                                    {variable}
                                                </label>
                                                <input 
                                                    value={fillerValues[variable] || ""}
                                                    onChange={(e) => setFillerValues({...fillerValues, [variable]: e.target.value})}
                                                    className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                    placeholder={`Enter value for ${variable}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview */}
                            <div>
                                <h4 className="text-xs font-bold text-neutral-500 uppercase mb-3">Preview</h4>
                                <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 text-neutral-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                    {fillTemplate(selectedTemplate.content, fillerValues)}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-neutral-800">
                            <button 
                                onClick={handleUseTemplate}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Use Template <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a template to view details</p>
                    </div>
                )}
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
