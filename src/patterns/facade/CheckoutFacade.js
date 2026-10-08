import { validateCheckout } from "../chain/CheckoutValidationChain.js";
import { calculateCartTotals } from "../decorator/ProductDecorators.js";

export function createCheckoutOrder({ cartItems, orderDetails = {} }) {
  const orderData = {
    cartItems,
    delivery: orderDetails.delivery || null,
    paymentMethod: orderDetails.paymentMethod || "cash",
  };

  const validation = validateCheckout(orderData);

  if (!validation.isValid) {
    return {
      success: false,
      message: validation.message,
    };
  }

  const { items: decoratedItems, subtotal, total, servicesTotal } = calculateCartTotals(cartItems);

  const orderNumber = `AS-${Date.now().toString().slice(-6)}`;

  return {
    success: true,
    message: `Your order has been placed successfully. Order number: ${orderNumber}`,
    order: {
      orderNumber,
      items: decoratedItems,
      subtotal,
      servicesTotal,
      total,
      delivery: orderData.delivery,
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toLocaleString(),
    },
  };
}
