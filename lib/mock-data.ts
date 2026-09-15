import type { Customer, Order, Product, Promotion, Review } from '../types/ecommerce';

const gallery = (seed: string, alternates: string[] = []) => [seed, ...alternates];

export const reviews: Record<string, Review[]> = {
  'drift-headphones': [
    {
      id: 'RV-01',
      author: 'Maya L.',
      rating: 5,
      title: 'Quiet, comfortable, beautifully made',
      body: 'The sound is warm and detailed, and I can wear them through a full workday without pressure.',
      date: 'Aug 28, 2026',
      verified: true,
    },
    {
      id: 'RV-02',
      author: 'Theo R.',
      rating: 5,
      title: 'My new travel essential',
      body: 'Noise cancellation is excellent on flights and the battery easily lasts a full week of commuting.',
      date: 'Aug 17, 2026',
      verified: true,
    },
  ],
};

export const initialProducts: Product[] = [
  {
    id: 'P-1001', sku: 'AUD-DRF-01', name: 'Drift Wireless Headphones', slug: 'drift-headphones', category: 'Audio', brand: 'Sonora',
    description: 'Immersive over-ear headphones engineered for clear, balanced sound and calm all-day listening.',
    details: ['Adaptive noise cancellation', 'Up to 42 hours battery life', 'Memory-foam ear cushions', 'USB-C fast charging'],
    price: 189, compareAt: 229, stock: 18, featured: true, archived: false, rating: 4.9, reviewCount: 128, createdAt: '2026-08-04',
    images: gallery('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=88', [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=88',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=88',
    ]),
    variants: [{ name: 'Color', values: ['Forest', 'Sand', 'Graphite'] }],
  },
  {
    id: 'P-1002', sku: 'HOM-TER-02', name: 'Terra Ceramic Set', slug: 'terra-ceramic-set', category: 'Home', brand: 'Hearth',
    description: 'A tactile four-piece stoneware set with subtle variations that make every place setting unique.',
    details: ['Set of four pieces', 'Hand-finished glaze', 'Dishwasher safe', 'Responsibly made in Portugal'],
    price: 84, stock: 32, featured: true, archived: false, rating: 4.8, reviewCount: 74, createdAt: '2026-08-20',
    images: gallery('https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=88', [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=88',
    ]),
    variants: [{ name: 'Glaze', values: ['Oat', 'Moss', 'Clay'] }],
  },
  {
    id: 'P-1003', sku: 'TRV-CAR-03', name: 'Carryall Weekender', slug: 'carryall-weekender', category: 'Travel', brand: 'North & Field',
    description: 'A structured weekender with smart compartments and a weather-resistant recycled canvas shell.',
    details: ['38L capacity', 'Padded laptop sleeve', 'Trolley pass-through', 'Recycled waxed canvas'],
    price: 128, compareAt: 149, stock: 7, featured: true, archived: false, rating: 4.7, reviewCount: 91, createdAt: '2026-07-11',
    images: gallery('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=88', [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=88',
    ]),
    variants: [{ name: 'Color', values: ['Olive', 'Navy', 'Natural'] }],
  },
  {
    id: 'P-1004', sku: 'WRK-ARC-04', name: 'Arc Desk Lamp', slug: 'arc-desk-lamp', category: 'Workspace', brand: 'Aster',
    description: 'A slim, sculptural task light with warm dimming and a focused, glare-free beam.',
    details: ['Three-stage warm dimming', 'Energy-efficient LED', 'Weighted stone base', '5-year warranty'],
    price: 96, stock: 24, featured: true, archived: false, rating: 4.9, reviewCount: 56, createdAt: '2026-08-09',
    images: gallery('https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=88', [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=88',
    ]),
    variants: [{ name: 'Finish', values: ['Brass', 'Black', 'Bone'] }],
  },
  {
    id: 'P-1005', sku: 'WLN-CED-05', name: 'Cedar Essential Oil Diffuser', slug: 'cedar-diffuser', category: 'Wellness', brand: 'Still',
    description: 'A quiet stone diffuser that brings a soft veil of fragrance to your evening routine.',
    details: ['Hand-finished ceramic cover', '4 and 8 hour modes', 'Auto shut-off', 'Whisper-quiet operation'],
    price: 68, stock: 4, featured: false, archived: false, rating: 4.6, reviewCount: 43, createdAt: '2026-06-29',
    images: gallery('https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Color', values: ['Stone', 'Charcoal'] }],
  },
  {
    id: 'P-1006', sku: 'WRK-KBR-06', name: 'Form Mechanical Keyboard', slug: 'form-keyboard', category: 'Workspace', brand: 'Keystone',
    description: 'A low-profile wireless mechanical keyboard designed for focused, satisfying work.',
    details: ['Tactile quiet switches', 'Multi-device Bluetooth', 'Mac and Windows layouts', 'Recycled aluminum case'],
    price: 142, stock: 11, featured: false, archived: false, rating: 4.8, reviewCount: 112, createdAt: '2026-05-16',
    images: gallery('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Layout', values: ['US', 'UK'] }, { name: 'Color', values: ['Mist', 'Graphite'] }],
  },
  {
    id: 'P-1007', sku: 'HOM-LIN-07', name: 'Washed Linen Throw', slug: 'linen-throw', category: 'Home', brand: 'Hearth',
    description: 'A breathable, softly textured linen layer for slow mornings and cooler evenings.',
    details: ['100% European flax linen', 'Garment washed', '130 × 180 cm', 'Machine washable'],
    price: 118, stock: 15, featured: false, archived: false, rating: 4.7, reviewCount: 39, createdAt: '2026-04-21',
    images: gallery('https://images.unsplash.com/photo-1583845112203-454c2254edb3?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Color', values: ['Sage', 'Oat', 'Rust'] }],
  },
  {
    id: 'P-1008', sku: 'TRV-BTL-08', name: 'Daytrip Thermal Bottle', slug: 'thermal-bottle', category: 'Travel', brand: 'North & Field',
    description: 'A durable insulated bottle with a ceramic-lined interior for a clean, fresh taste.',
    details: ['600 ml', 'Ceramic-lined stainless steel', '24-hour cold retention', 'Leakproof cap'],
    price: 42, stock: 0, featured: false, archived: false, rating: 4.5, reviewCount: 67, createdAt: '2026-03-08',
    images: gallery('https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Color', values: ['Juniper', 'Clay', 'Cream'] }],
  },
  {
    id: 'P-1009', sku: 'AUD-SPK-09', name: 'Pebble Mini Speaker', slug: 'pebble-speaker', category: 'Audio', brand: 'Sonora',
    description: 'Room-filling sound in a compact woven speaker designed to travel beautifully.',
    details: ['12-hour battery', 'Water resistant', 'Stereo pairing', 'USB-C charging'],
    price: 79, stock: 27, featured: false, archived: false, rating: 4.7, reviewCount: 84, createdAt: '2026-02-15',
    images: gallery('https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Color', values: ['Moss', 'Sand', 'Ink'] }],
  },
  {
    id: 'P-1010', sku: 'WLN-MAT-10', name: 'Grounded Yoga Mat', slug: 'grounded-yoga-mat', category: 'Wellness', brand: 'Still',
    description: 'A naturally grippy, supportive mat made for steady movement and mindful practice.',
    details: ['Natural rubber base', '5 mm cushioning', 'Closed-cell surface', 'Carry strap included'],
    price: 88, stock: 3, featured: false, archived: false, rating: 4.8, reviewCount: 51, createdAt: '2026-01-30',
    images: gallery('https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Color', values: ['Moss', 'Dune'] }],
  },
  {
    id: 'P-1011', sku: 'HOM-CLK-11', name: 'Quiet Table Clock', slug: 'quiet-clock', category: 'Home', brand: 'Aster',
    description: 'A silent minimalist clock in solid oak, designed for bedside tables and thoughtful workspaces.',
    details: ['Silent sweep movement', 'FSC-certified oak', 'Battery included', 'Designed in Copenhagen'],
    price: 54, stock: 19, featured: false, archived: false, rating: 4.6, reviewCount: 32, createdAt: '2025-12-12',
    images: gallery('https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Wood', values: ['Oak', 'Walnut'] }],
  },
  {
    id: 'P-1012', sku: 'TRV-PCH-12', name: 'Modular Tech Pouch', slug: 'modular-tech-pouch', category: 'Travel', brand: 'North & Field',
    description: 'An adaptable organizer that keeps cables, chargers, and small essentials exactly where they belong.',
    details: ['Flexible internal dividers', 'Water-resistant shell', 'Quick-access pocket', 'Recycled nylon'],
    price: 58, stock: 14, featured: false, archived: true, rating: 4.5, reviewCount: 24, createdAt: '2025-11-04',
    images: gallery('https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=1000&q=88'),
    variants: [{ name: 'Color', values: ['Olive', 'Black'] }],
  },
];

