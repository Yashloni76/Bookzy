# BookZy AI Context

This file is the living handoff for future AI/coding sessions. Read this before changing code, and update it after meaningful product, architecture, database, setup, or implementation changes.

## Current Workspace

Active project path:

```text
D:\BookZy
```

Old copied workspace may still exist at:

```text
C:\Users\yashl\Documents\Sloppe
```

Do not work from the old copy unless the user explicitly asks. The active project is `D:\BookZy`.

GitHub remote:

```text
https://github.com/Yashloni76/BookZy.git
```

Current branch:

```text
main
```

## Product

BookZy is an appointment booking SaaS for Indian small service businesses.

Target businesses:

- Salon
- Tutor
- Clinic
- Coaching Centre
- Fitness/Yoga
- Freelancer
- Other

Mechanic was removed from the initial supported category list by user decision.

Every business gets a public booking link like:

```text
bookzy.in/priya-salon
```

Customers open the link, choose a service, pick a date/time, and book without creating an account.

Business owners log in, set up their business, add services, configure working hours, share their booking link, and manage bookings.

## PRD Source

The PRD is stored at:

```text
D:\BookZy\BookZy_PRD.docx
```

The PRD was read on 2026-05-31. Main product direction:

- Build a SaaS booking product for Indian SMBs.
- Replace WhatsApp/phone/paper scheduling with a booking link.
- Start with free/low-cost MVP infrastructure.
- WhatsApp automation is deferred for now because the user does not want paid plans or free trials.
- Email-first confirmation/reminder path is acceptable for MVP.

## MVP Scope

Must-have:

- Owner email OTP login through Supabase Auth.
- Business onboarding.
- Shareable public booking page per business slug.
- Service management: name, duration, optional price, active toggle.
- Working hours by day of week.
- Public customer booking flow with no customer login.
- Real-time slot availability.
- Booking creation.
- Email booking confirmation.
- Dashboard showing today's appointments.
- Booking statuses: `confirmed`, `completed`, `cancelled`, `no_show`.

Should-have:

- No-show tracking.
- Manual slot blocking.
- Customer self-cancellation.

Deferred:

- WhatsApp confirmations/reminders.
- Razorpay/payment at booking.
- Multi-staff/team scheduling.
- Native mobile app.
- Google Calendar/Outlook integration.
- Video consultations.
- Analytics page.
- Customers page.

## User Decisions So Far

Owner-side first, customer-side later.

Owner UI direction:

- Style: premium booking tool.
- Color: blue plus white/light neutral.
- First login/incomplete setup: step-by-step onboarding wizard/checklist.
- Returning owner: Today’s Schedule dashboard.
- Auth: email OTP only, no password UI.
- Tone: professional.

Owner pages selected:

```text
/login
/onboarding
/dashboard
/dashboard/bookings
/dashboard/services
/dashboard/settings
/dashboard/share
```

Do not build these yet:

```text
/dashboard/customers
/dashboard/analytics
```

Blocked slots should be handled inside dashboard/bookings for now, not as a separate page.

Onboarding should be a clean step-by-step wizard:

1. Business profile
2. Services
3. Working hours
4. Booking link

## Visual/UI Reference

User generated owner-side UI through Stitch and exported it here:

```text
D:\BookZy\stitch-output\stitch_BookZy_merchant_dashboard
```

Important files in Stitch export:

```text
BookZy_design_system\DESIGN.md
login_BookZy_2\screen.png
login_BookZy_2\code.html
setup_business_profile_BookZy_2\screen.png
setup_business_profile_BookZy_2\code.html
today_s_schedule_BookZy_2\screen.png
today_s_schedule_BookZy_2\code.html
manage_services_BookZy_2\screen.png
all_bookings_BookZy_2\screen.png
settings_BookZy_2\screen.png
share_link_BookZy_2\screen.png
```

Use Stitch as visual reference only. Do not paste raw Stitch HTML directly into the app.

Why:

- Stitch output is static HTML.
- It uses CDN Tailwind.
- It uses Material Symbols.
- Our app should use React, TypeScript, Tailwind, and lucide-react.

Extract style ideas, layout, spacing, and tokens, then implement clean React components.

## Tech Stack

Planned/current:

- Next.js App Router
- React 18
- TypeScript
- Tailwind CSS
- lucide-react
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Supabase Storage later for logos
- Resend for emails
- Vercel deployment later

Current package notes:

- `next` is pinned to `14.2.0`.
- `eslint-config-next` is pinned to `14.2.0`.
- npm warned that `next@14.2.0` has a security vulnerability.
- For local MVP development this was accepted temporarily.
- Before public deployment, upgrade to a patched Next 14 version.
- Tailwind is pinned to v3 because the project uses Tailwind v3 config:
  - `tailwindcss@3.4.17`
  - `postcss@8.4.49`
  - `autoprefixer@10.4.20`

