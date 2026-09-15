export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type ProductStatus =
  | 'Active'
  | 'Low stock'
  | 'Out of stock'
  | 'Archived';

export interface ProductVariant {
  name: string;
  values: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  description: string;
  details: string[];
  price: number;
  compareAt?: number;
  images: string[];
  stock: number;
  featured: boolean;
  archived: boolean;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: Record<string, string>;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem extends CartItem {
  name: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  delivery: 'Standard' | 'Express';
  address: Address;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: number;
  status: 'Active' | 'Blocked';
  avatar: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  start: string;
  end: string;
  usage: number;
  active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
}

export interface CheckoutTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export interface CheckoutPayload {
  customer: UserProfile;
  address: Address;
  delivery: 'Standard' | 'Express';
  paymentMethod: string;
  promoCode?: string;
}

export interface PersistedStore {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  products: Product[];
  promotions: Promotion[];
  customers: Customer[];
  categories: string[];
  brands: string[];
  user: UserProfile | null;
}
