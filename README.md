# NexaCart E-commerce

A complete responsive Philippine marketplace storefront and commerce administration dashboard built with React 19, TypeScript, Vinext/Vite, Tailwind CSS 4, shadcn components, and Recharts.

## Included experiences

- NexaCart marketplace home, responsive global/catalog search, hash-based navigation, category/deal shortcuts, catalog filtering/sorting/pagination, product galleries, variants, reviews, wishlist, and persistent cart
- Validated three-step checkout, promotion codes, stock protection, mock card processing, confirmation, customer profile, and order history
- Mock registration and sign-in with customer/admin roles
- Admin overview, sales charts, product archive/restore, category and brand management, stock controls, order status updates, customer controls, promotions, reports, CSV export, and low-stock alerts
- Loading, empty, success, error, out-of-stock, and destructive-action confirmation states

All app data runs locally in mock mode and is saved in browser `localStorage` under `nexacart-commerce-v2`. Existing data from `everlane-commerce-v1` is migrated automatically on first load, so carts, wishlists, orders, and admin changes are preserved. No real payment or personal data is transmitted.

Prices are displayed in Philippine pesos using the shared formatter in `lib/ecommerce-service.ts`. The seeded mock dataset retains its original base values and converts them consistently at a fixed demo rate of ₱58 per base unit, including checkout totals and dashboard reports.

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
- Administrator: `admin@nexacart.test` / `demo123`
- Mock checkout card: `4242 4242 4242 4242`, any future `MM/YY`, and any 3–4 digit CVC

Authentication and payment are intentionally mocked for local demonstration. The typed functions in `lib/ecommerce-service.ts` form the integration boundary for replacing mock behavior with backend endpoints or a real payment provider.

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm test` covers catalog browsing, product details, cart rules, checkout validation/totals, mock login roles, order status management, and inventory/admin behavior.

## Production deployment

Build and preview the optimized Cloudflare Worker-compatible output locally:

```bash
npm run build
npm start
```

The repository includes `.openai/hosting.json` and the OpenAI Sites Vite plugin. The configured Sites project ID is reused for updates; publish through the Sites hosting workflow after `npm run build`. For a compatible Cloudflare deployment, use the generated `dist/server/wrangler.json` with Wrangler after authenticating your account.

The current owner-private Sites deployment is available at `https://nexacart-marketplace.veloemmanueljosh15.chatgpt.site`. Open it while signed in to the owning account.

## Backend integration notes

- Replace mock arrays in `lib/mock-data.ts` with API responses.
- Keep cart validation both client-side and server-side; never trust submitted prices or stock counts.
- Replace the mock payment delay with a server-created payment intent/token flow. Never place secret keys in client code.
- Move customer, order, product, inventory, and promotion records to an authenticated backend before accepting real transactions.
- Use server-side authorization for all admin operations.
