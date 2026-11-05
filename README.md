# QuickShop — Next.js + PostgreSQL (no MongoDB)

This is the Next.js App Router version of QuickShop. It preserves the existing design, product images, browsing, search, cart, login/registration, cash-on-delivery checkout, order history and order tracking. There is no Express server and no MongoDB dependency.

## Local setup — just two commands

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without any environment variables, the app creates `.data/quickshop.json` automatically and seeds the catalog. Users, passwords (bcrypt hashes), orders, stock and subscribers persist locally across development restarts. `.data/` is ignored by git. This file store is for local development only.

Optional checks:

```bash
npm test
npm run build
```

## GitHub and Vercel deployment (PostgreSQL via Neon)

**Why is an online database still needed?** Vercel's function filesystem is ephemeral. Permanent sign-ups and orders require a hosted data service. This version uses **PostgreSQL**, not MongoDB. No database migration or table creation command is required; the first request creates and seeds `quickshop_store` automatically.

1. Create a PostgreSQL database in [Neon](https://neon.tech/) (or through Vercel's Storage/Marketplace integrations). Copy its **pooled PostgreSQL connection string**. Use the full URL including `sslmode=require` where provided.
2. In **Vercel → Project → Settings → Environment Variables**, configure:
   - `DATABASE_URL`: the PostgreSQL connection string (or use `POSTGRES_URL` if injected by your Vercel integration).
   - `JWT_SECRET`: a strong random secret of **at least 32 characters**; keep it server-only.
3. Make the variables available to Production and optionally Preview, then **redeploy** the current GitHub commit. In Build Settings use Framework **Next.js** and leave Root Directory at the repository root (the folder containing `package.json`).
4. The application automatically creates the storage table and seeds the catalog when the first database-dependent API request runs. No MongoDB, Prisma migrations or separate API server are needed.
5. Test `/api/health`, `/api/products`, registration, login, COD checkout, order history and `/track/<order-id>` on the deployed site.

**Important:** If the hosted database has not been configured, browsing the catalog still works with sample items, but login, registration, checkout and order persistence cannot work on Vercel. Existing MongoDB accounts and orders are **not** transferred automatically. New users must register again unless the old data is separately exported and migrated.

## Publish updated files to your existing GitHub repository

Replace the files in `github.com/Guddoo7980/quickShop-nextjs-final` with the **contents** of this extracted folder (not an extra nested folder), then:

```bash
git add .
git commit -m "Replace MongoDB with PostgreSQL and fix Vercel setup"
git push origin main
```

A GitHub-connected Vercel project will start deploying that new commit. Add `DATABASE_URL` and `JWT_SECRET` before the redeploy. Never commit `.env` or `.env.local`.

## Architecture / limitations

- API endpoints run inside Next.js (no separately running Express process).
- Database: transactional JSONB state in PostgreSQL for this small demo. Each order/stock change locks and updates the store atomically; this design is **not optimized for a high-traffic production marketplace** and should later be normalized into indexed relational tables.
- Authentication: bcrypt-hashed passwords and JWT bearer tokens stored in browser local storage. For a production commerce rollout, move to secure httpOnly cookies and add rate limiting, email verification, and observability.
- Order tracking: polls order status about every 12 seconds. **No live rider GPS**, no real logistics integration, and no status changes unless an authorized admin/backend updates them.
- Cash-on-delivery only; no actual online payment processing.
- Local development file storage is single-process only, and is intentionally disabled on Vercel.
- Existing reusable views are in `views/` instead of root `pages/` to avoid the Vercel prerender/context error.
- `npm test` runs an integration flow against a local Next.js dev server. Run the same manual user journeys after connecting production PostgreSQL.

## Troubleshooting

- **Database not configured:** Add `DATABASE_URL` (or `POSTGRES_URL`) to Vercel, including the environment you are deploying, and redeploy.
- **Service temporarily unavailable:** check Vercel Functions logs and confirm the database URL, network access and PostgreSQL credentials.
- **401 unauthorized:** register/sign in again; ensure `JWT_SECRET` remains stable across deployments.
- **Build prerender context error:** don't create root `pages/CheckoutPage.jsx`; reusable screens live in `views/`.
- **No products before setup:** `/api/products` intentionally returns seeded samples without requiring credentials. Account creation, persistent stock and checkout require the database.
