"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Layout, Loader2, Save, Sword, Link, Globe, Sparkles } from "lucide-react";
import CanvasNode from "./CanvasNode";
import WarRoomSidebar from "./WarRoomSidebar";
import { CanvasNodeState, getCanvasNodes, saveCanvasNodePosition, removeCanvasNode, getArchivedStrategies } from "../utils/archive-service";
import { simulateConflict, DefensibilityReport } from "../utils/war-room-service";
import { syncService, SyncMessage, Collaborator } from "../utils/sync-service";
import { PERSONAS } from "../utils/personas";
import { aiOptimizerAction } from "../actions/collaborative-actions";

interface StrategyCanvasProps {
  apiKey: string;
}

export default function StrategyCanvas({ apiKey }: StrategyCanvasProps) {
  const [nodes, setNodes] = useState<CanvasNodeState[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Pan position
  const [isLoading, setIsLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<DefensibilityReport | null>(null);
  const [isAnalyzingNodeId, setIsAnalyzingNodeId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
    const [isAIOptimizing, setIsAIOptimizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

  const handleIngestURL = async () => {
    if (!urlInput.trim() || !urlInput.startsWith("http")) return;
    
    setIsIngesting(true);
    try {
        const res = await fetch("/api/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlInput })
        });
        const data = await res.json();
        
        if (res.ok && data.text) {
            const newNode: CanvasNodeState = {
                id: `signal-${Date.now()}`,
                type: 'post',
                content: `[SIGNAL] ${urlInput}\n\n${data.text.substring(0, 500)}...`,
                x: -position.x + 100, // Place near current center
                y: -position.y + 100
            };
            setNodes(prev => [...prev, newNode]);
            await saveCanvasNodePosition(newNode);
            setUrlInput("");
        }
    } catch (e) {
        console.error("Ingestion failed:", e);
    } finally {
        setIsIngesting(false);
    }
  };

  // Load Canvas State
  useEffect(() => {
    async function load() {
        // 1. Get existing canvas layout
        const savedNodes = await getCanvasNodes();
        
        // 2. If canvas is empty, maybe populate with recent archives?
        // For MVP, if empty, we fetch archives and lay them out in a grid
        if (savedNodes.length === 0) {
            const archives = await getArchivedStrategies();
            const newNodes: CanvasNodeState[] = archives.slice(0, 10).map((arch, i) => ({
                id: arch.id,
                type: arch.type,
                content: arch.content,
                // Simple grid layout
                x: (i % 4) * 300 + 100,
                y: Math.floor(i / 4) * 300 + 100
            }));
            
            // Save initial layout
            for (const n of newNodes) await saveCanvasNodePosition(n);
            setNodes(newNodes);
        } else {
            setNodes(savedNodes);
        }
        setIsLoading(false);
    }
    load();

    // 3. Sync Setup
    const unsubscribe = syncService.subscribe((msg: SyncMessage) => {
        if (msg.senderId === syncService.getUserId()) return;

        switch (msg.type) {
            case 'node_move':
                setNodes(prev => prev.map(n => n.id === msg.payload.id ? { ...n, x: msg.payload.x, y: msg.payload.y } : n));
                break;
            case 'node_add':
                setNodes(prev => [...prev.filter(n => n.id !== msg.payload.id), msg.payload]);
                break;
            case 'node_remove':
                setNodes(prev => prev.filter(n => n.id !== msg.payload));
                break;
            case 'collaborator_join':
                setCollaborators(prev => [...prev.filter(c => c.id !== msg.payload.id), msg.payload]);
                break;
            case 'collaborator_leave':
                setCollaborators(prev => prev.filter(c => c.id !== msg.payload));
                break;
        }
    });

    // Join channel
    syncService.broadcast('collaborator_join', {
        id: syncService.getUserId(),
        name: 'You',
        isAI: false,
        lastActive: Date.now()
    });

    return () => {
        unsubscribe();
        syncService.broadcast('collaborator_leave', syncService.getUserId());
    };
  }, []);

  const handleUpdateNode = async (id: string, x: number, y: number) => {
      // Update local state
      setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
      
      // Broadcast shift
      syncService.broadcast('node_move', { id, x, y });

      // Persist (debounce logic handled by caller usually, but here we just write)
      const node = nodes.find(n => n.id === id);
      if (node) {
          await saveCanvasNodePosition({ ...node, x, y });
      }
  };

  const handleRemoveNode = async (id: string) => {
      setNodes(prev => prev.filter(n => n.id !== id));
      syncService.broadcast('node_remove', id);
      await removeCanvasNode(id);
  };

  const handleStressTest = async (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node || !apiKey) return;

    setIsAnalyzingNodeId(id);
    setActiveReport(null);

    const report = await simulateConflict(node.content || "", apiKey);
    
    if (report) {
        setActiveReport(report);
        // Persist report to node
        const updatedNode = { ...node, warRoomReport: report };
        setNodes(prev => prev.map(n => n.id === id ? updatedNode : n));
        await saveCanvasNodePosition(updatedNode);
    }
    
    setIsAnalyzingNodeId(null);
  };

  const handleAICollaborate = async (personaId: string) => {
    const persona = PERSONAS[personaId as keyof typeof PERSONAS];
    if (!persona || !apiKey) return;

    setIsAIOptimizing(true);
    setActivePersonaId(personaId);

    // Join AI to collaborators
    const aiCollaborator: Collaborator = {
        id: `ai-${personaId}`,
        name: persona.name,
        isAI: true,
        lastActive: Date.now()
    };
    syncService.broadcast('collaborator_join', aiCollaborator);
    setCollaborators(prev => [...prev.filter(c => c.id !== aiCollaborator.id), aiCollaborator]);

    const result = await aiOptimizerAction(nodes, persona.basePrompt || "", apiKey);
    
    if (result) {
        // We could apply positions here, but for now we suggest or draw connectors safely
        console.log("AI STRATEGIC SUGGESTION:", result);
        // In a real app, we'd draw the connectors between nodes
    }
    
    setIsAIOptimizing(false);
  };

  if (isLoading) {
      return (
          <div className="w-full h-[600px] flex items-center justify-center bg-black/40 backdrop-blur-md rounded-xl border border-white/5">
              <div className="flex flex-col items-center gap-4">
                 <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                 <p className="text-xs font-mono text-neutral-500">LOADING INFINITE CANVAS...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-[800px] relative overflow-hidden bg-[#050505] rounded-xl border border-white/5 shadow-2xl group cursor-crosshair">
       {/* Background Grid */}
       <div 
         className="absolute inset-0 pointer-events-none opacity-20"
         style={{
             backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`,
             backgroundSize: `${30 * scale}px ${30 * scale}px`,
             transform: `translate(${position.x}px, ${position.y}px)`
         }}
       />

       {/* Collaborators Bar */}
       <div className="absolute bottom-4 right-4 z-[100] flex items-center gap-2">
           <AnimatePresence>
               {collaborators.map(c => (
                   <motion.div
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       key={c.id}
                       className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${c.isAI ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-neutral-800 border-white/20 text-neutral-400'}`}
                       title={c.name}
                   >
                       {c.name.charAt(0)}
                   </motion.div>
               ))}
           </AnimatePresence>
       </div>

       {/* Controls */}
       <div className="absolute top-4 right-4 z-[100] flex flex-col gap-2 bg-neutral-900/80 backdrop-blur p-2 rounded-lg border border-white/10">
          <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="p-2 hover:bg-white/10 rounded text-white" title="Zoom In">
              <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setScale(s => Math.max(s - 0.1, 0.2))} className="p-2 hover:bg-white/10 rounded text-white" title="Zoom Out">
              <Minus className="w-4 h-4" />
          </button>
          <div className="h-px w-full bg-white/10" />
          <button 
             onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} 
             className="p-2 hover:bg-white/10 rounded text-white" 
             title="Reset View"
          >
              <Layout className="w-4 h-4" />
          </button>
       </div>

       {/* URL Ingestion Plate */}
       <div className="absolute top-4 left-4 z-[100] flex gap-2">
           <div className="flex bg-neutral-900/90 backdrop-blur border border-white/10 rounded-xl p-1.5 shadow-2xl">
               <div className="flex items-center gap-2 px-2 text-neutral-500 border-r border-white/5 mr-2">
                   <Globe className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Ingester</span>
               </div>
               <input 
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste URL to ingest..."
                  onKeyDown={(e) => e.key === 'Enter' && handleIngestURL()}
                  className="bg-transparent border-none text-[10px] text-white focus:outline-none placeholder:text-neutral-600 w-48"
               />
               <button 
                  onClick={handleIngestURL}
                  disabled={isIngesting || !urlInput.trim()}
                  className={`p-1.5 rounded-lg transition-all ${isIngesting ? 'bg-indigo-500/20' : 'hover:bg-indigo-500 text-white'}`}
               >
                   {isIngesting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <Link className="w-3.5 h-3.5" />}
               </button>
           </div>

           {/* AI Collaborate Trigger */}
           <div className="flex bg-neutral-900/90 backdrop-blur border border-white/10 rounded-xl p-1.5 shadow-2xl">
               <div className="flex items-center gap-2 px-2 text-neutral-500 border-r border-white/5 mr-2">
                   <Sparkles className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">AI Partner</span>
               </div>
               <select 
                  onChange={(e) => handleAICollaborate(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-white focus:outline-none placeholder:text-neutral-600 appearance-none pr-4"
                  defaultValue=""
               >
                   <option value="" disabled>Invite Persona...</option>
                   <option value="cso">Strategy Officer</option>
                   <option value="newsjacker">Newsjacker</option>
                   <option value="vibrant">Vibrant Narrator</option>
               </select>
               {isAIOptimizing && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 ml-2" />}
           </div>
       </div>

       {/* Infinite Plane */}
       <motion.div
         ref={containerRef}
         className="w-full h-full relative"
         style={{
             scale,
             x: position.x,
             y: position.y
         }}
         drag
         dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }} // Soft limits
         onDragEnd={(e, info) => {
             // Update pan position
             setPosition(p => ({ x: p.x + info.offset.x, y: p.y + info.offset.y }));
         }}
       >
           {/* Rendering Nodes */}
           {nodes.map(node => (
               <CanvasNode
                  key={node.id}
                  node={node}
                  onUpdatePosition={handleUpdateNode}
                  onRemove={handleRemoveNode}
                  onStressTest={handleStressTest}
                  isAnalyzing={isAnalyzingNodeId === node.id}
               />
           ))}
       </motion.div>

       {/* War Room Sidebar */}
       <WarRoomSidebar 
          report={activeReport} 
          isLoading={isAnalyzingNodeId !== null && activeReport === null}
          onClose={() => setActiveReport(null)}
       />
       
       <div className="absolute bottom-4 left-4 z-[100] pointer-events-none">
           <p className="text-[10px] font-mono text-neutral-600 uppercase">
               CANVAS MODE v0.2 • [SWORD] = STRESS TEST • PAN: DRAG BG • ZOOM: {Math.round(scale * 100)}%
           </p>
       </div>
    </div>
  );
}
