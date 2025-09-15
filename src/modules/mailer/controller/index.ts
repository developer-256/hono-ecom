import { createRouter } from "@/lib/core/create-router";
import { GET_DTO, GET_Handler } from "../routes/GET";

export const mailerController = createRouter().openapi(GET_DTO, GET_Handler);
