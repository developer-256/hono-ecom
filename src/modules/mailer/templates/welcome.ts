export interface WelcomeEmailData {
  name: string;
}

export const welcomeEmailTemplate = {
  subject: "Welcome to Our Platform!",

  html: (data: WelcomeEmailData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome, ${data.name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `,

  text: (data: WelcomeEmailData): string =>
    `Welcome, ${data.name}! Thank you for joining our platform. We're excited to have you on board!`,
};
