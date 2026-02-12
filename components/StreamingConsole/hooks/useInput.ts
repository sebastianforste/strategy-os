/**
 * useInput Hook
 * --------------
 * Handles input state, suggestions, signals, and dropping images.
 * Extracted from StreamingConsole for maintainability.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getSuggestions, Suggestion } from "../../../utils/suggestion-service";
import { Signal } from "../../../utils/signal-service";
import { getDynamicStarterChips } from "../../../utils/preferences-service";
import { ApiKeys } from "../../SettingsModal";

export interface InputOptions {
  apiKeys: ApiKeys;
  useNewsjack: boolean;
  initialValue: string;
}

export function useInput(options: InputOptions) {
  const { apiKeys, useNewsjack, initialValue } = options;

  const [input, setInput] = useState(initialValue);
  const [images, setImages] = useState<string[]>([]); // Base64 strings
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isFetchingSignals, setIsFetchingSignals] = useState(false);
  const [dynamicChips, setDynamicChips] = useState<any[]>([]);

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (input.length >= 5 && input.length < 100 && !input.includes("\n") && apiKeys.gemini) {
        try {
          const results = await getSuggestions(input, apiKeys.gemini);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (e) {
          console.error("Suggestions failed:", e);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [input, apiKeys.gemini]);

  // Load Personalized Starter Chips
  useEffect(() => {
    const chips = getDynamicStarterChips();
    if (chips.length > 0) {
      setDynamicChips(chips);
    }
  }, []);

  // Debounced Signal Fetching (Newsjacking)
  useEffect(() => {
    if (!useNewsjack || !apiKeys.gemini) {
      setSignals([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (input.length >= 4 && !input.includes("\n")) {
        setIsFetchingSignals(true);
        try {
          const res = await fetch("/api/signals", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ topic: input }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && Array.isArray((data as any).signals)) {
            setSignals((data as any).signals as Signal[]);
          } else {
            setSignals([]);
          }
        } catch (e) {
          console.error("Signal fetching failed:", e);
        } finally {
          setIsFetchingSignals(false);
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [input, useNewsjack, apiKeys.gemini]);

  // Dropzone logic
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const binaryStr = reader.result as string;
        setImages((prev) => [...prev, binaryStr]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    noClick: true, // We want the textarea to be clickable, not the whole area for file pick
  });

  const removeImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    input,
    setInput,
    images,
    setImages,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    signals,
    isFetchingSignals,
    dynamicChips,
    getRootProps,
    getInputProps,
    isDragActive,
    removeImage,
  };
}
