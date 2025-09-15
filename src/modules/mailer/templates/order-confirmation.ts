export interface OrderConfirmationEmailData {
  orderNumber: string;
  orderTotal: string;
}

export const orderConfirmationEmailTemplate = {
  subject: (data: OrderConfirmationEmailData): string =>
    `Order Confirmation - ${data.orderNumber}`,

  html: (data: OrderConfirmationEmailData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Order Confirmed!</h1>
      <p>Your order has been confirmed and is being processed.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Total:</strong> ${data.orderTotal}</p>
      </div>
      <p>We'll send you another email when your order ships.</p>
      <p>Thank you for your purchase!</p>
    </div>
  `,

  text: (data: OrderConfirmationEmailData): string =>
    `Order Confirmed! Order Number: ${data.orderNumber}, Total: ${data.orderTotal}. We'll send you another email when your order ships.`,
};
