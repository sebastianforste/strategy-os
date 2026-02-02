"use client";

/**
 * COMPLIANCE EXPORT MODAL - 2027 Security & Compliance Hardening
 * 
 * UI for exporting audit logs for compliance review.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, FileSpreadsheet, Calendar, Loader2 } from "lucide-react";
import { exportAuditLogs, exportAuditAsCSV, getAuditStats } from "../utils/audit-service";

interface ComplianceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComplianceExportModal({ isOpen, onClose }: ComplianceExportModalProps) {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<{ totalLogs: number; avgDuration: number } | null>(null);

  // Load stats when modal opens
  const loadStats = async () => {
    try {
      const s = await getAuditStats();
      setStats(s);
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const from = dateFrom ? new Date(dateFrom) : undefined;
      const to = dateTo ? new Date(dateTo) : undefined;
      
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === "csv") {
        content = await exportAuditAsCSV(from, to);
        filename = `strategyos-audit-${Date.now()}.csv`;
        mimeType = "text/csv";
      } else {
        const data = await exportAuditLogs(from, to);
        content = JSON.stringify(data, null, 2);
        filename = `strategyos-audit-${Date.now()}.json`;
        mimeType = "application/json";
      }
      
      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onAnimationComplete={() => loadStats()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Compliance Export</h2>
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {stats && (
                <p className="mt-2 text-sm text-neutral-400">
                  {stats.totalLogs} audit entries · Avg. {stats.avgDuration}ms response time
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Export Format</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat("json")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                      format === "json"
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <FileText className="w-4 h-4" /> JSON
                  </button>
                  <button
                    onClick={() => setFormat("csv")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                      format === "csv"
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" /> CSV
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" /> From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" /> To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <p className="text-xs text-neutral-500">
                Leave dates empty to export all available logs.
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isExporting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="w-4 h-4" /> Export Audit Logs</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
