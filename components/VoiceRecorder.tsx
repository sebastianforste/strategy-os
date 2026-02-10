
"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, Play, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
}

export default function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing mic:", err);
            alert("Mic access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleTranscribe = async () => {
        if (!audioBlob) return;
        
        setIsTranscribing(true);
        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                
                const res = await fetch('/api/audio/transcribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audio: base64data, mimeType: audioBlob.type })
                });

                const data = await res.json();
                if (data.transcription) {
                    onTranscription(data.transcription);
                    handleReset();
                } else {
                    alert("Transcription failed.");
                }
                setIsTranscribing(false);
            };
        } catch (err) {
            console.error("Transcription error:", err);
            setIsTranscribing(false);
        }
    };

    const handleReset = () => {
        setAudioUrl(null);
        setAudioBlob(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-neutral-900/50 border border-white/5 rounded-2xl">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Voice Lab</h3>
            
            <div className="relative">
                <AnimatePresence mode="wait">
                    {!audioUrl ? (
                        <motion.button
                            key="record"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                                isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'
                            }`}
                        >
                            {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                        </motion.button>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-4"
                        >
                            <audio src={audioUrl} controls className="h-10 w-48 bg-transparent" />
                            <button 
                                onClick={handleReset}
                                className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700"
                            >
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {audioUrl && (
                <button
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-50"
                >
                    {isTranscribing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            TRANSCRIBING...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            SEND TO STRATEGY
                        </>
                    )}
                </button>
            )}

            {isRecording && (
                <p className="text-xs text-red-500 font-mono animate-pulse">RECORDING LIVE...</p>
            )}
        </div>
    );
}
