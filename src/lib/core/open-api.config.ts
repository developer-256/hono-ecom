import { Scalar } from "@scalar/hono-api-reference";

import packageJSON from "../../../package.json" with { type: "json" };
import type { OpenAPIHono } from "@hono/zod-openapi";

export default function configureOpenAPI(app: OpenAPIHono) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Hono Ecom Backend",
    },
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
      favicon: `favicon`
    })
  );
}
