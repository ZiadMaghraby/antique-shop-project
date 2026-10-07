function validateCart(order) {
  if (!order || !Array.isArray(order.cartItems) || order.cartItems.length === 0) {
    return {
      isValid: false,
      message: "Cart is empty",
    };
  }

  return { isValid: true };
}

function validateStock(order) {
  const invalidItem = order.cartItems.some((item) => !item || !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.price) || item.price < 0);
  if (invalidItem) {
    return { isValid: false, message: "Cart contains an invalid item" };
  }
  const outOfStockItem = order.cartItems.find((item) => !Number.isInteger(item.stock) || item.stock < item.quantity);

  if (outOfStockItem) {
    return {
      isValid: false,
      message: `${outOfStockItem.name} is out of stock`,
    };
  }

  return { isValid: true };
}

function validatePayment(order) {
  if (!order.paymentMethod) {
    return {
      isValid: false,
      message: "Please choose a payment method",
    };
  }

  return { isValid: true };
}

function validateDelivery(order) {
  if (!order.delivery) {
    return { isValid: true };
  }

  const { fullName, phone, city, address } = order.delivery;

  if ([fullName, phone, city, address].some((value) => typeof value !== "string" || !value.trim())) {
    return {
      isValid: false,
      message: "Please complete delivery information",
    };
  }

  return { isValid: true };
}

export function validateCheckout(order) {
  const validationSteps = [
    validateCart,
    validateStock,
    validatePayment,
    validateDelivery,
  ];

  for (const step of validationSteps) {
    const result = step(order);

    if (!result.isValid) {
      return result;
    }
  }

  return {
    isValid: true,
    message: "Checkout validation passed",
  };
}
