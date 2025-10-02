import * as Sentry from "@sentry/node";
// NOTE: Commenting out profiling integration due to Bun compatibility issues
// The @sentry/profiling-node package uses libuv functions not yet supported by Bun
// import { nodeProfilingIntegration } from "@sentry/profiling-node";
import env from "../../env";
import { HONO_LOGGER } from "./hono-logger";

/**
 * Initialize Sentry for error monitoring, performance tracking, and logging
 * Only initializes if SENTRY_ENABLED is true in environment variables
 */
export function initializeSentry() {
  if (!env.SENTRY_ENABLED) {
    console.log("🔒 Sentry is disabled via environment configuration");
    return;
  }

  if (!env.SENTRY_DSN) {
    console.warn("⚠️ Sentry is enabled but SENTRY_DSN is not provided");
    return;
  }

  try {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,

      // Enable PII (Personally Identifiable Information) for better debugging
      // Be careful with this in production
      sendDefaultPii: env.NODE_ENV === "development",

      // Performance monitoring
      tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,

      // Profiling - Disabled for Bun compatibility
      // integrations: [nodeProfilingIntegration()],
      // profilesSampleRate: env.SENTRY_PROFILES_SAMPLE_RATE,

      // Logging
      enableLogs: env.SENTRY_ENABLE_LOGS,

      // Additional configuration
      beforeSend(event) {
        // Filter out any sensitive data if needed
        if (env.NODE_ENV === "development") {
          HONO_LOGGER.info("🐛 Sentry event captured");
          // console.log("🐛 Sentry event:", event);
        }
        return event;
      },

      beforeSendTransaction(event) {
        if (env.NODE_ENV === "development") {
          HONO_LOGGER.info("📊 Sentry transaction captured");
          // console.log("📊 Sentry transaction:", event);
        }
        return event;
      },
    });

    console.log("✅ Sentry initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Sentry:", error);
  }
}

// Export Sentry for use in other parts of the application
export { Sentry };
