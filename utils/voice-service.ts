/**
 * VOICE SERVICE - 2030 Interface
 * ------------------------------
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS)
 * using standard Web Speech API for low-latency companionship.
 */

export class VoiceService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  /**
   * START LISTENING
   */
  public listen(onResult: (text: string, isFinal: boolean) => void, onError: (err: unknown) => void) {
    if (!this.recognition) {
      onError("Speech Recognition not supported in this browser.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      onResult(text, result.isFinal);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => onError(event.error);
    this.recognition.start();
  }

  /**
   * STOP LISTENING
   */
  public stop() {
    if (this.recognition) this.recognition.stop();
  }

  /**
   * SPEAK (TTS)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public speak(text: string, _voiceName?: string) {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a high-status voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Daniel") || v.localService);
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 0.9; // Slightly lower for authority

    this.synthesis.speak(utterance);
  }
}

export const voiceService = new VoiceService();
