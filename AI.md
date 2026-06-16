# BookZy AI Context

This file is the living handoff for future AI/coding sessions. Read this before changing code, and update it after meaningful product, architecture, database, setup, or implementation changes.

## Current Workspace

Active project path: `D:\BookZy` (Windows environment). Use `npm.cmd` instead of `npm`.
GitHub remote: `https://github.com/Yashloni76/Bookzy.git`
Current branch: `main`

## Product Overview

BookZy is an appointment booking SaaS for Indian small service businesses (Salons, Tutors, Clinics, Fitness, etc.).
- **Businesses** get a public booking link (e.g. `bookzy.in/priya-salon`).
- **Customers** book open slots through the link without needing an account.
- **Owners** log in via email OTP, set up their business, manage services, set working hours, and manage bookings.

## MVP Features
- Passwordless email auth (Supabase).
- Step-by-step business onboarding.
- Real-time slot availability (checks working hours, existing bookings, and blocked slots).
- Dashboard for viewing today's schedule and managing bookings.
- Email confirmations sent via Nodemailer.
- Public, shareable booking page with QR code.
- Forced light mode by default for new users.

## Tech Stack
- Next.js 14.2 (App Router)
- React 18, TypeScript, Tailwind CSS, lucide-react
- Supabase Auth & PostgreSQL (with RLS)
- Nodemailer (Gmail SMTP)

## Supabase Auth & Routing Notes
- We use a hybrid Auth callback approach. Magic links handle server-side exchange, while explicit OTPs bypass the standard flow and submit the hash fragment to the server.
- **Edge Runtime Constraint:** The Next.js `middleware.ts` runs on Vercel's Edge network, which lacks Node.js APIs. We previously tried using `@supabase/ssr` inside the middleware, which caused 500 errors on Vercel because of unsupported crypto modules. To fix this, our middleware now performs a lightweight edge-compatible string check on the `sb-*-auth-token` cookies. **Never import `@supabase/ssr` or Node.js modules in `middleware.ts`.**
- For owner administration components, we use `createSupabaseAdminClient()` to bypass RLS during the MVP phase to ensure smooth data fetching, while verifying the user session beforehand.

## Environment Variables
Expected keys in `.env.local`:
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```
*(Do not commit `.env.local` or expose the service role key)*

## Recent Updates
- Updated `SettingsProfile` and `ShareView` to properly use `NEXT_PUBLIC_APP_URL` instead of hardcoding `localhost:3000`.
- Adjusted `next-themes` in `layout.tsx` to default to `light` mode for new users so the app doesn't unexpectedly launch in dark mode if their system defaults to dark.

## Next Steps
1. Implement API Rate Limiting on the public booking route (`/api/public/[slug]/book/route.ts`) to prevent spam.
2. Refactor Admin Client usages back to Server Client to leverage Supabase RLS natively.
3. Improve mobile responsiveness for the dashboard.

## Last Updated
2026-06-16
