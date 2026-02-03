/**
 * Gemini Error Handling Utilities
 * ---------------------------------
 * Structured error handling for @google/genai SDK
 * Replaces legacy string-based `.includes()` checks
 */

/**
 * Gemini API Error Status Codes
 * Based on Google AI SDK v3+ error responses
 */
export enum GeminiErrorStatus {
  RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED", // Rate limit / quota exceeded
  INVALID_ARGUMENT = "INVALID_ARGUMENT",     // Bad request
  PERMISSION_DENIED = "PERMISSION_DENIED",   // API key issues
  NOT_FOUND = "NOT_FOUND",                   // Model not found
  INTERNAL = "INTERNAL",                     // Server error
  UNAVAILABLE = "UNAVAILABLE",               // Service temporarily down
  DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED",   // Timeout
}

/**
 * Extract structured error status from Gemini API error
 */
export function getGeminiErrorStatus(error: unknown): GeminiErrorStatus | null {
  if (!error) return null;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Check for structured error status (preferred)
  if (errorMessage.includes("RESOURCE_EXHAUSTED")) {
    return GeminiErrorStatus.RESOURCE_EXHAUSTED;
  }
  
  // Legacy fallback: string-based detection
  if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("rate limit")) {
    return GeminiErrorStatus.RESOURCE_EXHAUSTED;
  }
  
  if (errorString.includes("401") || errorString.includes("403") || errorString.includes("api key")) {
    return GeminiErrorStatus.PERMISSION_DENIED;
  }
  
  if (errorString.includes("404") || errorString.includes("not found")) {
    return GeminiErrorStatus.NOT_FOUND;
  }
  
  if (errorString.includes("400") || errorString.includes("invalid")) {
    return GeminiErrorStatus.INVALID_ARGUMENT;
  }
  
  if (errorString.includes("timeout") || errorString.includes("deadline")) {
    return GeminiErrorStatus.DEADLINE_EXCEEDED;
  }
  
  if (errorString.includes("503") || errorString.includes("unavailable")) {
    return GeminiErrorStatus.UNAVAILABLE;
  }
  
  if (errorString.includes("500") || errorString.includes("internal")) {
    return GeminiErrorStatus.INTERNAL;
  }
  
  return null;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  return getGeminiErrorStatus(error) === GeminiErrorStatus.RESOURCE_EXHAUSTED;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const status = getGeminiErrorStatus(error);
  return status === GeminiErrorStatus.RESOURCE_EXHAUSTED || 
         status === GeminiErrorStatus.UNAVAILABLE ||
         status === GeminiErrorStatus.DEADLINE_EXCEEDED;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const status = getGeminiErrorStatus(error);
  
  switch (status) {
    case GeminiErrorStatus.RESOURCE_EXHAUSTED:
      return "Rate limit exceeded. You've hit your Google Gemini quota. Please wait or try again later.";
    
    case GeminiErrorStatus.PERMISSION_DENIED:
      return "API key authentication failed. Please check your Gemini API key in Settings.";
    
    case GeminiErrorStatus.NOT_FOUND:
      return "Model not found. The requested AI model may not be available.";
    
    case GeminiErrorStatus.INVALID_ARGUMENT:
      return "Invalid request parameters. Please check your input and try again.";
    
    case GeminiErrorStatus.DEADLINE_EXCEEDED:
      return "Request timeout. The operation took too long. Please try again.";
    
    case GeminiErrorStatus.UNAVAILABLE:
      return "Service temporarily unavailable. Please try again in a moment.";
    
    case GeminiErrorStatus.INTERNAL:
      return "Internal server error. Please try again later.";
    
    default:
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      return errorMessage;
  }
}
