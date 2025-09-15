# Sentry Setup Guide

This project has been configured with Sentry for error monitoring, performance tracking, and logging.

## ⚠️ Bun Compatibility Notice

This project is configured for **Bun runtime compatibility**. The `@sentry/profiling-node` package has been removed because it uses libuv functions (`uv_default_loop`) that are not yet supported by Bun. Profiling features are disabled, but all other Sentry functionality (error tracking, performance monitoring, logging) works normally.

## Environment Variables

Add the following variables to your `.env` file:

```bash
# Sentry Configuration
SENTRY_ENABLED=false
SENTRY_DSN=https://your-public-key@o0.ingest.sentry.io/project-id
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
# SENTRY_PROFILES_SAMPLE_RATE - Removed for Bun compatibility
SENTRY_ENABLE_LOGS=true
```

## Getting Started

1. **Create a Sentry Account**: Go to [sentry.io](https://sentry.io) and create a free account
2. **Create a Project**: Create a new Node.js project in Sentry
3. **Get your DSN**: Copy the DSN from your project settings
4. **Update Environment**: Set `SENTRY_ENABLED=true` and add your DSN
5. **Test the Setup**: Visit `/api/debug-sentry` endpoint in development to test error tracking

## Configuration Options

### SENTRY_ENABLED

- **Type**: Boolean
- **Default**: `false`
- **Description**: Master switch to enable/disable Sentry

### SENTRY_DSN

- **Type**: String
- **Required**: Yes (when Sentry is enabled)
- **Description**: Your Sentry project's Data Source Name

### SENTRY_ENVIRONMENT

- **Type**: String
- **Default**: Uses `NODE_ENV` value
- **Description**: Environment name for filtering in Sentry dashboard

### SENTRY_TRACES_SAMPLE_RATE

- **Type**: Number (0.0 - 1.0)
- **Default**: `0.1`
- **Description**: Percentage of transactions to trace for performance monitoring

### ~~SENTRY_PROFILES_SAMPLE_RATE~~ (Disabled for Bun)

- **Type**: ~~Number (0.0 - 1.0)~~ **REMOVED**
- **Default**: ~~`0.1`~~ **N/A**
- **Description**: ~~Percentage of traced transactions to profile~~ **Profiling disabled due to Bun compatibility issues with @sentry/profiling-node package**

### SENTRY_ENABLE_LOGS

- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable sending logs to Sentry

## Features

### Enhanced Logger

The custom logger now integrates with Sentry:

```typescript
import { logger } from "./lib/core/hono-logger";

// These will be sent to both console and Sentry
logger.error("Something went wrong");
logger.warn("Warning message");
logger.log("Info message");

// Sentry-specific methods
logger.captureException(new Error("Custom error"));
logger.setUser({ id: "123", email: "user@example.com" });
logger.setTag("feature", "auth");
logger.setContext("custom", { key: "value" });
```

### Automatic Error Tracking

- All unhandled errors are automatically sent to Sentry
- Request context is attached to errors
- Performance monitoring for HTTP requests

### Testing Sentry Integration

To test Sentry integration, you can use the logger methods in your controllers or trigger errors in your application code.

## Best Practices

1. **Use appropriate sample rates in production** (0.01-0.1 for high-traffic apps)
2. **Be careful with PII** - Sentry will collect user data when enabled
3. **Filter sensitive data** in the `beforeSend` callback if needed
4. **Use tags and context** for better error organization
5. **Monitor your Sentry quota** to avoid unexpected charges

## Bun Runtime Considerations

6. **Profiling is disabled** - The `@sentry/profiling-node` package is incompatible with Bun
7. **Error tracking works normally** - All other Sentry features function as expected
8. **Future compatibility** - Profiling can be re-enabled when Bun supports the required libuv functions

## Troubleshooting

### Sentry not receiving data

1. Check if `SENTRY_ENABLED=true`
2. Verify your DSN is correct
3. Check console logs for Sentry initialization messages
4. Test with debug routes in development

### Too much data being sent

1. Reduce sampling rates
2. Add filters in `beforeSend` callback
3. Disable logs in production if needed

### Performance impact

1. Lower sample rates
2. ~~Disable profiling in production~~ **Profiling already disabled for Bun compatibility**
3. Monitor bundle size if using frontend Sentry

### Bun-specific issues

1. If you encounter `unsupported uv function: uv_default_loop` errors, ensure `@sentry/profiling-node` is not installed
2. Keep `SENTRY_ENABLED=false` during development if using Bun
3. Consider switching to Node.js if profiling is required for your use case