Important Windows command note:

Use `npm.cmd`, not `npm`, because PowerShell blocks `npm.ps1` on this machine.

Examples:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd exec tsc -- --noEmit
```

## Environment

Local env file:

```text
D:\BookZy\.env.local
```

Expected variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
WATI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Current state:

- Supabase URL is set.
- Supabase public/publishable key is set.
- Supabase service role key is set.
- Resend API key is set.
- `WATI_API_KEY` intentionally remains blank because WhatsApp automation is deferred.

Security note:

The Supabase service role key was pasted in chat on 2026-05-31. Treat it as exposed. Rotate/regenerate before production or shared deployment. Never commit `.env.local` or any service role key.

## Supabase Auth Settings

User said this is done:

Supabase Dashboard → Authentication → URL Configuration:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
```

## Database

Supabase tables were manually created in SQL Editor on 2026-05-31.

Existing tables:

```text
businesses
services
business_hours
blocked_slots
customers
bookings
reminders_log
```

Initial schema migration file:

```text
D:\BookZy\supabase\migrations\0001_initial_schema.sql
```

Migration includes:

- tables
- constraints
- indexes
- `updated_at` trigger function
- triggers
- RLS enabled
- first-pass RLS policies

Expected table purposes:

- `businesses`: one row per business/owner.
- `services`: bookable services for a business.
- `business_hours`: weekly working hours.
- `blocked_slots`: manually blocked date/time ranges.
- `customers`: customer directory per business.
- `bookings`: appointments.
- `reminders_log`: track sent confirmations/reminders to prevent duplicates.

Important schema fields from migration:

`businesses`

- `id`
- `owner_id`
- `business_name`
- `slug`
- `category`
- `city`
- `whatsapp_number`
- `description`
- `logo_url`
- `is_active`
- `created_at`
- `updated_at`

`services`

- `id`
- `business_id`
- `name`
- `duration_minutes`
- `price`
- `is_active`
- `created_at`
- `updated_at`

`business_hours`

- `id`
- `business_id`
- `day_of_week`
- `open_time`
- `close_time`
- `is_closed`
- `created_at`
- `updated_at`

`blocked_slots`

- `id`
- `business_id`
- `block_date`
- `start_time`
- `end_time`
- `reason`
- `created_at`

`customers`

- `id`
- `business_id`
- `name`
- `whatsapp_number`
- `email`
- `no_show_count`
- `created_at`
- `updated_at`

`bookings`

- `id`
- `business_id`
- `service_id`
- `customer_id`
- `customer_name`
- `customer_whatsapp`
- `customer_email`
- `appointment_date`
- `start_time`
- `end_time`
- `status`
- `notes`
- `cancel_token`
- `cancelled_at`
- `created_at`
- `updated_at`

`reminders_log`

- `id`
- `booking_id`
- `reminder_type`
- `channel`
- `sent_at`
- `provider_message_id`

## Slot Availability Logic

Core algorithm:

1. Fetch `business_hours` for the requested day of week.
2. If closed, return empty.
3. Generate possible time slots between open and close using selected service duration.
4. Fetch confirmed bookings for same business/date.
5. Fetch blocked slots for same business/date.
6. Remove generated slots that overlap bookings/blocks.
7. Return available slots.

Overlap rule:

```ts
slot.start < booking.end && slot.end > booking.start
```

Use inclusive start/exclusive end:

```text
[start, end)
```

Current implementation:

```text
D:\BookZy\lib\availability\slots.ts
```

Currently contains `rangesOverlap`.

Current test:

```text
D:\BookZy\tests\availability\slots.test.ts
```

Tests partial overlap and back-to-back slots.

## Current File Structure

Important app files:

```text
app/
  (auth)/
    login/
      page.tsx
  auth/
    callback/
      route.ts
  (dashboard)/
    dashboard/
      bookings/
        page.tsx
      services/
        page.tsx
      settings/
        page.tsx
      page.tsx
  [slug]/
    page.tsx
  api/
    dashboard/
      block/
        route.ts
      bookings/
        [id]/
          route.ts
        route.ts
      hours/
        route.ts
      services/
        [id]/
          route.ts
        route.ts
    public/
      [slug]/
        book/
          route.ts
        slots/
          route.ts
        route.ts
      booking/
        [id]/
          cancel/
            route.ts
  onboarding/
    page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  auth/
    login-form.tsx
  booking/
  dashboard/
  marketing/
  ui/
config/
  site.ts
lib/
  availability/
    slots.ts
  supabase/
    admin.ts
    client.ts
    middleware.ts
    server.ts
  validations/
    booking.ts
    business.ts
    service.ts
  env.ts
  utils.ts
middleware.ts
supabase/
  migrations/
    0001_initial_schema.sql
  seed.sql
tests/
  availability/
    slots.test.ts
types/
  database.ts
  BookZy.ts
```