const sampleAddress = {
  firstName: 'Maya', lastName: 'Lin', email: 'maya@example.com', phone: '+1 415 555 0198',
  address: '1840 Grove Street', city: 'San Francisco', state: 'CA', postalCode: '94117', country: 'United States',
};

export const initialOrders: Order[] = [
  { id: 'EV-10482', customerId: 'C-001', customerName: 'Maya Lin', email: 'maya@example.com', date: '2026-09-12', status: 'Processing', items: [{ productId: 'P-1001', name: 'Drift Wireless Headphones', price: 189, image: initialProducts[0].images[0], quantity: 1, variant: { Color: 'Forest' } }], subtotal: 189, shipping: 0, discount: 18.9, tax: 14.46, total: 184.56, delivery: 'Standard', address: sampleAddress, paymentMethod: 'Visa •••• 4242' },
  { id: 'EV-10476', customerId: 'C-002', customerName: 'Elliot Stone', email: 'elliot@example.com', date: '2026-09-10', status: 'Shipped', items: [{ productId: 'P-1003', name: 'Carryall Weekender', price: 128, image: initialProducts[2].images[0], quantity: 1, variant: { Color: 'Olive' } }, { productId: 'P-1008', name: 'Daytrip Thermal Bottle', price: 42, image: initialProducts[7].images[0], quantity: 1, variant: { Color: 'Cream' } }], subtotal: 170, shipping: 14, discount: 0, tax: 14.72, total: 198.72, delivery: 'Express', address: { ...sampleAddress, firstName: 'Elliot', lastName: 'Stone', email: 'elliot@example.com' }, paymentMethod: 'Mastercard •••• 7801', trackingNumber: 'ETR392047561' },
  { id: 'EV-10451', customerId: 'C-001', customerName: 'Maya Lin', email: 'maya@example.com', date: '2026-08-26', status: 'Delivered', items: [{ productId: 'P-1004', name: 'Arc Desk Lamp', price: 96, image: initialProducts[3].images[0], quantity: 1, variant: { Finish: 'Brass' } }], subtotal: 96, shipping: 0, discount: 0, tax: 7.68, total: 103.68, delivery: 'Standard', address: sampleAddress, paymentMethod: 'Visa •••• 4242', trackingNumber: 'ETR390033821' },
  { id: 'EV-10433', customerId: 'C-003', customerName: 'Priya Shah', email: 'priya@example.com', date: '2026-08-19', status: 'Cancelled', items: [{ productId: 'P-1006', name: 'Form Mechanical Keyboard', price: 142, image: initialProducts[5].images[0], quantity: 1, variant: { Layout: 'US', Color: 'Mist' } }], subtotal: 142, shipping: 0, discount: 14.2, tax: 10.22, total: 138.02, delivery: 'Standard', address: { ...sampleAddress, firstName: 'Priya', lastName: 'Shah', email: 'priya@example.com' }, paymentMethod: 'Visa •••• 1887' },
];

