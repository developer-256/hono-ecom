import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { moduleTags } from "../../../../../hono-ecom/src/modules/module.tags";
import { HTTP } from "@/lib/http/status-codes";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HONO_RESPONSE } from "@/lib/utils";

export const GET_DTO = createRoute({
  path: "/mailer",
  method: "get",
  tags: moduleTags.mailer,
  request: {},
  responses: {
    [HTTP.OK]: APISchema.OK,
  },
});

export const GET_Handler: RouteHandler<typeof GET_DTO> = async (c) => {
  return c.json(HONO_RESPONSE(), HTTP.OK);
};
