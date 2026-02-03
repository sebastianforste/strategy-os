
/**
 * AUDIO UTILS - Signal Processing for StrategyOS Voice Recorder
 * -----------------------------------------------------------
 * Optimized for high-fidelity vocal capture and server-side analysis.
 */

/**
 * Converts Float32 audio data to 16-bit PCM (Int16).
 * This is the standard format expected by the Gemini Live API.
 */
export function convertFloat32ToInt16(input: Float32Array): Int16Array {
  const pcmData = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcmData;
}

/**
 * Converts Int16 PCM data to a Base64 string for transmission over WebSocket.
 */
export function convertInt16ToBase64(pcmData: Int16Array): string {
  const buffer = pcmData.buffer;
  const uint8 = new Uint8Array(buffer);
  let binary = "";
  const len = uint8.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string back into Float32 audio data for playback.
 * Assumes 16-bit PCM Little Endian encoded as Base64.
 */
export function decodeBase64ToFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const float32Data = new Float32Array(bytes.length / 2);
  for (let i = 0; i < bytes.length; i += 2) {
    const int16 = (bytes[i + 1] << 8) | bytes[i]; // Little Endian
    float32Data[i / 2] = int16 >= 0x8000 ? -(0x10000 - int16) / 0x8000 : int16 / 0x8000;
  }
  return float32Data;
}

/**
 * Calculates the RMS (Root Mean Square) volume level of an audio buffer.
 * Returns a value between 0 and 1.
 */
export function calculateVolume(input: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += input[i] * input[i];
  }
  return Math.sqrt(sum / input.length);
}
