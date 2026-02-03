
import { describe, it, expect } from 'vitest';
import { 
  convertFloat32ToInt16, 
  convertInt16ToBase64, 
  decodeBase64ToFloat32, 
  calculateVolume 
} from '../utils/audio-utils';

describe('Audio Utilities', () => {
  it('should calculate volume (RMS) correctly', () => {
    const buffer = new Float32Array([0.5, -0.5, 0.5, -0.5]);
    const volume = calculateVolume(buffer);
    expect(volume).toBeCloseTo(0.5);
  });

  it('should convert Float32 to Int16 PCM correctly', () => {
    const input = new Float32Array([1.0, -1.0, 0.0]);
    const output = convertFloat32ToInt16(input);
    
    expect(output[0]).toBe(32767);  // Max Int16
    expect(output[1]).toBe(-32768); // Min Int16
    expect(output[2]).toBe(0);      // Zero
  });

  it('should convert Int16 to Base64 (Little Endian wrap)', () => {
    const pcm = new Int16Array([1, -1]);
    const base64 = convertInt16ToBase64(pcm);
    
    // 1 (Little Endian) = [0x01, 0x00]
    // -1 (Little Endian) = [0xFF, 0xFF]
    // Hex: 01 00 FF FF -> Base64: AQD//w==
    expect(base64).toBe('AQD//w==');
  });

  it('should round-trip Base64 to Float32 accurately', () => {
    // Generate base64 from max values [32767, -32768]
    const pcm = new Int16Array([32767, -32768]);
    const base64 = convertInt16ToBase64(pcm);
    const float32 = decodeBase64ToFloat32(base64);
    
    expect(float32.length).toBe(2);
    expect(float32[0]).toBeCloseTo(32767 / 32768, 5);
    expect(float32[1]).toBeCloseTo(-1.0, 5);
  });

  it('should handle silent buffers', () => {
    const silent = new Float32Array(100).fill(0);
    expect(calculateVolume(silent)).toBe(0);
    
    const pcm = convertFloat32ToInt16(silent);
    expect(pcm[0]).toBe(0);
    
    const b64 = convertInt16ToBase64(pcm);
    expect(decodeBase64ToFloat32(b64)[0]).toBe(0);
  });
});
