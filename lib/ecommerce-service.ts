import type {
  Address,
  CartItem,
  CheckoutTotals,
  Product,
  Promotion,
  Order,
  OrderStatus,
} from '../types/ecommerce';

export const STORE_KEY = 'everlane-commerce-v1';

export const currency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const productStatus = (product: Product) => {
  if (product.archived) return 'Archived' as const;
  if (product.stock === 0) return 'Out of stock' as const;
  if (product.stock <= 7) return 'Low stock' as const;
  return 'Active' as const;
};

export interface CatalogFilters {
  search?: string;
  category?: string;
  price?: 'all' | 'under75' | '75to125' | 'over125';
  inStock?: boolean;
  sort?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export const filterCatalog = (products: Product[], filters: CatalogFilters) => {
  const query = filters.search?.trim().toLowerCase() ?? '';
  const result = products.filter((product) => {
    const matchesSearch = !query || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);
    const matchesCategory = !filters.category || filters.category === 'All' || product.category === filters.category;
    const price = filters.price ?? 'all';
    const matchesPrice = price === 'all' || (price === 'under75' && product.price < 75) || (price === '75to125' && product.price >= 75 && product.price <= 125) || (price === 'over125' && product.price > 125);
    return !product.archived && matchesSearch && matchesCategory && matchesPrice && (!filters.inStock || product.stock > 0);
  });
  return [...result].sort((a, b) => {
    if (filters.sort === 'price-low') return a.price - b.price;
    if (filters.sort === 'price-high') return b.price - a.price;
    if (filters.sort === 'rating') return b.rating - a.rating;
    if (filters.sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
    return Number(b.featured) - Number(a.featured);
  });
};

export const addCartItem = (
  cart: CartItem[],
  product: Product,
  quantity: number,
  variant: Record<string, string> = {},
) => {
  if (quantity < 1 || !Number.isInteger(quantity)) throw new Error('Choose a valid quantity.');
  if (product.archived || product.stock === 0) throw new Error('This item is currently unavailable.');
  const variantKey = JSON.stringify(variant);
  const index = cart.findIndex(
    (item) => item.productId === product.id && JSON.stringify(item.variant ?? {}) === variantKey,
  );
  const currentQuantity = index >= 0 ? cart[index].quantity : 0;
  if (currentQuantity + quantity > product.stock) {
    throw new Error(`Only ${product.stock} ${product.name} available.`);
  }
  if (index < 0) return [...cart, { productId: product.id, quantity, variant }];
  return cart.map((item, itemIndex) =>
    itemIndex === index ? { ...item, quantity: item.quantity + quantity } : item,
  );
};

export const resolveMockRole = (email: string) =>
  email.trim().toLowerCase() === 'admin@everlane.test' ? 'admin' as const : 'customer' as const;

export const setOrderStatus = (orders: Order[], id: string, status: OrderStatus) =>
  orders.map((order) =>
    order.id === id
      ? {
          ...order,
          status,
          trackingNumber:
            status === 'Shipped' && !order.trackingNumber
              ? `ETR${Math.floor(100000000 + Math.random() * 899999999)}`
              : order.trackingNumber,
        }
      : order,
  );

export const calculateTotals = (
  cart: CartItem[],
  products: Product[],
  delivery: 'Standard' | 'Express',
  promoCode: string,
  promotions: Promotion[],
): CheckoutTotals => {
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const promotion = promotions.find(
    (entry) => entry.active && entry.code.toLowerCase() === promoCode.trim().toLowerCase(),
  );
  const discount = promotion
    ? promotion.type === 'Percentage'
      ? subtotal * (promotion.value / 100)
      : Math.min(promotion.value, subtotal)
    : 0;
  const shipping = subtotal >= 75 || delivery === 'Standard' ? 0 : 14;
  const expressFee = delivery === 'Express' ? 14 : 0;
  const tax = Math.max(0, subtotal - discount) * 0.08;
  return {
    subtotal,
    shipping: shipping + expressFee,
    discount,
    tax,
    total: subtotal - discount + shipping + expressFee + tax,
  };
};

export const validateStock = (cart: CartItem[], products: Product[]) => {
  for (const item of cart) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product || product.archived) return 'One of your items is no longer available.';
    if (item.quantity > product.stock) {
      return `${product.name} only has ${product.stock} item${product.stock === 1 ? '' : 's'} available.`;
    }
  }
  return null;
};

export const validateAddress = (address: Address) => {
  const errors: Partial<Record<keyof Address, string>> = {};
  const clean = (value: string) => value.trim();
  if (clean(address.firstName).length < 2) errors.firstName = 'Enter your first name.';
  if (clean(address.lastName).length < 2) errors.lastName = 'Enter your last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(address.email))) errors.email = 'Enter a valid email.';
  if (!/^[+\d][\d\s()-]{7,18}$/.test(clean(address.phone))) errors.phone = 'Enter a valid phone number.';
  if (clean(address.address).length < 5) errors.address = 'Enter a complete street address.';
  if (clean(address.city).length < 2) errors.city = 'Enter a city.';
  if (clean(address.state).length < 2) errors.state = 'Enter a state or region.';
  if (clean(address.postalCode).length < 3) errors.postalCode = 'Enter a postal code.';
  if (clean(address.country).length < 2) errors.country = 'Enter a country.';
  return errors;
};

export const sanitizeText = (value: string, maxLength = 120) =>
  value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

export const generateOrderId = () => `EV-${Math.floor(10000 + Math.random() * 89999)}`;

export const generateEntityId = (prefix: string) =>
  `${prefix}-${Math.floor(100000 + Math.random() * 899999)}`;

export const wait = (milliseconds = 350) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
