/**
 * useGeneration Hook
 * ------------------
 * Handles text, video, and audio generation logic.
 * Extracted from StreamingConsole for maintainability.
 */

import { useState, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import { ApiKeys } from "../../SettingsModal";
import { PersonaId, Persona } from "../../../utils/personas";
import { GeneratedAssets } from "../../../utils/ai-service";
import { Signal } from "../../../utils/signal-service";
import { generateSideAssetsAction } from "../../../actions/generate";
import { runSwarmDebate, SwarmMessage } from "../../../utils/swarm-service";
import { generateVideoScript, formatVideoScriptForDisplay } from "../../../utils/video-service";
import { generateAudioScript, formatAudioScriptForDisplay } from "../../../utils/audio-service";
import { voiceService } from "../../../utils/voice-service";
import { recordTopicUsage } from "../../../utils/preferences-service";
import { logAudit } from "../../../utils/audit-service";
import { isRateLimitError, getErrorMessage } from "../../../utils/gemini-errors";
import { StyleMemoryService } from "../../../utils/style-memory-service";

export interface GenerationOptions {
  apiKeys: ApiKeys;
  personaId: PersonaId;
  useNewsjack: boolean;
  useRAG: boolean;
  useFewShot: boolean;
  useSwarm: boolean;
  platform: "linkedin" | "twitter";
  images: string[];
  signals: Signal[];
  trainingExamples: string;
  isTeamMode: boolean;
  coworkerName?: string;
  coworkerRole?: string;
  coworkerRelation?: string;
  customPersonas: Persona[];
  outputFormat: "text" | "video" | "audio";
  onGenerationComplete: (result: string | GeneratedAssets) => void;
  onError?: (msg: string) => void;
}

export interface GenerationState {
  isSwarmRunning: boolean;
  swarmMessages: SwarmMessage[];
  activeSwarmRole: string | null;
  isMultiModalLoading: boolean;
  localError: string | null;
}

export function useGeneration(options: GenerationOptions) {
  const {
    apiKeys,
    personaId,
    useNewsjack,
    useRAG,
    useFewShot,
    useSwarm,
    platform,
    images,
    signals,
    trainingExamples,
    isTeamMode,
    coworkerName,
    coworkerRole,
    coworkerRelation,
    customPersonas,
    outputFormat,
    onGenerationComplete,
    onError,
  } = options;

  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [swarmMessages, setSwarmMessages] = useState<SwarmMessage[]>([]);
  const [activeSwarmRole, setActiveSwarmRole] = useState<string | null>(null);
  const [isMultiModalLoading, setIsMultiModalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Vercel AI SDK useCompletion hook
  const { complete, completion, isLoading, setCompletion, stop } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
    body: {
      apiKeys,
      personaId,
      forceTrends: useNewsjack,
      useRAG,
      platform,
      images,
      signals,
      isTeamMode,
      coworkerName,
      coworkerRole,
      coworkerRelation,
      fewShotExamples: useFewShot ? trainingExamples : undefined,
      customPersona: customPersonas.find((p) => p.id === personaId),
      subStyle: customPersonas.find((p) => p.id === personaId)?.subStyle,
    },
    onFinish: (_prompt: string, result: string) => {
      if (result && result.length > 5) {
        // Auto-speak first 150 chars
        voiceService.speak(
          "Strategy generated. Reviewing the first few lines: " + result.substring(0, 150)
        );

        onGenerationComplete(result);
        
        if (apiKeys.gemini) {
          generateSideAssetsAction(result, { gemini: apiKeys.gemini }, personaId)
            .then((sideAssets) => {
              onGenerationComplete({
                textPost: result,
                ...sideAssets,
              });
            })
            .catch((e) => console.error("Side asset generation failed:", e));
        }

        // Final audit log
        logAudit({
          action: "generate_complete",
          input: _prompt.substring(0, 50),
          output: result.substring(0, 100),
          personaId,
          platform,
          durationMs: startTime ? Date.now() - startTime : 0,
          metadata: { swarmEnabled: useSwarm },
        });
      } else {
        setLocalError("Generation failed (Empty Output). Please try again or check settings.");
      }
    },
    onError: (err: unknown) => {
      console.error("Streaming Error:", err);
      const msg = err instanceof Error ? err.message : "Streaming failed";
      const userMsg = isRateLimitError(err) 
        ? "Rate Limit Exceeded. You've hit your Google Gemini Free Tier daily limit. Please wait or try again later."
        : getErrorMessage(err);
      setLocalError(userMsg);
      if (onError) onError(userMsg);
    },
  });

  const handleGenerate = useCallback(
    async (input: string) => {
      if (!input.trim() && images.length === 0) return;

      if (!apiKeys.gemini) {
        const msg = "Gemini API Key is required. Please configure it in Settings.";
        setLocalError(msg);
        if (onError) onError(msg);
        return;
      }

      setLocalError(null);
      recordTopicUsage(input);

      // Multi-Modal: Video/Audio
      if (outputFormat === "video") {
        setIsMultiModalLoading(true);
        try {
          const script = await generateVideoScript(input, "linkedin", apiKeys.gemini);
          onGenerationComplete(formatVideoScriptForDisplay(script));
        } catch (e) {
          console.error("Video generation failed:", e);
          setLocalError("Video script generation failed.");
        } finally {
          setIsMultiModalLoading(false);
        }
        return;
      }

      if (outputFormat === "audio") {
        setIsMultiModalLoading(true);
        try {
          const script = await generateAudioScript(input, "professional", apiKeys.gemini);
          onGenerationComplete(formatAudioScriptForDisplay(script));
        } catch (e) {
          console.error("Audio generation failed:", e);
          setLocalError("Audio script generation failed.");
        } finally {
          setIsMultiModalLoading(false);
        }
        return;
      }

      // Text Generation with optional Swarm
      let promptToUse = input;

      if (useSwarm) {
        setIsSwarmRunning(true);
        setSwarmMessages([]);
        try {
          const result = await runSwarmDebate(input, "", apiKeys.gemini, (m) => {
            setSwarmMessages((prev) => [...prev, m]);
            setActiveSwarmRole(m.agent);
          });
          promptToUse = result.hardenedConcept;
        } catch (e) {
          console.error("Swarm debate failed:", e);
          setLocalError("Council debate failed. Proceeding with original concept.");
        } finally {
          setIsSwarmRunning(false);
          setActiveSwarmRole(null);
        }
      }

      setStartTime(Date.now());

      // Log audit
      logAudit({
        action: "generate",
        input: input.substring(0, 50),
        output: "Generation started...",
        personaId,
        platform,
        durationMs: 0,
        metadata: { swarmEnabled: useSwarm },
      });

      // Fetch style memory instructions
      const styleService = new StyleMemoryService(apiKeys.gemini);
      const styleInstructions = styleService.getPersonaInstructions(personaId);

      // Invoke streaming completion
      complete(promptToUse, {
        body: {
          styleMemory: styleInstructions
        }
      });
    },
    [
      apiKeys,
      personaId,
      useNewsjack,
      useRAG,
      useFewShot,
      useSwarm,
      platform,
      images,
      signals,
      trainingExamples,
      customPersonas,
      outputFormat,
      onGenerationComplete,
      onError,
      complete,
    ]
  );

  return {
    // Generation function
    handleGenerate,
    stop,
    setCompletion,

    // Completion state
    completion,
    isLoading,

    // Swarm state
    isSwarmRunning,
    swarmMessages,
    activeSwarmRole,
    setSwarmMessages,
    setActiveSwarmRole,
    setIsSwarmRunning,

    // Multi-modal state
    isMultiModalLoading,

    // Error state
    localError,
    setLocalError,
  };
}
