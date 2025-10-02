export interface EmailVerificationEmailData {
  verificationLink: string;
  userName?: string;
}

export const emailVerificationEmailTemplate = {
  subject: "Verify Your Email Address",

  html: (data: EmailVerificationEmailData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; text-align: center;">Welcome${
        data.userName ? ` ${data.userName}` : ""
      }!</h1>
      <p style="font-size: 16px; line-height: 1.6;">Thank you for signing up! Please verify your email address to complete your account setup.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.verificationLink}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        If you didn't create an account, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
        This verification link will expire in 6 hours.
      </p>
    </div>
  `,

  text: (data: EmailVerificationEmailData): string =>
    `Welcome${data.userName ? ` ${data.userName}` : ""}!\n\n` +
    `Thank you for signing up! Please verify your email address by clicking this link: ${data.verificationLink}\n\n` +
    `If you didn't create an account, you can safely ignore this email.\n\n` +
    `This verification link will expire in 6 hours.`,
};
