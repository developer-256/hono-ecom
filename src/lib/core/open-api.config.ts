import { Scalar } from "@scalar/hono-api-reference";

import packageJSON from "../../../package.json" with { type: "json" };
import type { OpenAPIHono } from "@hono/zod-openapi";

export default function configureOpenAPI(app: OpenAPIHono) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Hono Ecom Backend",
      description:
        "E-commerce backend API with authentication and user management",
    },
    servers: [
      {
        url: "/",
        description: "API Base URL",
      },
    ],

    security: [
      {
        bearerAuth: [],
      },
    ],
  });

  app.get(
    "/reference",
    Scalar({
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
      url: "/api/doc",
      favicon: `/api/favicon`,
      authentication: {
        preferredSecurityScheme: "bearerAuth",
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "token",
            description:
              "Bearer token authentication. Sign in to receive a token, then use it in the Authorization header as 'Bearer YOUR_TOKEN'.",
          },
        },
      },
      defaultOpenAllTags: false,
      withDefaultFonts: true,
    })
  );
}
