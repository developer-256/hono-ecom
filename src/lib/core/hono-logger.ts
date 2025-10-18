import { nanoid } from "nanoid";
import { Sentry } from "./sentry";
import env from "../../env";

/**
 * NOTE: Sentry profiling is disabled for Bun compatibility
 * The @sentry/profiling-node package uses libuv functions not supported by Bun
 * All other Sentry features (error tracking, performance monitoring, logging) work normally
 */

/**
 * ANSI color codes for console message formatting
 * Provides colored output for different log levels
 */
const COLORS = {
  Reset: "\x1b[0m",
  Dim: "\x1b[2m",
  hex: (hex: string, bg = false) => hexToAnsi(hex, bg),
};

/**
 * Mapping of internal log levels to Sentry severity levels
 * Ensures consistency between our logger and Sentry's expected levels
 */
const SENTRY_LEVELS = {
  error: "error" as const,
  warn: "warning" as const,
  log: "info" as const,
  debug: "debug" as const,
  verbose: "debug" as const,
};

/**
 * Type for structured log context data
 */
type LogContext = Record<string, any>;

/**
 * Formats an object for pretty console output
 */
const formatContext = (context?: LogContext): string => {
  if (!context || Object.keys(context).length === 0) return "";

  try {
    return `\n${JSON.stringify(context, null, 2)}`;
  } catch (error) {
    return `\n[Context serialization failed: ${
      error instanceof Error ? error.message : "Unknown error"
    }]`;
  }
};

/**
 * Creates a structured log entry for both console and Sentry
 */
const createLogEntry = (
  level: keyof typeof SENTRY_LEVELS,
  message: string,
  context?: LogContext
) => {
  const logId = ["error", "warn", "verbose"].includes(level)
    ? nanoid()
    : undefined;
  const timestamp = new Date().toUTCString();
  const contextStr = formatContext(context);

  return {
    logId,
    timestamp,
    level,
    message,
    context: context || {},
    contextStr,
    fullMessage: `${message}${contextStr}`,
  };
};

/**
 * Standard Hono logger function for HTTP request logging
 * Used with Hono's built-in logger middleware
 *
 * @param message - The main log message
 * @param rest - Additional message parts to be joined
 *
 * @example
 * ```typescript
 * app.use(logger(HonoLogger));
 * ```
 */
export const logger = (message: string, ...rest: string[]) => {
  console.log(
    `${COLORS.Dim}[${new Date().toUTCString()}]:${COLORS.Reset} ${message}`,
    `${rest.join(" ")}`
  );
};

/**
 * Converts a hex color code to ANSI escape sequence
 *
 * @param hex - Hex color code (e.g., "#ff0000")
 * @param isBg - Whether to apply as background color
 * @returns ANSI escape sequence for the color
 */
