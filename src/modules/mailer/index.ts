export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendEmailVerificationEmail,
  type EmailOptions,
  type EmailResponse,
} from "./service/mailer.service";

export {
  welcomeEmailTemplate,
  passwordResetEmailTemplate,
  orderConfirmationEmailTemplate,
  emailVerificationEmailTemplate,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type OrderConfirmationEmailData,
  type EmailVerificationEmailData,
} from "./templates";
