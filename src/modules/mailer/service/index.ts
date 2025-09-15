import { Resend } from "resend";
import env from "@/env";
import {
  welcomeEmailTemplate,
  passwordResetEmailTemplate,
  orderConfirmationEmailTemplate,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type OrderConfirmationEmailData,
} from "../templates";

const resend = new Resend(env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Send an email using Resend
 * @param options Email options
 * @returns Promise with email response
 */
export const sendEmail = async (
  options: EmailOptions
): Promise<EmailResponse> => {
  try {
    // Ensure at least text or html is provided
    if (!options.html && !options.text) {
      return {
        success: false,
        error: "Either html or text content must be provided",
      };
    }

    const emailData: any = {
      from: options.from || "onboarding@resend.dev", // Default from address
      to: options.to,
      subject: options.subject,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    };

    // Add html or text content
    if (options.html) {
      emailData.html = options.html;
    }
    if (options.text) {
      emailData.text = options.text;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("❌ Email sending failed:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    console.log("✅ Email sent successfully:", data?.id);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Send a welcome email template
 * @param to Recipient email address
 * @param name Recipient name
 * @returns Promise with email response
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<EmailResponse> => {
  const data: WelcomeEmailData = { name };

  return sendEmail({
    to,
    subject: welcomeEmailTemplate.subject,
    html: welcomeEmailTemplate.html(data),
    text: welcomeEmailTemplate.text(data),
  });
};

/**
 * Send a password reset email template
 * @param to Recipient email address
 * @param resetLink Password reset link
 * @returns Promise with email response
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string
): Promise<EmailResponse> => {
  const data: PasswordResetEmailData = { resetLink };

  return sendEmail({
    to,
    subject: passwordResetEmailTemplate.subject,
    html: passwordResetEmailTemplate.html(data),
    text: passwordResetEmailTemplate.text(data),
  });
};

/**
 * Send an order confirmation email template
 * @param to Recipient email address
 * @param orderNumber Order number
 * @param orderTotal Order total amount
 * @returns Promise with email response
 */
export const sendOrderConfirmationEmail = async (
  to: string,
  orderNumber: string,
  orderTotal: string
): Promise<EmailResponse> => {
  const data: OrderConfirmationEmailData = { orderNumber, orderTotal };

  return sendEmail({
    to,
    subject: orderConfirmationEmailTemplate.subject(data),
    html: orderConfirmationEmailTemplate.html(data),
    text: orderConfirmationEmailTemplate.text(data),
  });
};
