"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Activity, Volume2, Monitor, Disc, Save } from "lucide-react";
import { VaultService } from "../../utils/vault-service";
import { motion, AnimatePresence } from "framer-motion";
import { 
  convertFloat32ToInt16, 
  convertInt16ToBase64, 
  decodeBase64ToFloat32, 
  calculateVolume 
} from "../../utils/audio-utils";

interface LiveSessionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveSession({ isOpen, onClose }: LiveSessionProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [sourceType, setSourceType] = useState<"mic" | "system">("mic");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summaries, setSummaries] = useState<{ id: string; text: string; timestamp: Date }[]>([]);
  const lastSummaryTimeRef = useRef<number>(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<string[]>([]); // Queue for base64 audio chunks
  const isPlayingRef = useRef(false);

  // --- AUDIO OUTPUT (TTS) ---
  
  const playNextChunk = useCallback(async () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0 || isPlayingRef.current) return;
    
    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift();
    
    try {
      if (chunk) {
        const float32Data = decodeBase64ToFloat32(chunk);

        // Microsoft Teams / Gemini Live optimized sample rate (24000Hz)
        const audioBuf = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
        audioBuf.getChannelData(0).set(float32Data);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuf;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          isPlayingRef.current = false;
          playNextChunk();
        };
        source.start();
      } else {
        isPlayingRef.current = false;
      }
    } catch (e) {
      console.error("Audio playback error", e);
      isPlayingRef.current = false;
    }
  }, []);

  // --- WEBSOCKET SETUP ---

  useEffect(() => {
    if (isOpen && status === "disconnected") {
      connect();
    }
    return () => disconnect();
  }, [isOpen]);

  const connect = async () => {
    try {
      setStatus("connecting");
      
      // 1. Setup Audio Setup
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      // 2. Connect WS
      const ws = new WebSocket("ws://localhost:8080");
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        
        // Define system instructions based on mode
        const systemInstruction = sourceType === 'system' 
            ? "You are a 'Meeting Orchestrator'. Your job is to listen to this meeting audio, identify key decisions, action items, and strategic pivots. Do not interrupt frequently. If you speak, be concise and offer a strategic synthesis of what was just said."
            : "You are the 'Strategy OS Voice'. You are a high-stakes strategic partner. Be punchy, contrarian, and focus on leverage and speed.";

        // Send Initial Setup Message
        const setupMessage = {
          setup: {
            generationConfig: {
              responseModalities: ["AUDIO"], 
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
              },
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              }
            }
          }
        };
        
        ws.send(JSON.stringify(setupMessage));

        // Start Audio
        if (sourceType === "mic") {
            startMicrophone();
        } else {
            startSystemAudio();
        }
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        // Handle Transcript (if Gemini sends text parts)
        if (data.serverContent?.modelTurn?.parts?.[0]?.text) {
             const text = data.serverContent.modelTurn.parts[0].text;
             
             // Check if this looks like a summary/insight (e.g., contains specific markdown or is a response to our pulse request)
             if (text.includes("STRATEGIC PULSE") || text.includes("INSIGHT:")) {
                setSummaries(prev => [{
                    id: Math.random().toString(36).substr(2, 9),
                    text: text.replace("STRATEGIC PULSE:", "").replace("INSIGHT:", "").trim(),
                    timestamp: new Date()
                }, ...prev]);
             } else {
                setTranscript(prev => prev + " " + text);
             }
        }

        // Handle Server -> Client Audio
        if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
          const audioBase64 = data.serverContent.modelTurn.parts[0].inlineData.data;
          audioQueueRef.current.push(audioBase64);
          playNextChunk();
        }
      };

      ws.onerror = (e) => {
        console.error("WS Error", e);
        setStatus("error");
      };

      ws.onclose = () => {
        setStatus("disconnected");
      };

    } catch (e) {
      console.error("Connection failed", e);
      setStatus("error");
    }
  };

  const disconnect = () => {
    if (wsRef.current) wsRef.current.close();
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    
    wsRef.current = null;
    audioContextRef.current = null;
    lastSummaryTimeRef.current = 0; // Reset timer on disconnect
    setStatus("disconnected");
  };

  // --- AUDIO PROCESSOR LOGIC ---

  const setupAudioProcessor = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    const processor = audioContextRef.current.createScriptProcessor(512, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
        if (isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0); 
        setVolumeLevel(calculateVolume(inputData));

        const pcmData = convertFloat32ToInt16(inputData);
        const base64Audio = convertInt16ToBase64(pcmData);

        wsRef.current.send(JSON.stringify({
            realtimeInput: {
                mediaChunks: [{
                    mimeType: "audio/pcm",
                    data: base64Audio
                }]
            }
        }));

        // Check for periodic summary trigger (every 2 mins = 120000ms for testing/frequent pulse)
        if (isRecording && Date.now() - lastSummaryTimeRef.current > 120000) {
            lastSummaryTimeRef.current = Date.now();
            wsRef.current.send(JSON.stringify({
                clientContent: {
                    turns: [{
                        role: "user",
                        parts: [{ text: "GIVE ME A STRATEGIC PULSE: What are the 3 most important strategic pivots or decisions discussed in the last few minutes? Label as 'STRATEGIC PULSE:'." }]
                    }]
                }
            }));
        }
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
  };

  // --- MICROPHONE INPUT ---

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1, 
          sampleRate: 16000 
        } 
      });
      mediaStreamRef.current = stream;
      setupAudioProcessor(stream);
    } catch (e) {
      console.error("Mic access denied", e);
      setStatus("error");
    }
  };

  const startSystemAudio = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ 
        video: true,
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      mediaStreamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
          throw new Error("No system audio track found. Make sure to check 'Share system audio'.");
      }

      setupAudioProcessor(new MediaStream([audioTrack]));

      // Stop video track if captured
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.stop();
    } catch (e) {
      console.error("System audio access denied", e);
      setStatus("disconnected");
      setSourceType("mic");
    }
  };

  const handleSaveToVault = () => {
      if (!transcript.trim() && summaries.length === 0) return;
      const vault = new VaultService();
      vault.saveAsset(
          "meeting_summary", 
          { 
              transcript, 
              summaries: summaries.map(s => s.text),
              notes: "Automated meeting capture via Gemini Live." 
          },
          `Meeting Recap - ${new Date().toLocaleDateString()}`
      );
      setTranscript("");
      setSummaries([]);
      setIsRecording(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-12"
      >
        {/* Visualizer Circle */}
        <div className="relative">
           <div className={`absolute inset-0 bg-indigo-500 blur-3xl rounded-full transition-all duration-100 ease-out`} 
                style={{ opacity: 0.2 + (volumeLevel * 2), transform: `scale(${1 + volumeLevel})` }} />
           
           <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-500
                ${status === 'connected' ? 'border-indigo-400 bg-neutral-900 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 
                  status === 'error' ? 'border-red-500 bg-red-950/30' : 'border-neutral-700 bg-neutral-900'}`}
           >
              {status === 'connecting' ? (
                <Activity className="w-12 h-12 text-indigo-400 animate-pulse" />
              ) : status === 'connected' ? (
                <div className="flex gap-1 items-end h-16">
                    {[1,2,3,4,5].map(i => (
                        <motion.div 
                           key={i} 
                           className="w-3 bg-indigo-400 rounded-full"
                           animate={{ height: 16 + (Math.random() * 40 * (1+volumeLevel)) }}
                           transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
                        />
                    ))}
                </div>
              ) : (
                <MicOff className="w-12 h-12 text-neutral-600" />
              )}
           </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Gemini Live</h2>
            <p className="text-neutral-400 font-mono text-sm uppercase tracking-widest">
                {status === 'connected' ? 'Listening...' : status === 'connecting' ? 'Establishing Handshake...' : 'Disconnected'}
            </p>
            {status === 'error' && <p className="text-red-400 text-xs mt-2">Check if scripts/voice-server.ts is running!</p>}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                <button 
                    onClick={() => {
                        setSourceType("mic");
                        if (status === "connected") disconnect();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${sourceType === 'mic' ? 'bg-indigo-500 text-white' : 'text-neutral-500 hover:text-white'}`}
                >
                    <Mic className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Microphone</span>
                </button>
                <button 
                    onClick={() => {
                        setSourceType("system");
                        if (status === "connected") disconnect();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${sourceType === 'system' ? 'bg-indigo-500 text-white' : 'text-neutral-500 hover:text-white'}`}
                >
                    <Monitor className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">System Audio</span>
                </button>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-6 rounded-3xl transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>

                {status === "connected" && (
                    <button 
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-6 rounded-3xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                        <Disc className="w-8 h-8" />
                    </button>
                )}

                {transcript.length > 0 && !isRecording && (
                    <button 
                        onClick={handleSaveToVault}
                        className="p-6 rounded-3xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all border border-green-500/20"
                        title="Save Recap to Vault"
                    >
                        <Save className="w-8 h-8" />
                    </button>
                )}
            </div>
            
            {isRecording && (
                <div className="flex items-center gap-2 text-red-400 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Capturing Meeting Logic...</span>
                </div>
            )}
        </div>

        {/* SIDEBAR: Strategic Summaries */}
        <AnimatePresence>
            {summaries.length > 0 && (
                <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="absolute right-8 top-32 bottom-32 w-80 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md overflow-hidden flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Strategic Pulse</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {summaries.map((s) => (
                            <motion.div 
                                key={s.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-4 bg-white/5 border border-white/5 rounded-2xl relative"
                            >
                                <p className="text-xs text-neutral-300 leading-relaxed italic">
                                    "{s.text}"
                                </p>
                                <div className="mt-2 text-[8px] font-mono text-neutral-600">
                                    {s.timestamp.toLocaleTimeString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