export const initialCustomers: Customer[] = [
  { id: 'C-001', name: 'Maya Lin', email: 'maya@example.com', joined: '2025-06-18', orders: 6, spent: 748.32, status: 'Active', avatar: 'ML' },
  { id: 'C-002', name: 'Elliot Stone', email: 'elliot@example.com', joined: '2026-01-09', orders: 3, spent: 412.18, status: 'Active', avatar: 'ES' },
  { id: 'C-003', name: 'Priya Shah', email: 'priya@example.com', joined: '2025-11-27', orders: 4, spent: 536.44, status: 'Active', avatar: 'PS' },
  { id: 'C-004', name: 'Jon Bell', email: 'jon@example.com', joined: '2026-04-03', orders: 1, spent: 84, status: 'Blocked', avatar: 'JB' },
  { id: 'C-005', name: 'Sofia Reyes', email: 'sofia@example.com', joined: '2025-09-14', orders: 8, spent: 1092.65, status: 'Active', avatar: 'SR' },
];

export const initialPromotions: Promotion[] = [
  { id: 'PR-01', name: 'Welcome offer', code: 'WELCOME10', type: 'Percentage', value: 10, start: '2026-01-01', end: '2026-12-31', usage: 248, active: true },
  { id: 'PR-02', name: 'Autumn edit', code: 'AUTUMN15', type: 'Percentage', value: 15, start: '2026-09-01', end: '2026-10-15', usage: 82, active: true },
  { id: 'PR-03', name: 'Free delivery weekend', code: 'FREESHIP', type: 'Fixed', value: 12, start: '2026-08-14', end: '2026-08-16', usage: 116, active: false },
];

export const monthlySales = [
  { month: 'Apr', sales: 18400, orders: 124 },
  { month: 'May', sales: 22100, orders: 147 },
  { month: 'Jun', sales: 20800, orders: 139 },
  { month: 'Jul', sales: 26700, orders: 176 },
  { month: 'Aug', sales: 29400, orders: 198 },
  { month: 'Sep', sales: 32840, orders: 221 },
];
