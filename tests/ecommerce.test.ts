import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addCartItem,
  calculateTotals,
  filterCatalog,
  productStatus,
  resolveMockRole,
  sanitizeText,
  setOrderStatus,
  validateAddress,
  validateStock,
} from '../lib/ecommerce-service.ts';
import {
  initialOrders,
  initialProducts,
  initialPromotions,
  reviews,
} from '../lib/mock-data.ts';

void test('catalog browsing searches, filters, sorts, and hides archived products', () => {
  const audio = filterCatalog(initialProducts, {
    search: 'wireless',
    category: 'Audio',
    price: 'over125',
    inStock: true,
    sort: 'rating',
  });
  assert.deepEqual(audio.map((product) => product.id), ['P-1001']);
  assert.equal(filterCatalog(initialProducts, { search: 'tech pouch' }).length, 0);
});

void test('product details include a gallery, variants, and review content', () => {
  const product = initialProducts.find((entry) => entry.id === 'P-1001');
  assert.ok(product);
  assert.ok(product.images.length >= 3);
  assert.equal(product.variants[0].name, 'Color');
  assert.ok(reviews[product.slug].length >= 2);
});

void test('cart combines matching variants and rejects insufficient stock', () => {
  const product = initialProducts[0];
  const once = addCartItem([], product, 1, { Color: 'Forest' });
  const twice = addCartItem(once, product, 2, { Color: 'Forest' });
  assert.equal(twice.length, 1);
  assert.equal(twice[0].quantity, 3);
  assert.throws(() => addCartItem(twice, product, product.stock, { Color: 'Forest' }), /Only 18/);
});

void test('checkout totals apply promotions and enforce cart stock', () => {
  const cart = [{ productId: 'P-1001', quantity: 1 }];
  const totals = calculateTotals(cart, initialProducts, 'Standard', 'WELCOME10', initialPromotions);
  assert.equal(totals.subtotal, 189);
  assert.equal(Number(totals.discount.toFixed(2)), 18.9);
  assert.equal(totals.shipping, 0);
  assert.equal(validateStock([], initialProducts), null);
  assert.match(validateStock([{ productId: 'P-1008', quantity: 1 }], initialProducts) ?? '', /only has 0/);
});

void test('checkout address validation rejects malformed customer details', () => {
  const errors = validateAddress({
    firstName: '<', lastName: '', email: 'not-an-email', phone: '12',
    address: 'x', city: '', state: '', postalCode: '', country: '',
  });
  assert.equal(Object.keys(errors).length, 9);
  assert.equal(sanitizeText('<script> Maya </script>'), 'script Maya /script');
});

void test('mock login distinguishes administrator and customer accounts', () => {
  assert.equal(resolveMockRole('ADMIN@EVERLANE.TEST'), 'admin');
  assert.equal(resolveMockRole('maya@example.com'), 'customer');
});

void test('admin order management updates status and generates tracking', () => {
  const updated = setOrderStatus(initialOrders, 'EV-10482', 'Shipped');
  const order = updated.find((entry) => entry.id === 'EV-10482');
  assert.equal(order?.status, 'Shipped');
  assert.match(order?.trackingNumber ?? '', /^ETR\d{9}$/);
  assert.equal(productStatus({ ...initialProducts[0], stock: 4 }), 'Low stock');
  assert.equal(productStatus({ ...initialProducts[0], archived: true }), 'Archived');
});
