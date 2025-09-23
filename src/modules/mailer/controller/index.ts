import { createRouter } from "@/lib/core/create-router";
import { POST_Route, POST_Handler } from "../routes/POST";

export const mailerController = createRouter().openapi(
  POST_Route,
  POST_Handler
);
