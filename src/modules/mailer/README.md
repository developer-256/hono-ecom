# Mailer Module

This module provides email functionality using Resend API with organized email templates.

## Structure

```
mailer/
├── index.ts              # Main exports
├── service/
│   └── index.ts          # Email sending service
├── templates/
│   ├── index.ts          # Template exports
│   ├── welcome.ts        # Welcome email template
│   ├── password-reset.ts # Password reset template
│   └── order-confirmation.ts # Order confirmation template
└── README.md
```

## Usage

### Import the mailer functions

```typescript
import {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  type EmailOptions,
  type EmailResponse,
} from "@/modules/mailer";
```

### Import templates directly (for customization)

```typescript
import {
  welcomeEmailTemplate,
  passwordResetEmailTemplate,
  orderConfirmationEmailTemplate,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type OrderConfirmationEmailData,
} from "@/modules/mailer";
```

### Send a basic email

```typescript
const result = await sendEmail({
  to: "user@example.com",
  subject: "Hello World",
  html: "<h1>Hello from our app!</h1>",
  text: "Hello from our app!",
});

if (result.success) {
  console.log("Email sent successfully!");
} else {
  console.error("Failed to send email:", result.error);
}
```

### Send a welcome email

```typescript
const result = await sendWelcomeEmail("user@example.com", "John Doe");
```

### Send a password reset email

```typescript
const result = await sendPasswordResetEmail(
  "user@example.com",
  "https://yourapp.com/reset?token=abc123"
);
```

### Send an order confirmation email

```typescript
const result = await sendOrderConfirmationEmail(
  "user@example.com",
  "ORD-12345",
  "$99.99"
);
```

### Use templates directly (for custom sending logic)

```typescript
// Use a template to generate content
const data: WelcomeEmailData = { name: "John Doe" };

const result = await sendEmail({
  to: "user@example.com",
  subject: welcomeEmailTemplate.subject,
  html: welcomeEmailTemplate.html(data),
  text: welcomeEmailTemplate.text(data),
});

// Or customize a template
const customSubject = "Custom Welcome Message";
const result2 = await sendEmail({
  to: "user@example.com",
  subject: customSubject,
  html: welcomeEmailTemplate.html(data),
  text: welcomeEmailTemplate.text(data),
});
```

## Configuration

Make sure you have the `RESEND_API_KEY` environment variable set in your `.env` file:

```
RESEND_API_KEY=your_resend_api_key_here
```

## Email Options

The `EmailOptions` interface supports the following properties:

- `to`: string | string[] - Recipient email address(es)
- `subject`: string - Email subject
- `html?`: string - HTML content (optional)
- `text?`: string - Plain text content (optional)
- `from?`: string - Sender email (defaults to "onboarding@resend.dev")
- `replyTo?`: string - Reply-to email address
- `cc?`: string | string[] - CC recipients
- `bcc?`: string | string[] - BCC recipients

## Response Format

All email functions return an `EmailResponse` object:

```typescript
interface EmailResponse {
  success: boolean;
  data?: any; // Resend response data when successful
  error?: string; // Error message when failed
}
```
