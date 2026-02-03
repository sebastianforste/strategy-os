"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Activity } from "lucide-react";

/**
 * GEMINI LIVE API CONFIG
 */
const URI = "ws://localhost:8080";

interface LiveVoiceConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveVoiceConsole({ isOpen, onClose }: LiveVoiceConsoleProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // User is speaking
  const [isAIResponding, setIsAIResponding] = useState(false); // AI is speaking
  const [status, setStatus] = useState("Initializing Red Phone...");
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize Connection when opened
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    startSession();

    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    setIsConnected(false);
  };

  const startSession = async () => {
    try {
      setStatus("Dialing secure line...");
      
      const ws = new WebSocket(URI);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("Connected to The Council.");
        setIsConnected(true);
        // Send initial setup if needed (Model config, Voice settings)
        // Send initial setup
        ws.send(JSON.stringify({
            setup: {
                generation_config: {
                    response_modalities: ["AUDIO"]
                }
            }
        }));
        
        // Start Microphone
        setupAudioInput();
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        // Handle ServerContent
        if (data.serverContent?.modelTurn?.parts) {
            setIsAIResponding(true);
            const parts = data.serverContent.modelTurn.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith("audio/pcm")) {
                    const pcmData = base64ToFloat32(part.inlineData.data);
                    queueAudio(pcmData);
                }
            }
        }
        
        if (data.serverContent?.turnComplete) {
            setIsAIResponding(false);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket Error:", e);
        setStatus("Connection Failed.");
      };
      
      ws.onclose = () => {
          setStatus("Call Ended.");
          setIsConnected(false);
      }

    } catch (e) {
      console.error("Session Start Error:", e);
      setStatus("Error starting session.");
    }
  };

  const setupAudioInput = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000, // Gemini prefers 16kHz
      });
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: {
              channelCount: 1,
              sampleRate: 16000
          }
      });
      
      const context = audioContextRef.current;
      sourceRef.current = context.createMediaStreamSource(streamRef.current);
      
      // Use ScriptProcessor for raw PCM access (Worklet is better but more complex for single file MVP)
      processorRef.current = context.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Detect silence/speaking for UI
          const volume = inputData.reduce((acc, val) => acc + Math.abs(val), 0) / inputData.length;
          setIsSpeaking(volume > 0.01);

          // Convert Float32 to Base64 PCM16
          const pcm16 = floatTo16BitPCM(inputData);
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          
          if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                  realtimeInput: {
                      mediaChunks: [{
                          mimeType: "audio/pcm",
                          data: base64Audio
                      }]
                  }
              }));
          }
      };
      
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(context.destination); // Mute self? Usually needed to keep processor alive
      
    } catch (e) {
        console.error("Mic Error:", e);
        setStatus("Microphone Access Denied.");
    }
  };

  // --- AUDIO HELPERS ---

  function floatTo16BitPCM(output: Float32Array) {
      const buffer = new ArrayBuffer(output.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < output.length; i++) {
          const s = Math.max(-1, Math.min(1, output[i]));
          view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      return new Int16Array(buffer);
  }

  function base64ToFloat32(base64: string) {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
          float32[i] = pcm16[i] / 32768; // Normalize to -1.0 to 1.0
      }
      return float32;
  }

  // --- AUDIO PLAYBACK QUEUE ---
  
  const queueAudio = (pcmData: Float32Array) => {
      audioQueueRef.current.push(pcmData);
      if (!isPlayingRef.current) {
          playNextChunk();
      }
  };
  
  const playNextChunk = () => {
      if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          return;
      }
      
      isPlayingRef.current = true;
      const chunk = audioQueueRef.current.shift();
      const context = audioContextRef.current;
      
      if (!context || !chunk) return;
      
      const buffer = context.createBuffer(1, chunk.length, 24000); // Gemini output is usually 24k
      buffer.getChannelData(0).set(chunk);
      
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = playNextChunk;
      source.start();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl">
        <div className="relative w-full max-w-md p-8 bg-zinc-900 border border-red-900/50 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.2)]">
            
            {/* Status Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-zinc-400 text-sm font-mono tracking-widest uppercase">{status}</span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                    <PhoneOff size={20} />
                </button>
            </div>
            
            {/* Visualizer */}
            <div className="h-32 flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className={`w-2 bg-gradient-to-t from-red-600 to-red-400 rounded-full transition-all duration-75`}
                        style={{
                            height: isAIResponding 
                                ? `${Math.random() * 100}%` 
                                : isSpeaking ? `${Math.random() * 40}%` : "4px",
                            opacity: isAIResponding || isSpeaking ? 1 : 0.2
                        }}
                    />
                ))}
            </div>
            
            {/* Controls */}
            <div className="mt-12 flex justify-center">
                <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                   <Activity className={`w-8 h-8 text-red-500 ${isConnected ? "animate-pulse" : ""}`} />
                </div>
            </div>
            
            <p className="mt-8 text-center text-zinc-600 text-xs font-mono">
                ENCRYPTED CONNECTION • 24KHZ SEQUENTIAL • THE COUNCIL IS LISTENING
            </p>

        </div>
    </div>
  );
}