const hexToAnsi = (hex: string, isBg = false) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[${isBg ? 48 : 38};2;${r};${g};${b}m`;
};

/**
 * Enhanced Structured Logger with Sentry Integration
 *
 * This logger provides both console output and optional Sentry integration with support for
 * structured logging. Context data is automatically formatted for console readability and
 * sent as structured data to Sentry for better analysis and filtering.
 *
 * @example Basic Usage (Simple Messages)
 * ```typescript
 * import { logger } from "./lib/core/hono-logger";
 *
 * logger.error("Something went wrong");
 * logger.warn("This is a warning");
 * logger.log("Information message");
 * logger.debug("Debug information");
 * logger.verbose("Verbose output");
 * ```
 *
 * @example Structured Logging (RECOMMENDED)
 * ```typescript
 * // Error with rich context
 * logger.error("Payment processing failed", {
 *   userId: "123",
 *   orderId: "order_456",
 *   amount: 100,
 *   currency: "USD",
 *   errorCode: "PAYMENT_DECLINED"
 * });
 *
 * // Warning with system context
 * logger.warn("High memory usage detected", {
 *   currentUsage: "85%",
 *   threshold: "80%",
 *   availableMemory: "2.1GB",
 *   processId: 1234
 * });
 *
 * // Info with user activity
 * logger.log("User logged in", {
 *   userId: "123",
 *   email: "user@example.com",
 *   loginMethod: "google",
 *   userAgent: "Mozilla/5.0...",
 *   timestamp: new Date().toISOString()
 * });
 * ```
 *
 * @example Sentry-specific methods
 * ```typescript
 * // Capture exception with context
 * logger.sentry.captureException(new Error("Custom error"), {
 *   userId: "123",
 *   action: "payment"
 * });
 *
 * // Set user context
 * logger.sentry.setUser({
 *   id: "123",
 *   email: "user@example.com"
 * });
 *
 * // Add custom context
 * logger.sentry.setContext("payment", {
 *   amount: 100,
 *   currency: "USD"
 * });
 *
 * // Add tags for filtering
 * logger.sentry.setTag("feature", "checkout");
 * ```
 */
export const HONO_LOGGER = {
  /**
   * Log error messages to console only
   * Use HONO_LOGGER.sentry methods for explicit Sentry reporting
   *
   * @param message - The main error message
   * @param context - Optional structured context data
   *
   * @example
   * ```typescript
   * // Simple message
   * logger.error("Database connection failed");
   *
   * // With structured context
   * logger.error("Payment processing failed", {
   *   userId: "123",
   *   amount: 100,
   *   currency: "USD",
   *   errorCode: "PAYMENT_DECLINED"
   * });
   * ```
   */
  error: (message: string, context?: LogContext) => {
    const logEntry = createLogEntry("error", message, context);

    // Console logging only - no automatic Sentry integration
    console.log(
      `${COLORS.Dim}[${logEntry.timestamp}]: ${logEntry.logId} -${
        COLORS.Reset
      }${COLORS.hex("#d11824ff")} ERROR - ${logEntry.fullMessage}${
        COLORS.Reset
      }`
    );
  },

  /**
   * Log debug messages to console only
   *
   * @param message - The main debug message
   * @param context - Optional structured context data
   *
   * @example
   * ```typescript
   * // Simple message
   * logger.debug("Processing user data");
   *
   * // With structured context
   * logger.debug("User data processing", {
   *   step: "validation",
   *   userId: "123",
   *   processingTime: "150ms"
   * });
   * ```
   */
  debug: (message: string, context?: LogContext) => {
    const logEntry = createLogEntry("debug", message, context);

    // Console logging only - no automatic Sentry integration
    console.log(
      `${COLORS.Dim}[${logEntry.timestamp}]: -${COLORS.Reset}${COLORS.hex(
        "#da61e7ff"
      )} DEBUG - ${logEntry.fullMessage}${COLORS.Reset}`
    );
  },

  /**
   * Log informational messages to console only
   *
   * @param message - The main info message
   * @param context - Optional structured context data
   *
   * @example
   * ```typescript
   * // Simple message
   * logger.log("User authentication successful");
   *
   * // With structured context
   * logger.log("User logged in", {
   *   userId: "123",
   *   email: "user@example.com",
   *   loginMethod: "google",
   *   timestamp: new Date().toISOString()
   * });
   * ```
   */
  log: (message: string, context?: LogContext) => {
    const logEntry = createLogEntry("log", message, context);

    // Console logging only - no automatic Sentry integration
    console.log(
      `${COLORS.Dim}[${logEntry.timestamp}]: -${COLORS.Reset}${COLORS.hex(
        "#22b872ff"
      )} LOG - ${logEntry.fullMessage}${COLORS.Reset}`
    );
  },

  /**
   * Log informational messages to console only (alias for log)
   *
   * @param message - The main info message
   * @param context - Optional structured context data
   *
   * @example
   * ```typescript
   * // Simple message
   * logger.info("User authentication successful");
   *
   * // With structured context
   * logger.info("User logged in", {
   *   userId: "123",
   *   email: "user@example.com",
   *   loginMethod: "google",
   *   timestamp: new Date().toISOString()
   * });
   * ```
   */
  info: (message: string, context?: LogContext) => {
    const logEntry = createLogEntry("log", message, context);

    // Console logging only - no automatic Sentry integration
    console.log(
      `${COLORS.Dim}[${logEntry.timestamp}]: -${COLORS.Reset}${COLORS.hex(
        "#22b872ff"
      )} INFO - ${logEntry.fullMessage}${COLORS.Reset}`
    );
  },

  /**
   * Log warning messages to console only
   * Use HONO_LOGGER.sentry methods for explicit Sentry reporting
   *
   * @param message - The main warning message
   * @param context - Optional structured context data
   *
   * @example
   * ```typescript
   * // Simple message
   * logger.warn("API rate limit approaching");
   *
   * // With structured context
   * logger.warn("Rate limit exceeded", {
   *   endpoint: "/api/users",
   *   currentRate: 95,
   *   maxRate: 100,
   *   timeWindow: "1m",
   *   clientIp: "192.168.1.1"
   * });
   * ```
   */
  warn: (message: string, context?: LogContext) => {
    const logEntry = createLogEntry("warn", message, context);

    // Console logging only - no automatic Sentry integration
    console.log(
      `${COLORS.Dim}[${logEntry.timestamp}]: ${logEntry.logId} -${
        COLORS.Reset
      }${COLORS.hex("#bb7339ff")} WARN - ${logEntry.fullMessage}${COLORS.Reset}`
    );
  },

  /**
   * Log verbose messages to console only
   *
   * @param message - The main verbose message
   * @param context - Optional structured context data
   *
   * @example
   * ```typescript
   * // Simple message
   * logger.verbose("Detailed processing information");
   *
   * // With structured context
   * logger.verbose("Database query performance", {
   *   query: "SELECT * FROM users WHERE...",
   *   executionTime: "45ms",
   *   memoryUsage: "12MB",
   *   rowsReturned: 150,
   *   cacheHit: false
   * });
   * ```
   */
  verbose: (message: string, context?: LogContext) => {
    const logEntry = createLogEntry("verbose", message, context);

    // Console logging only - no automatic Sentry integration
    console.log(
      `${COLORS.Dim}[${logEntry.timestamp}]: ${logEntry.logId} -${
        COLORS.Reset
      }${COLORS.hex("#33c7de")} VERBOSE - ${logEntry.fullMessage}${
        COLORS.Reset
      }`
    );
  },

  /**
   * Sentry-specific methods grouped under the `sentry` namespace
   *
   * These methods provide direct access to Sentry functionality for advanced usage.
   * All methods are no-ops when Sentry is disabled via environment configuration.
   *
   * @example
   * ```typescript
   * // Capture exception with context
   * logger.sentry.captureException(new Error("Custom error"), {
   *   userId: "123",
   *   action: "payment"
   * });
   *
   * // Set user context
   * logger.sentry.setUser({
   *   id: "123",
   *   email: "user@example.com"
   * });
   *
   * // Add custom context
   * logger.sentry.setContext("payment", {
   *   amount: 100,
   *   currency: "USD"
   * });
   *
   * // Add tags for filtering
   * logger.sentry.setTag("feature", "checkout");
   * ```
   */
  sentry: {
    /**
     * Capture an exception directly to Sentry with optional context
     *
     * @param error - The error object to capture
     * @param context - Additional context data to attach
     *
     * @example
     * ```typescript
     * try {
     *   // Some operation
     * } catch (error) {
     *   logger.sentry.captureException(error, {
     *     userId: "123",
     *     operation: "payment_processing",
     *     amount: 100
     *   });
     * }
     * ```
     */
    captureException: (
      error: Error | unknown,
      context?: Record<string, any>
    ) => {
      const logId = nanoid();

      // Sentry logging
      if (env.SENTRY_ENABLED) {
        Sentry.captureException(error, {
          tags: { source: "app.use(logger)", logId },
          extra: context,
        });
      }
    },

    /**
     * Add custom context to Sentry for better debugging
     *
     * @param key - Context key/namespace
     * @param context - Context data object
     *
     * @example
     * ```typescript
     * logger.sentry.setContext("database", {
     *   connection: "primary",
     *   query_time: "150ms",
     *   affected_rows: 5
     * });
     * ```
     */
    setContext: (key: string, context: Record<string, any>) => {
      if (env.SENTRY_ENABLED) {
        Sentry.setContext(key, context);
      }
    },

    /**
     * Set user context for Sentry error tracking
     *
     * @param user - User information object
     *
     * @example
     * ```typescript
     * logger.sentry.setUser({
     *   id: "user_123",
     *   email: "user@example.com",
     *   username: "johndoe"
     * });
     * ```
     */
    setUser: (user: { id?: string; email?: string; username?: string }) => {
      if (env.SENTRY_ENABLED) {
        Sentry.setUser(user);
      }
    },

    /**
     * Add tags to Sentry for filtering and organization
     *
     * @param key - Tag key
     * @param value - Tag value
     *
     * @example
     * ```typescript
     * logger.sentry.setTag("feature", "authentication");
     * logger.sentry.setTag("environment", "production");
     * logger.sentry.setTag("version", "1.2.3");
     * ```
     */
    setTag: (key: string, value: string) => {
      if (env.SENTRY_ENABLED) {
        Sentry.setTag(key, value);
      }
    },

    /**
     * Capture a custom message to Sentry
     *
     * @param message - The message to capture
     * @param level - Sentry severity level
     * @param extra - Additional context data
     *
     * @example
     * ```typescript
     * logger.sentry.captureMessage("Payment processing completed", "info", {
     *   amount: 100,
     *   currency: "USD",
     *   processingTime: "2.3s"
     * });
     * ```
     */
    captureMessage: (
      message: string,
      level: "debug" | "info" | "warning" | "error" | "fatal" = "info",
      extra?: Record<string, any>
    ) => {
      const logId = nanoid();

      if (env.SENTRY_ENABLED) {
        Sentry.captureMessage(message, {
          level,
          tags: { source: "custom-logger", logId },
          extra,
        });
      }
    },

    /**
     * Add a breadcrumb to Sentry for debugging context
     *
     * @param message - Breadcrumb message
     * @param category - Breadcrumb category
     * @param level - Breadcrumb level
     * @param data - Additional data
     *
     * @example
     * ```typescript
     * logger.sentry.addBreadcrumb(
     *   "User clicked checkout button",
     *   "ui",
     *   "info",
     *   { cartItems: 3, totalAmount: 299.99 }
     * );
     * ```
     */
    addBreadcrumb: (
      message: string,
      category = "custom",
      level: "debug" | "info" | "warning" | "error" | "fatal" = "info",
      data?: Record<string, any>
    ) => {
      if (env.SENTRY_ENABLED) {
        Sentry.addBreadcrumb({
          message,
          category,
          level,
          data,
        });
      }
    },
  },
};

/**
 * @example Usage Examples - Structured Logging
 *
 * Simple logging (backward compatible):
 * ```typescript
 * logger.log("Hello");
 * logger.error("Something went wrong");
 * logger.warn("Warning message");
 * logger.debug("Debug info");
 * logger.verbose("Verbose details");
 * ```
 *
 * Structured logging with context (RECOMMENDED):
 * ```typescript
 * // Error with context
 * logger.error("Payment processing failed", {
 *   userId: "123",
 *   orderId: "order_456",
 *   amount: 100,
 *   currency: "USD",
 *   errorCode: "PAYMENT_DECLINED",
 *   gateway: "stripe"
 * });
 *
 * // Warning with context
 * logger.warn("Rate limit approaching", {
 *   endpoint: "/api/users",
 *   currentRate: 95,
 *   maxRate: 100,
 *   clientIp: "192.168.1.1"
 * });
 *
 * // Info logging with context
 * logger.log("User logged in", {
 *   userId: "123",
 *   email: "user@example.com",
 *   loginMethod: "google",
 *   sessionId: "sess_789"
 * });
 *
 * // Debug with performance data
 * logger.debug("Database query executed", {
 *   query: "SELECT * FROM users WHERE active = true",
 *   executionTime: "45ms",
 *   rowsReturned: 150,
 *   cacheHit: false
 * });
 * ```
 *
 * Sentry-specific usage:
 * ```typescript
 * // Exception handling
 * logger.sentry.captureException(error, { userId: "123", operation: "payment" });
 *
 * // User context
 * logger.sentry.setUser({ id: "123", email: "user@example.com" });
 *
 * // Custom context
 * logger.sentry.setContext("payment", { amount: 100, currency: "USD" });
 *
 * // Tags for filtering
 * logger.sentry.setTag("feature", "checkout");
 *
 * // Custom messages
 * logger.sentry.captureMessage("Custom event", "info", { data: "value" });
 *
 * // Breadcrumbs
 * logger.sentry.addBreadcrumb("User action", "ui", "info", { button: "checkout" });
 * ```
 *
 * @note
 * - Context objects are automatically JSON.stringify'd with pretty formatting
 * - All Sentry methods are safe to call even when Sentry is disabled
 * - Structured context makes logs searchable and filterable in monitoring tools
 * - Context is sent as structured data to Sentry for better analysis
 */
