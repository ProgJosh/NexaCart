# Everlane E-commerce

A complete responsive customer storefront and commerce administration dashboard built with React 19, TypeScript, Vinext/Vite, Tailwind CSS 4, shadcn components, and Recharts.

## Included experiences

- Home, catalog search/filter/sort/pagination, product galleries, variants, reviews, wishlist, and persistent cart
- Validated three-step checkout, promotion codes, stock protection, mock card processing, confirmation, customer profile, and order history
- Mock registration and sign-in with customer/admin roles
- Admin overview, sales charts, product archive/restore, category and brand management, stock controls, order status updates, customer controls, promotions, reports, CSV export, and low-stock alerts
- Loading, empty, success, error, out-of-stock, and destructive-action confirmation states

All app data runs locally in mock mode and is saved in browser `localStorage` under `everlane-commerce-v1`. No real payment or personal data is transmitted.

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer

## Setup and development

```bash
npm install
npm run dev
```

Open the local URL printed by the development command (normally `http://localhost:3000`).

## Demo accounts

- Customer: `maya@example.com` / `demo123`
- Administrator: `admin@everlane.test` / `demo123`
- Mock checkout card: `4242 4242 4242 4242`, any future `MM/YY`, and any 3–4 digit CVC

Authentication and payment are intentionally mocked for local demonstration. The typed functions in `lib/ecommerce-service.ts` form the integration boundary for replacing mock behavior with backend endpoints or a real payment provider.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

`npm test` covers catalog browsing, product details, cart rules, checkout validation/totals, mock login roles, order status management, and inventory/admin behavior.

## Production deployment

Build the optimized Cloudflare Worker-compatible output:

```bash
npm run build
npm start
```

The repository includes `.openai/hosting.json` and the OpenAI Sites Vite plugin. Use the Sites publishing workflow to create a private hosted deployment, or deploy the generated Worker output with your preferred compatible Cloudflare workflow.

## Backend integration notes

- Replace mock arrays in `lib/mock-data.ts` with API responses.
- Keep cart validation both client-side and server-side; never trust submitted prices or stock counts.
- Replace the mock payment delay with a server-created payment intent/token flow. Never place secret keys in client code.
- Move customer, order, product, inventory, and promotion records to an authenticated backend before accepting real transactions.
- Use server-side authorization for all admin operations.
