# BookZy 📅

> Appointment booking for Indian small businesses

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Live URL:** [https://bookzy-five.vercel.app](https://bookzy-five.vercel.app)

BookZy is a SaaS appointment booking platform built as a student project for Indian small service businesses — salons, tutors, clinics, coaching centres, and fitness studios. It replaces WhatsApp-based scheduling with a free, professional booking link that customers can use 24/7 without needing to create an account.

---

## ✨ Features

### 🏢 For Business Owners
* **🔑 Passwordless Login:** Secure Email OTP login (no passwords to remember).
* **🚀 Quick Onboarding:** Step-by-step wizard to set up business profile, services, and working hours.
* **📊 Dashboard & Analytics:** View today's schedule, track bookings per week, busiest days, and most popular services.
* **📅 Schedule Management:** Manage bookings (confirm, complete, no-show, cancel) and add manual entries for walk-in/phone customers.
* **⚙️ Customization:** Manage services, set working hours per day, and manually block slots for breaks or holidays.
* **🔗 Easy Sharing:** Share your booking page via QR code, copy link, or direct WhatsApp share.

### 👤 For Customers
* **🌍 Public Booking Page:** Accessible via a simple URL (`/[slug]`, e.g., `/priya-salon`).
* **⚡ No Account Needed:** Frictionless booking without requiring login or signup.
* **📅 Intuitive Interface:** Easy service selection, date picker, and real-time slot availability.
* **📝 Simple Form:** Just provide name, WhatsApp number, and optional email.
* **🔔 Notifications:** Email confirmation with a self-cancellation token for easy management.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email OTP) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Deployment** | Vercel |
| **Icons & Utilities** | lucide-react, qrcode.react |

---

## 🏗️ Architecture & Key Technical Decisions

1. **Auth Implementation:** PKCE auth was replaced with a 6-digit OTP to avoid cross-site cookie issues on the Vercel Edge runtime.
2. **Concurrency Control:** Double-booking is prevented at the database level using a PostgreSQL `EXCLUDE` constraint with the `btree_gist` extension, providing robust protection beyond application-level checks.
3. **Middleware:** Utilizes an Edge-compatible middleware with zero external dependencies (pure Next.js, no `@supabase/ssr` in middleware) for performance and reliability.
4. **Data Fetching:** The admin client (service role) is used server-side for all data fetching to bypass Row Level Security (RLS) for internal operations. RLS remains enabled as a defense-in-depth layer.
5. **Rate Limiting:** Implemented on the public booking API to prevent abuse (5 requests per IP per 10 minutes).

### Production Hardening
The application went through a rigorous 6-area audit before deployment:
* **Security:** RLS policies enforced, environment variables audited, API ownership checks implemented, and zero exposed secrets.
* **Database:** Foreign key constraints, proper indexing, and `EXCLUDE` constraints for race conditions.
* **Backend:** Strict input validation, state transition rules, and sanitized error messages.
* **Frontend:** Removed all `alert()` calls, implemented proper loading states, and improved accessibility (aria-labels).
* **UX Flows:** Fixed dead buttons, enhanced confirmation screens, and enabled cancellation without requiring email verification.
* **Mobile:** iOS zoom fix applied for text-based inputs, responsive mobile card layouts, and hamburger navigation added.

### Database Schema
Core tables include: `businesses`, `services`, `business_hours`, `blocked_slots`, `customers`, `bookings`, `reminders_log`.

---

## 🚀 Getting Started

Follow these steps to set up BookZy locally:

### 1. Clone the repository
```bash
git clone https://github.com/Yashloni76/Slotpe.git
cd Slotpe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_USER=
EMAIL_PASS=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
Run the migrations in your Supabase SQL Editor:
1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_prevent_double_booking.sql`

### 5. Run the application
```bash
npm run dev
```

### 🧑‍💻 Available Commands
* `npm run dev` — Start the development server
* `npm run build` — Create a production build
* `npm run test` — Run availability tests
* `npx tsc --noEmit` — Run TypeScript compiler for type checking

---

## 🗺️ Roadmap

Future enhancements planned for BookZy:
* [ ] Vacation Mode (block out multiple days easily)
* [ ] Razorpay integration for optional advance payments
* [ ] WhatsApp integration for automated booking reminders
* [ ] Multi-staff support for businesses with multiple employees

---

## 🤝 Contributing

This is an open-source student project, and pull requests are welcome! Feel free to open an issue or submit a PR if you have suggestions for improvements.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Built with ❤️ for Indian businesses
</p>
