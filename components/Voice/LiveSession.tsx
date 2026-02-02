"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, X, Activity, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveSessionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveSession({ isOpen, onClose }: LiveSessionProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
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
        // Decode base64 to buffer
        const binaryString = window.atob(chunk);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert PCM 16kHz Little Endian to Float32
        // Assuming Gemini sends PCM directly? Or WAV?
        // Actually, Gemini sends raw PCM. We need to construct an AudioBuffer.
        // Simplified approach: Decode via AudioContext if headerless, else standard decode.
        
        // NOTE: For robustness, we might need a PCM decoder helper if decodeAudioData fails on raw PCM.
        // Let's assume standard decoding for now, but Gemini typically sends raw PCM.
        
        // Create AudioBuffer from PCM data (assuming 24000Hz or 16000Hz 16-bit mono)
        // Gemini Live defaults: 24kHz, 1 channel, PCM.
        
        const float32Data = new Float32Array(bytes.length / 2);
        for (let i = 0; i < bytes.length; i += 2) {
           const int16 = (bytes[i + 1] << 8) | bytes[i]; // Little Endian
           float32Data[i / 2] = int16 >= 0x8000 ? -(0x10000 - int16) / 0x8000 : int16 / 0x8000;
        }

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
        startMicrophone();
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
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
    setStatus("disconnected");
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

      const source = audioContextRef.current!.createMediaStreamSource(stream);
      // Processor: bufferSize 512, 1 input, 1 output
      const processor = audioContextRef.current!.createScriptProcessor(512, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0); // Float32
        
        // Calculate volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        setVolumeLevel(Math.sqrt(sum / inputData.length));

        // Convert to PCM 16-bit
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Base64 encode
        const base64Audio = btoa(
          new Uint8Array(pcmData.buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        // Send to Gemini
        wsRef.current.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{
              mimeType: "audio/pcm",
              data: base64Audio
            }]
          }
        }));
      };

      source.connect(processor);
      processor.connect(audioContextRef.current!.destination); // Connect to dest to keep alive (mute output)

    } catch (e) {
      console.error("Mic access denied", e);
    }
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
        <div className="flex items-center gap-6">
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-6 rounded-3xl transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
        </div>

      </motion.div>
    </div>
  );
}
