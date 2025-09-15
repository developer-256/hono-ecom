export interface PasswordResetEmailData {
  resetLink: string;
}

export const passwordResetEmailTemplate = {
  subject: "Password Reset Request",

  html: (data: PasswordResetEmailData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${data.resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `,

  text: (data: PasswordResetEmailData): string =>
    `You requested a password reset. Click this link to reset your password: ${data.resetLink}`,
};
