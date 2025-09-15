export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  type EmailOptions,
  type EmailResponse,
} from "./service";

export {
  welcomeEmailTemplate,
  passwordResetEmailTemplate,
  orderConfirmationEmailTemplate,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type OrderConfirmationEmailData,
} from "./templates";
