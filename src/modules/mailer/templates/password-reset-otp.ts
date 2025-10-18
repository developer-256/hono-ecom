export interface PasswordResetOTPData {
  otp: string;
  userName?: string;
}

export const passwordResetOTPTemplate = {
  subject: "Password Reset - OTP Code",

  html: (data: PasswordResetOTPData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
        
        ${
          data.userName
            ? `<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hello ${data.userName},</p>`
            : ""
        }
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset your password. Please use the following code to proceed with resetting your password:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="background-color: #f8f9fa; border: 2px dashed #dc3545; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${data.otp}
            </span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 20px;">
          Enter this code in the password reset form to create a new password.
        </p>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 14px; color: #721c24; margin: 0;">
            <strong>Security Alert:</strong> This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email and consider changing your password as a precaution.
          </p>
        </div>
        
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `,

  text: (data: PasswordResetOTPData): string =>
    `Password Reset Request\n\n` +
    `${data.userName ? `Hello ${data.userName},\n\n` : ""}` +
    `We received a request to reset your password. Please use the following code to proceed with resetting your password:\n\n` +
    `Reset Code: ${data.otp}\n\n` +
    `Enter this code in the password reset form to create a new password.\n\n` +
    `Security Alert: This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email and consider changing your password as a precaution.\n\n` +
    `This is an automated message. Please do not reply to this email.`,
};
