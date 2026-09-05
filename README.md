# Self-Destructing X — Auto-Follow Link Platform

This repository contains a Next.js 14 (App Router + TypeScript) project scaffolded for a "Self-Destructing X Auto-Follow Link Platform". Key integrations: Neon Postgres, Manus AI, Zapier webhooks, and an access-key auth scheme ("Akpoge"). Generated links expire after 1 hour and are removed (auto-explode) via a cron endpoint and on-the-fly checks.

## Quick start

1. Install dependencies
   - npm: `npm install`
   - or yarn: `yarn`

2. Copy and edit environment variables
   - `cp .env.example .env.local`
   - Fill in DATABASE_URL, APP_URL, MANUS_API_KEY, ZAPIER_WEBHOOK_URL as described below.

3. Run dev server
   - `npm run dev`
   - Open http://localhost:3000

## Environment variables

- ACCESS_KEY (default example: Akpoge) — the access key used for simple auth.
- DATABASE_URL — Neon Postgres connection string (serverless-compatible).
- APP_URL — Production app URL (used in webhook redirects).
- MANUS_API_URL — default provided in `.env.example`.
- MANUS_API_KEY — your Manus API key for browser automation.
- ZAPIER_WEBHOOK_URL — Zapier webhook URL to fire downstream triggers.

## Neon Postgres setup

1. Create a Neon project at https://neon.tech/.
2. Create a serverless branch (recommended for serverless apps).
3. Copy the database connection string and set it as DATABASE_URL in your environment.
4. Use @neondatabase/serverless from server-side code to connect to Neon.

## Manus API key (browser automation)

1. Sign up at Manus (https://manus.im/) and obtain an API key.
2. Set MANUS_API_KEY in your environment.
3. Use the Manus helper in `lib/manus.ts` to create browser automation jobs (this project includes a Manus helper file).

## Zapier webhook

1. In Zapier, create a Zap that starts with "Webhook → Catch Hook".
2. Copy the generated webhook URL and set ZAPIER_WEBHOOK_URL in your environment.
3. The platform will POST to that URL to inform downstream systems about exploded/expired links or events.

## Deployment (Vercel)

1. Push this repository to GitHub or Git provider.
2. Create a new Vercel project and connect the repository.
3. In Vercel project settings, add the environment variables (same keys as `.env.example`).
4. This repository contains `vercel.json` with a scheduled cron:
   - Path: `/api/cron/explode`
   - Schedule: `0 * * * *` (every hour)
   Ensure Vercel cron jobs are supported on your plan or configure an external scheduler if needed.

## Design notes

- Links have a 1-hour TTL. Expiry is enforced both on-access (on-the-fly) and by a cron endpoint (`/api/cron/explode`) which performs a sweep and "explodes" expired links.
- Integrations:
  - Neon Postgres for link storage.
  - Manus for automated browser interactions.
  - Zapier for downstream automation/webhooks.
- Authentication: simple access-key approach using ACCESS_KEY (Akpoge by default). Production systems should consider stronger auth.

## Next steps

- Add the App Router pages and API routes (app/api/*).
- Implement DB migrations / schema for links and explosion timestamps.
- Implement Manus job creation and Zapier notification wiring.
