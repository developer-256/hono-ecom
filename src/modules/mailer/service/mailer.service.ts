import { Resend } from "resend";
import env from "@/env";
import {
  welcomeEmailTemplate,
  passwordResetEmailTemplate,
  orderConfirmationEmailTemplate,
  emailVerificationEmailTemplate,
  emailVerificationOTPTemplate,
  passwordResetOTPTemplate,
  signinOTPTemplate,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type OrderConfirmationEmailData,
  type EmailVerificationEmailData,
  type EmailVerificationOTPData,
  type PasswordResetOTPData,
  type SigninOTPData,
} from "../templates";
import { HONO_LOGGER } from "@/lib/core/hono-logger";

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
      HONO_LOGGER.error("❌ Email sending error:", { error });
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    HONO_LOGGER.info("✅ Email sent successfully:", { emailId: data?.id });

    return {
      success: true,
      data,
    };
  } catch (error) {
    HONO_LOGGER.error("❌ Email sending error:", { error });

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

/**
 * Send an email verification email template
 * @param to Recipient email address
 * @param verificationLink Email verification link
 * @param userName Optional user name
 * @returns Promise with email response
 */
export const sendEmailVerificationEmail = async (
  to: string,
  verificationLink: string,
  userName?: string
): Promise<EmailResponse> => {
  const data: EmailVerificationEmailData = { verificationLink, userName };

  return sendEmail({
    to,
    subject: emailVerificationEmailTemplate.subject,
    html: emailVerificationEmailTemplate.html(data),
    text: emailVerificationEmailTemplate.text(data),
  });
};

/**
 * Send an email verification OTP email template
 * @param to Recipient email address
 * @param otp OTP code
 * @param userName Optional user name
 * @returns Promise with email response
 */
export const sendEmailVerificationOTP = async (
  to: string,
  otp: string,
  userName?: string
): Promise<EmailResponse> => {
  const data: EmailVerificationOTPData = { otp, userName };

  return sendEmail({
    to,
    subject: emailVerificationOTPTemplate.subject,
    html: emailVerificationOTPTemplate.html(data),
    text: emailVerificationOTPTemplate.text(data),
  });
};

/**
 * Send a password reset OTP email template
 * @param to Recipient email address
 * @param otp OTP code
 * @param userName Optional user name
 * @returns Promise with email response
 */
export const sendPasswordResetOTP = async (
  to: string,
  otp: string,
  userName?: string
): Promise<EmailResponse> => {
  const data: PasswordResetOTPData = { otp, userName };

  return sendEmail({
    to,
    subject: passwordResetOTPTemplate.subject,
    html: passwordResetOTPTemplate.html(data),
    text: passwordResetOTPTemplate.text(data),
  });
};

/**
 * Send a sign-in OTP email template
 * @param to Recipient email address
 * @param otp OTP code
 * @param userName Optional user name
 * @returns Promise with email response
 */
export const sendSigninOTP = async (
  to: string,
  otp: string,
  userName?: string
): Promise<EmailResponse> => {
  const data: SigninOTPData = { otp, userName };

  return sendEmail({
    to,
    subject: signinOTPTemplate.subject,
    html: signinOTPTemplate.html(data),
    text: signinOTPTemplate.text(data),
  });
};
