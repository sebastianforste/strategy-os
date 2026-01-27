import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Volume2, Sparkles, StopCircle } from "lucide-react";
import { useSpeech } from "../hooks/use-speech";
import { useCompletion } from "@ai-sdk/react";

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export default function VoiceConversationModal({
  isOpen,
  onClose,
  apiKey,
}: VoiceConversationModalProps) {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    speak, 
    cancelSpeech,
    isSpeaking,
    setTranscript,
    hasSupport 
  } = useSpeech();

  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/generate",
    body: {
        apiKeys: { gemini: apiKey },
        personaId: 'cso', // Always use CSO for voice
        prompt: transcript,
        platform: 'linkedin' // dummy param
    },
    onFinish: (result) => {
        setConversationState('speaking');
        speak(result, () => {
             setConversationState('idle');
             // Auto-listen again? Maybe excessive for MVP. Let's keep it manual push-to-talk-ish or toggle.
        });
    }
  });

  // Effect to trigger generation when user stops speaking (detected by silence or manual stop)
  // For MVP: We'll use a manual "Done" or wait for a pause.
  // Actually, standard SpeechRecognition is tricky with "end of speech".
  // Let's implement a simple "Silence Detection" or just use the transcript update.
  
  useEffect(() => {
      // If we have a transcript and stop listening, trigger AI
      if (!isListening && transcript && conversationState === 'listening') {
          setConversationState('thinking');
          complete(transcript);
      }
  }, [isListening, transcript, conversationState, complete]);

  // Handle Modal Close
  useEffect(() => {
      if (!isOpen) {
          stopListening();
          cancelSpeech();
          setConversationState('idle');
      }
  }, [isOpen, stopListening, cancelSpeech]);
  
  const toggleListening = () => {
      if (isListening) {
          stopListening();
          // The effect above will catch !isListening + transcript and trigger 'thinking'
      } else {
          cancelSpeech(); // Stop AI if speaking
          setTranscript(""); // Clear previous
          setConversationState('listening');
          startListening();
      }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
         {/* Close Button */}
         <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-500 hover:text-white p-2"
          >
             <X className="w-6 h-6" />
         </button>

        <div className="flex flex-col items-center justify-center w-full max-w-lg text-center space-y-12">
            
            {/* Visualizer / Avatar */}
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Back Glow */}
                <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${
                    conversationState === 'listening' ? 'bg-blue-500/40' :
                    conversationState === 'thinking' ? 'bg-purple-500/40' :
                    conversationState === 'speaking' ? 'bg-green-500/40' :
                    'bg-neutral-500/10'
                }`} />

                {/* Main Orb */}
                <motion.div 
                    animate={{
                        scale: conversationState === 'listening' ? [1, 1.1, 1] : 
                               conversationState === 'speaking' ? [1, 1.2, 0.9, 1] : 1,
                        rotate: conversationState === 'thinking' ? 360 : 0
                    }}
                    transition={{
                        duration: conversationState === 'thinking' ? 2 : 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`relative w-32 h-32 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-colors duration-500 ${
                        conversationState === 'listening' ? 'border-blue-400 bg-blue-500/10 text-blue-400' :
                        conversationState === 'thinking' ? 'border-purple-400 bg-purple-500/10 text-purple-400' :
                        conversationState === 'speaking' ? 'border-green-400 bg-green-500/10 text-green-400' :
                        'border-neutral-700 bg-neutral-800 text-neutral-500'
                    }`}
                >
                    {conversationState === 'listening' && <Mic className="w-12 h-12" />}
                    {conversationState === 'thinking' && <Sparkles className="w-12 h-12" />}
                    {conversationState === 'speaking' && <Volume2 className="w-12 h-12" />}
                    {conversationState === 'idle' && <MicOff className="w-12 h-12" />}
                </motion.div>
                
                {/* Ripples */}
                {conversationState === 'speaking' && (
                    <>
                         <div className="absolute inset-0 border border-green-500/30 rounded-full animate-ping" />
                         <div className="absolute inset-0 border border-green-500/20 rounded-full animate-ping delay-150" />
                    </>
                )}
            </div>

            {/* Transcription / Status Text */}
            <div className="space-y-4 max-w-md w-full min-h-[100px]">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                    {conversationState === 'listening' ? "Listening..." :
                     conversationState === 'thinking' ? "Thinking..." :
                     conversationState === 'speaking' ? "Speaking..." :
                     "Ready"}
                </h3>
                
                <p className="text-neutral-400 text-lg leading-relaxed">
                    {conversationState === 'listening' ? (transcript || "Say something...") :
                     conversationState === 'thinking' ? "Processing your strategy..." :
                     conversationState === 'speaking' ? completion :
                     "Tap the microphone to start."}
                </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <button
                    onClick={toggleListening}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isListening 
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                            : 'bg-white hover:bg-neutral-200 text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                    }`}
                >
                    {isListening ? <StopCircle className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
            </div>
            
             {!hasSupport && (
                 <p className="text-red-500 text-sm">Browser does not support Web Speech API</p>
             )}
        </div>
      </div>
    </AnimatePresence>
  );
}
