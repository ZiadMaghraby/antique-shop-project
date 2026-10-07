export class AddToCartCommand {
  constructor(product) {
    this.product = product;
  }

  execute(cartItems) {
    if (!Number.isInteger(this.product.stock) || this.product.stock < 1) return cartItems;
    const existingItem = cartItems.find((item) => item.id === this.product.id);

    if (existingItem) {
      if (existingItem.quantity >= this.product.stock) return cartItems;
      return cartItems.map((item) =>
        item.id === this.product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    }

    return [...cartItems, { ...this.product, quantity: 1 }];
  }
}

export class IncreaseQuantityCommand {
  constructor(productId) {
    this.productId = productId;
  }

  execute(cartItems) {
    return cartItems.map((item) =>
      item.id === this.productId && Number.isInteger(item.stock) && item.quantity < item.stock
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }
}

export class DecreaseQuantityCommand {
  constructor(productId) {
    this.productId = productId;
  }

  execute(cartItems) {
    return cartItems
      .map((item) =>
        item.id === this.productId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
      .filter((item) => item.quantity > 0);
  }
}

export class RemoveFromCartCommand {
  constructor(productId) {
    this.productId = productId;
  }

  execute(cartItems) {
    return cartItems.filter((item) => item.id !== this.productId);
  }
}

export class ClearCartCommand {
  execute() {
    return [];
  }
}
