export interface EmailVerificationOTPData {
  otp: string;
  userName?: string;
}

export const emailVerificationOTPTemplate = {
  subject: "Verify Your Email Address - OTP Code",

  html: (data: EmailVerificationOTPData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Email Verification</h1>
        
        ${
          data.userName
            ? `<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hello ${data.userName},</p>`
            : ""
        }
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Thank you for signing up! Please use the following verification code to verify your email address:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="background-color: #f8f9fa; border: 2px dashed #007bff; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${data.otp}
            </span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 20px;">
          Enter this code in the verification form to complete your account setup.
        </p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 14px; color: #856404; margin: 0;">
            <strong>Security Note:</strong> This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
        </div>
        
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `,

  text: (data: EmailVerificationOTPData): string =>
    `Email Verification\n\n` +
    `${data.userName ? `Hello ${data.userName},\n\n` : ""}` +
    `Thank you for signing up! Please use the following verification code to verify your email address:\n\n` +
    `Verification Code: ${data.otp}\n\n` +
    `Enter this code in the verification form to complete your account setup.\n\n` +
    `Security Note: This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.\n\n` +
    `This is an automated message. Please do not reply to this email.`,
};
