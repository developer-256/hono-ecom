import { createRouter } from "@/lib/core/create-router";
import { POST_DTO, POST_Handler } from "../routes/POST";

export const mailerController = createRouter().openapi(POST_DTO, POST_Handler);
