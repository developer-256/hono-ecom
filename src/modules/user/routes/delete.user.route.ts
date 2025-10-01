import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE } from "@/lib/utils";

export const DELETE_Route = createRoute({
  path: "/user",
  method: "delete",
  tags: moduleTags.user,
  request: {},
  responses: {
    [HTTP.OK]: APISchema.OK,
  },
});

export const DELETE_Handler: RouteHandler<typeof DELETE_Route> = async (c) => {
  return c.json(HONO_RESPONSE(), HTTP.OK);
};
