import { useState, useEffect, useCallback, useRef } from 'react';

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Window interface extension
interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript) {
                setTranscript(finalTranscript);
            }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
             // Optional: auto-restart
        };
      }
      
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
            setIsListening(true);
            setTranscript(""); 
        } catch (e) {
            console.error("Error starting recognition:", e);
        }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (synthesisRef.current) {
      // Cancel any current speech
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      
      // Select a better voice if available
      const voices = synthesisRef.current.getVoices();
      // Try to find a "Google US English" or similar "premium" sounding voice
      const preferredVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("en-US")) || voices.find(v => v.lang.includes("en-US"));
      if (preferredVoice) utterance.voice = preferredVoice;

      synthesisRef.current.speak(utterance);
      setIsSpeaking(true);
    }
  }, []);

  const cancelSpeech = useCallback(() => {
      if (synthesisRef.current) {
          synthesisRef.current.cancel();
          setIsSpeaking(false);
      }
  }, []);

  return {
    isListening,
    transcript,
    setTranscript, // Allow manual clear
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    isSpeaking,
    hasSupport: typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  };
}
