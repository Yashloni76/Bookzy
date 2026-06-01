# BookZy

**BookZy** is a premium, lightweight appointment booking SaaS specifically designed for Indian small service businesses (Salons, Clinics, Tutors, Coaching Centres, and Freelancers). 

It replaces cluttered WhatsApp scheduling with a professional, centralized dashboard and custom public booking links (e.g., `bookzy.in/priya-salon`).

---

## 🚀 Features

### For Business Owners
- **Passwordless Authentication:** Secure login using email magic links and OTPs via Supabase Auth.
- **Onboarding Wizard:** Quick 4-step setup for new businesses.
- **Dashboard Hub:** View "Today's Schedule" at a glance and process upcoming appointments (Mark as Completed, Cancel, No-Show).
- **Service Management:** Add, edit, and deactivate services with custom durations and prices.
- **Availability Control:** Set weekly operating hours and manually block off specific dates and times for vacations or breaks.
- **Custom Booking Link:** Shareable QR codes and unique URLs to send to clients via WhatsApp or Instagram.

### For Customers
- **No Login Required:** Frictionless booking experience.
- **Real-Time Availability:** The booking engine calculates open slots dynamically based on the business's working hours, active bookings, and blocked slots to prevent double-booking.
- **Instant Email Confirmations:** Both the business owner and the customer receive immediate email receipts.

---

## 🛠 Tech Stack

**Frontend & Core Framework**
- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

**Styling & UI**
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (Icons)
- shadcn/ui inspired components

**Backend & Database**
- [Supabase](https://supabase.com/) (PostgreSQL Database)
- Supabase Auth (Passwordless Email/OTP)
- Supabase Row Level Security (RLS) Policies

**Infrastructure & Integrations**
- [Nodemailer](https://nodemailer.com/) (Using Gmail SMTP for free transactional emails)
- Next.js Server Components & Server Actions

---

## 💻 Local Setup & Installation

### Prerequisites
1. **Node.js** (v18+)
2. **Supabase Account** (Create a free project at supabase.com)
3. **Gmail Account** (For sending emails via Nodemailer App Password)

### 1. Clone the repository
```bash
git clone https://github.com/Yashloni76/Bookzy.git
cd Bookzy
```

### 2. Install dependencies
*Note for Windows users: If PowerShell blocks `npm`, use `npm.cmd`.*
```bash
npm install
```

### 3. Set up the Database
Go to your Supabase project dashboard -> **SQL Editor**, and run the entire contents of the migration file to set up tables, triggers, and Row Level Security:
```bash
supabase/migrations/0001_initial_schema.sql
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following keys. You will find your Supabase keys under **Project Settings -> API**.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App URL Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Nodemailer via Gmail)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_character_google_app_password
```

### 5. Configure Supabase Authentication
In your Supabase Dashboard:
1. Go to **Authentication -> URL Configuration**.
2. Set the **Site URL** to `http://localhost:3000`.
3. Set the **Redirect URL** to `http://localhost:3000/auth/callback`.

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 📁 Project Structure

```
BookZy/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (auth)/           # Login routes
│   ├── (dashboard)/      # Protected owner dashboard routes
│   ├── [slug]/           # Dynamic public booking pages
│   └── api/              # Serverless API endpoints
├── components/           # Reusable React components
│   ├── auth/             # Login forms
│   ├── booking/          # Public booking engine UI
│   ├── dashboard/        # Internal dashboard panels
│   └── ui/               # Base UI elements (Buttons, Inputs, Dialogs)
├── lib/                  # Utilities and business logic
│   ├── availability/     # Complex slot generation algorithms
│   └── supabase/         # Supabase client initializers
├── supabase/             # Database migrations and seed files
└── types/                # Global TypeScript definitions
```

---

## 🤝 Contributing & AI Handoff

If you are an AI assistant or a developer picking up this project, please refer to the following living context files before making architectural changes:
- `AI.md` (System state, decisions, and immediate next steps)
- `docs/PROJECT_STRUCTURE.md` (Detailed folder breakdown)
- `audit_report.md` (Production readiness and security audit)

---

**© 2026 BookZy. Made for Indian businesses.**
