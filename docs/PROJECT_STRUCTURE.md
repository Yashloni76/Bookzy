# BookZy Project Structure

This tree is the planned MVP layout. Empty placeholder files are included so the folders are visible before feature implementation starts.

```text
BookZy/
  app/
    (auth)/
      login/
        page.tsx
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
        bookings/
          [id]/
            route.ts
          route.ts
        block/
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
    dashboard/
    booking/
    marketing/
    ui/
  config/
    site.ts
  docs/
    PROJECT_STRUCTURE.md
  lib/
    availability/
      slots.ts
    supabase/
      client.ts
      middleware.ts
      server.ts
    utils.ts
    validations/
      booking.ts
      business.ts
      service.ts
  public/
    .gitkeep
  scripts/
    .gitkeep
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
  .env.example
  .gitignore
  README.md
```

## Main Areas

- `app/`: Next.js routes, pages, layouts, and API route handlers.
- `app/[slug]/`: Public customer booking page for each business.
- `app/(dashboard)/dashboard/`: Protected owner dashboard.
- `app/api/public/`: Public APIs for business profile, slots, booking, and cancellation.
- `app/api/dashboard/`: Auth-protected APIs for owner operations.
- `components/`: Reusable UI grouped by product area.
- `lib/availability/`: Slot generation and overlap logic.
- `lib/supabase/`: Supabase browser/server clients and auth helpers.
- `lib/validations/`: Request validation schemas.
- `supabase/migrations/`: SQL schema, indexes, constraints, and RLS policies.
- `types/`: Shared TypeScript types.
- `tests/`: Focused tests, especially for slot availability.
