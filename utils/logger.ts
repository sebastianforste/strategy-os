/**
 * LOGGER SERVICE - Structured Logging
 * -----------------------------------
 * Production-grade logging with environment awareness.
 * Replaces 50+ console.log statements with structured output.
 * 
 * In development: Logs to console with color coding
 * In production: Logs are minimized (errors only) or piped to external service
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== "production";

// Color codes for terminal output
const colors = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m",  // Green
  warn: "\x1b[33m",  // Yellow
  error: "\x1b[31m", // Red
  reset: "\x1b[0m",
};

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

function formatJson(level: LogLevel, message: string, context?: LogContext): string {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...(context ? context : {}),
  });
}

function emit(level: LogLevel, message: string, context?: LogContext) {
  if (isDev) {
    const formatted = formatMessage(level, message, context);
    if (level === "debug") console.log(`${colors.debug}${formatted}${colors.reset}`);
    else if (level === "info") console.log(`${colors.info}${formatted}${colors.reset}`);
    else if (level === "warn") console.warn(`${colors.warn}${formatted}${colors.reset}`);
    else console.error(`${colors.error}${formatted}${colors.reset}`);
    return;
  }

  // Production: JSON lines, debug suppressed by default.
  if (level === "debug") return;
  const line = formatJson(level, message, context);
  if (level === "warn") console.warn(line);
  else if (level === "error") console.error(line);
  else console.log(line);
}

/**
 * Main logger object
 */
export const logger = {
  /**
   * Debug level - only in development
   */
  debug: (message: string, context?: LogContext) => {
    emit("debug", message, context);
  },

  /**
   * Info level - important operational events
   */
  info: (message: string, context?: LogContext) => {
    emit("info", message, context);
  },

  /**
   * Warn level - recoverable issues
   */
  warn: (message: string, context?: LogContext) => {
    emit("warn", message, context);
  },

  /**
   * Error level - always logged
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const errorDetails = error instanceof Error 
      ? { errorMessage: error.message, stack: error.stack }
      : { errorRaw: error };
    
    emit("error", message, { ...context, ...errorDetails });

    // In production, send to error tracking (Sentry, etc.)
    // if (!isDev && typeof window !== 'undefined') {
    //   Sentry.captureException(error);
    // }
  },

  /**
   * Performance timing helper
   */
  time: (label: string) => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  /**
   * Scoped logger for a specific service
   */
  scope: (serviceName: string) => ({
    debug: (msg: string, ctx?: LogContext) => logger.debug(`[${serviceName}] ${msg}`, ctx),
    info: (msg: string, ctx?: LogContext) => logger.info(`[${serviceName}] ${msg}`, ctx),
    warn: (msg: string, ctx?: LogContext) => logger.warn(`[${serviceName}] ${msg}`, ctx),
    error: (msg: string, err?: Error | unknown, ctx?: LogContext) => 
      logger.error(`[${serviceName}] ${msg}`, err, ctx),
  }),

  with: (base: LogContext) => ({
    debug: (msg: string, ctx?: LogContext) => logger.debug(msg, { ...base, ...ctx }),
    info: (msg: string, ctx?: LogContext) => logger.info(msg, { ...base, ...ctx }),
    warn: (msg: string, ctx?: LogContext) => logger.warn(msg, { ...base, ...ctx }),
    error: (msg: string, err?: Error | unknown, ctx?: LogContext) => logger.error(msg, err, { ...base, ...ctx }),
    scope: (serviceName: string) => ({
      debug: (msg: string, ctx?: LogContext) => logger.debug(`[${serviceName}] ${msg}`, { ...base, ...ctx }),
      info: (msg: string, ctx?: LogContext) => logger.info(`[${serviceName}] ${msg}`, { ...base, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => logger.warn(`[${serviceName}] ${msg}`, { ...base, ...ctx }),
      error: (msg: string, err?: Error | unknown, ctx?: LogContext) =>
        logger.error(`[${serviceName}] ${msg}`, err, { ...base, ...ctx }),
    }),
  }),
};

// Pre-scoped loggers for common services
export const aiLogger = logger.scope("AI");
export const swarmLogger = logger.scope("Swarm");
export const researchLogger = logger.scope("Research");
export const apiLogger = logger.scope("API");
