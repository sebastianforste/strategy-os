"use client";

import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, Check, X, ExternalLink } from "lucide-react";
import { checkFacts, FactCheckResult } from "../utils/fact-checker";
import { motion, AnimatePresence } from "framer-motion";

interface TruthShieldProps {
    content: string;
    apiKey?: string;
}

export default function TruthShield({ content, apiKey }: TruthShieldProps) {
    const [results, setResults] = useState<FactCheckResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const handleCheck = async () => {
        if (!apiKey || isLoading) return;
        setIsLoading(true);
        try {
            const facts = await checkFacts(content, apiKey, process.env.NEXT_PUBLIC_SERPER_API_KEY || "");
            setResults(facts);
            setHasRun(true);
        } catch (e) {
            console.error("Fact check failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    const integrityScore = results.length > 0 
        ? Math.round((results.filter(r => r.verdict === 'verified').length / results.length) * 100) 
        : 100;

    return (
        <div className="border-t border-white/5 pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                        isLoading ? 'bg-yellow-500/10 text-yellow-500' :
                        !hasRun ? 'bg-neutral-800 text-neutral-500' :
                        integrityScore === 100 ? 'bg-green-500/10 text-green-500' :
                        integrityScore > 50 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                    }`}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                         !hasRun ? <Shield className="w-4 h-4" /> :
                         integrityScore === 100 ? <ShieldCheck className="w-4 h-4" /> :
                         <ShieldAlert className="w-4 h-4" />
                        }
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Truth Engine</h4>
                        <p className="text-[10px] text-neutral-500 font-mono">
                            {!hasRun ? "VERIFICATION PENDING" : `INTEGRITY SCORE: ${integrityScore}%`}
                        </p>
                    </div>
                </div>

                {!hasRun || results.length === 0 ? (
                    <button 
                        onClick={handleCheck}
                        disabled={isLoading || !apiKey}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-white rounded-lg transition-colors border border-white/5"
                    >
                        {isLoading ? "VERIFYING..." : "RUN FACT CHECK"}
                    </button>
                ) : (
                    <button 
                         onClick={handleCheck}
                         className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors"
                         title="Re-run Check"
                    >
                        <ShieldQuestion className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {hasRun && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        {results.length === 0 ? (
                            <p className="text-[10px] text-neutral-500 italic text-center py-2">No verifiable claims detected.</p>
                        ) : (
                            results.map((result, i) => (
                                <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${
                                    result.verdict === 'verified' ? 'bg-green-500/5 border-green-500/20' :
                                    result.verdict === 'debunked' ? 'bg-red-500/5 border-red-500/20' :
                                    'bg-yellow-500/5 border-yellow-500/20'
                                }`}>
                                    <div className={`mt-0.5 ${
                                        result.verdict === 'verified' ? 'text-green-500' :
                                        result.verdict === 'debunked' ? 'text-red-500' : 'text-yellow-500'
                                    }`}>
                                        {result.verdict === 'verified' ? <Check className="w-4 h-4" /> :
                                         result.verdict === 'debunked' ? <X className="w-4 h-4" /> :
                                         <ShieldQuestion className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-neutral-300 font-medium leading-relaxed">"{result.claim}"</p>
                                        
                                        {result.verdict === 'debunked' && result.correction && (
                                            <div className="mt-2 text-[10px] text-red-400 font-bold bg-red-500/10 p-2 rounded-lg">
                                                CORRECTION: {result.correction}
                                            </div>
                                        )}
                                        
                                        {result.sourceUrl && (
                                            <a 
                                                href={result.sourceUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 mt-2 text-[10px] text-neutral-500 hover:text-white transition-colors w-fit"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                SOURCE EVIDENCE
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
