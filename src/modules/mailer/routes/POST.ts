import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../../../../hono-ecom/src/modules/module.tags";
import { HTTP } from "@/lib/http/status-codes";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";

/**
 * @info Zod schema for sendEmail API input validation
 */
export const SendEmailSchema = z
  .object({
    to: z
      .union([
        z.email("Invalid email address"),
        z
          .array(z.email("Invalid email address"))
          .min(1, "At least one recipient required"),
      ])
      .describe("Recipient email address(es)"),
    subject: z.string().min(1, "Subject is required").describe("Email subject"),
    html: z.string().optional().describe("HTML content of the email"),
    text: z.string().optional().describe("Plain text content of the email"),
    from: z
      .email("Invalid from email address")
      .optional()
      .describe("Sender email address"),
    replyTo: z
      .email("Invalid reply-to email address")
      .optional()
      .describe("Reply-to email address"),
    cc: z
      .union([
        z.email("Invalid CC email address"),
        z.array(z.email("Invalid CC email address")),
      ])
      .optional()
      .describe("CC email address(es)"),
    bcc: z
      .union([
        z.email("Invalid BCC email address"),
        z.array(z.email("Invalid BCC email address")),
      ])
      .optional()
      .describe("BCC email address(es)"),
  })
  .refine((data) => data.html || data.text, {
    message: "Either html or text content must be provided",
    path: ["html", "text"],
  });

export const POST_Route = createRoute({
  path: "/mailer/send",
  method: "post",
  tags: moduleTags.mailer,
  request: {
    body: {
      content: {
        "application/json": {
          schema: SendEmailSchema,
        },
      },
    },
  },
  summary: "Use Resend Mailers",
  responses: {
    [HTTP.OK]: APISchema.OK,
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_Handler: RouteHandler<typeof POST_Route> = async (c) => {
  try {
    const emailData = c.req.valid("json");

    /**
     * @Info Import sendEmail from the service
     * @Reason code splitting and boost application startup
     */
    const { sendEmail } = await import("../service");

    // Send the email using the validated data
    const result = await sendEmail(emailData);

    if (!result.success) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Failed to send email", {
          issues: [{ message: result.error || "Unknown error occurred" }],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "Email sent successfully",
        data: result.data,
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Internal server error", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};
