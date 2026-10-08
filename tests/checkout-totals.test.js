import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotals } from '../src/patterns/decorator/ProductDecorators.js';
import { createCheckoutOrder } from '../src/patterns/facade/CheckoutFacade.js';

const product = { id: 1, name: 'Vase', price: 3000, fragile: true, quantity: 2, stock: 4 };

test('quote exposes both per-unit charges before placing an order', () => {
  const quote = calculateCartTotals([product]);
  assert.equal(quote.subtotal, 6000);
  assert.equal(quote.servicesTotal, 800);
  assert.equal(quote.total, 6800);
  assert.equal(quote.items[0].addOns.length, 2);
  assert.equal(product.finalTotal, undefined);
});

test('uncharged products and empty carts have no service fees', () => {
  assert.deepEqual(calculateCartTotals([]), {items: [], subtotal: 0, servicesTotal: 0, total: 0});
  const quote = calculateCartTotals([{...product, price: 2999, fragile: false}]);
  assert.equal(quote.servicesTotal, 0);
  assert.equal(quote.total, 5998);
});

test('quantity changes update the displayed fee and accepted order identically', () => {
  for (const quantity of [1, 2, 4]) {
    const cartItems = [{...product, quantity}];
    const quote = calculateCartTotals(cartItems);
    const result = createCheckoutOrder({cartItems, orderDetails: {
      paymentMethod: 'cash', delivery: {fullName: 'Test', phone: '123', city: 'Cairo', address: 'Test street'},
    }});
    assert.equal(result.success, true);
    for (const key of ['subtotal', 'servicesTotal', 'total']) assert.equal(result.order[key], quote[key]);
    assert.equal(result.order.total, 3400 * quantity);
  }
});

test('mixed carts aggregate charges only for applicable products', () => {
  const quote = calculateCartTotals([product, {...product, id: 2, price: 100, quantity: 1, fragile: false}]);
  assert.equal(quote.total, 6900);
  assert.equal(quote.servicesTotal, 800);
});