## Implemented Code State

Supabase app wiring added:

```text
lib/env.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
lib/supabase/middleware.ts
middleware.ts
```

Purpose:

- `lib/env.ts`: required env validation.
- `client.ts`: browser Supabase client.
- `server.ts`: server Supabase client using cookies.
- `admin.ts`: service-role Supabase client for backend-only operations.
- `middleware.ts`: refresh Supabase auth session.
- root `middleware.ts`: applies session middleware.

### Unified Auth Callback Route

The authentication callback route (`app/auth/callback/route.ts`) has been completely refactored to support both auth flows:

1. **PKCE Flow (GET `?code=...`):** Standard Magic Links/OTPs are securely exchanged on the server using `supabase.auth.exchangeCodeForSession`.
2. **Implicit Flow (Bypass Login / hash-fragment):** Because administrative `admin.auth.generateLink` (OTP/Magic Link bypasses) generates an **Implicit Flow link** containing session tokens in the URL hash fragment (`#access_token=...&refresh_token=...`) which is never sent to the server, we return a lightweight self-contained HTML/JS page. The browser reads the hash fragment and `POST`s the session tokens back to the server. The `POST` handler then uses `supabase.auth.setSession` to set the server-side session cookies.

### RLS Bypass for Owner Administration

To prevent database-level select discrepancies and ensure high performance during the MVP phase, all server-side page components securely verify the authenticated user via `supabase.auth.getUser()` and then load their associated data via the **Admin Client** (`createSupabaseAdminClient()`). This resolves RLS select issues and secures dashboard navigation:

- `app/onboarding/page.tsx`: secure user check + Admin query. Redirects to `/dashboard` if onboarding is complete.
- `app/(dashboard)/dashboard/layout.tsx`: secure user check + Admin query. Redirects to `/onboarding` if no business exists.
- `app/(dashboard)/dashboard/services/page.tsx`: queries business and bookable services via Admin client.
- `app/(dashboard)/dashboard/settings/page.tsx`: queries business and weekly operating hours via Admin client.

---

## Current Verification State

Known passing:

```powershell
npm.cmd run build
```

This successfully compiles Next.js static and dynamic pages with **0 compilation errors** and **0 type errors**.

```powershell
npm.cmd exec tsc -- --noEmit
```

TypeScript health check is fully green.

Verified UI:

- `/login` responds on the Next.js dev server.
- Clicking the orange **Bypass** button instantly establishes the session, handles hash processing, and routes to `/onboarding` or `/dashboard`.
- Complete onboarding flows write to the database tables seamlessly.
- Landing on `/onboarding` after completing the wizard instantly redirects to `/dashboard`.
- Dashboard (`/dashboard`) shows dynamic scheduling, bookings list, and quick status actions.
- All Bookings (`/dashboard/bookings`) supports client-side filtering, detailed slide-overs, and a Slot Blocker component.
- Share Link (`/dashboard/share`) generates native QR codes, handles clipboard copying, and provides WhatsApp share integration.
- Services (`/dashboard/services`) and Settings (`/dashboard/settings`) pages load live PostgreSQL data correctly.

### Routing Conflict Fixes
- `app/[slug]/page.tsx` was intercepting core routes (like the Supabase Magic Link redirecting to `/` if misconfigured). We added a strict `RESERVED_SLUGS` check to return `notFound()` if it catches `login`, `onboarding`, `dashboard`, `auth`, `api`, or `booking`.

---

## Current Concern / Handoff To Gemini or Antigravity

The immediate verification tasks are completed. Both the owner dashboard suite and the customer public booking flow are now fully functional and stable.

Recent cleanups:
- The developer bypass button has been completely removed from the login form.
- A functional Sign Out button was added to the owner sidebar.
- Route protection is strictly enforced in the Next.js middleware (protecting `/dashboard` and `/onboarding` while keeping `/login`, `/[slug]`, `/booking`, and `/api/public` explicitly public).

The immediate next technical focus is:
1. Build the **Landing Page** (Root `/` page) to explain the SaaS.
2. Prepare for **Vercel deployment**.

---

## Commands

Install:

```powershell
cd D:\BookZy
npm.cmd install
```

TypeScript:

```powershell
npm.cmd exec tsc -- --noEmit
```

Dev server:

```powershell
npm.cmd run dev
```

Build:

```powershell
npm.cmd run build
```

Tests:

```powershell
npm.cmd test
```

---

## Notes For Future AI

- Use `D:\BookZy` as cwd.
- Do not commit `.env.local`.
- Do not expose the service role key.
- Do not build WhatsApp automation now (deferred).
- Do not build payments now (deferred).
- Owner onboarding, dashboard shell, services list, and business settings are completed. Focus next on the **customer booking flow** and dynamic slots availability.

## Last Updated

2026-06-01
