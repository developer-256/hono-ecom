export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendEmailVerificationEmail,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  sendSigninOTP,
  type EmailOptions,
  type EmailResponse,
} from "./service/mailer.service";

export {
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
} from "./templates";
