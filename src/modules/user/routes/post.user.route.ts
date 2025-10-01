import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE } from "@/lib/utils";

export const POST_Route = createRoute({
  path: "/user",
  method: "post",
  tags: moduleTags.user,
  request: {},
  responses: {
    [HTTP.OK]: APISchema.OK,
  },
});

export const POST_Handler: RouteHandler<typeof POST_Route> = async (c) => {
  return c.json(HONO_RESPONSE(), HTTP.OK);
};

