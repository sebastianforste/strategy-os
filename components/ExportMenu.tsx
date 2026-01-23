import { useState } from "react";
import { Copy, FileJson, FileType, Check, ChevronDown, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard, formatForGDocs, formatForNotion } from "../utils/export-service";

interface ExportMenuProps {
  content: string;
}

export default function ExportMenu({ content }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleCopy = async (type: "plain" | "notion" | "gdocs") => {
    let textToCopy = content;
    let format: "text/plain" | "text/html" = "text/plain";
    let label = "Copied!";

    if (type === "notion") {
      textToCopy = formatForNotion(content);
      label = "Copied Markdown";
    } else if (type === "gdocs") {
      textToCopy = formatForGDocs(content);
      format = "text/html";
      label = "Copied Rich Text";
    }

    const success = await copyToClipboard(textToCopy, format);
    
    if (success) {
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 2000);
      setIsOpen(false);
    }
  };

  const menuItems = [
    { id: "plain", label: "Copy Text", icon: Copy, onClick: () => handleCopy("plain") },
    { id: "notion", label: "Copy for Notion", icon: FileJson, onClick: () => handleCopy("notion") },
    { id: "gdocs", label: "Copy for Docs", icon: FileType, onClick: () => handleCopy("gdocs") },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-neutral-500 hover:text-white transition-colors rounded-md bg-neutral-900 border border-neutral-800"
        title="Export Options"
      >
        {copiedLabel ? (
            <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-green-500 hidden sm:inline">{copiedLabel}</span>
            </>
        ) : (
            <>
                <Download className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
            </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-20"
          >
            <div className="p-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors text-left"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}
