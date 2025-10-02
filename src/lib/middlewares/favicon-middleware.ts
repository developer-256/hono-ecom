/**
 * Simple favicon middleware for serving emoji favicons
 */

import type { MiddlewareHandler } from "hono";

/**
 * Serves an emoji as a favicon
 *
 * @param emoji - The emoji to use as favicon
 * @returns Middleware handler
 *
 * @example
 * ```typescript
 * app.use(faviconMiddleware("🚀"));
 * app.use(faviconMiddleware("🛍️"));
 * ```
 */
export function faviconMiddleware(emoji: string): MiddlewareHandler {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <text y=".9em" font-size="90">${emoji}</text>
  </svg>`;

  return async (c, next) => {
    if (
      c.req.path === "/favicon.ico" ||
      c.req.path === "/favicon" ||
      c.req.path === "/api/favicon"
    ) {
      c.header("Content-Type", "image/svg+xml");
      c.header("Cache-Control", "public, max-age=3600");
      return c.body(svgContent);
    }
    return next();
  };
}
