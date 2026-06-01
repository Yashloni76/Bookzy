# BookZy

## 📖 What is BookZy?

**BookZy** is a premium, lightweight appointment booking SaaS designed specifically to solve the scheduling chaos faced by Indian small service businesses—such as **Salons, Clinics, Tutors, Coaching Centres, and Freelancers**.

Many small businesses in India currently manage appointments by answering phone calls, scribbling in notebooks, or scrolling through endless WhatsApp messages. This leads to double-bookings, lost appointments, and frustrated customers. 

**BookZy changes this.** It provides business owners with a professional, centralized dashboard to manage their time, and it gives them a beautiful, custom public booking link (e.g., `bookzy.in/priya-salon`). Customers can simply click the link, pick an open time slot, and instantly confirm their appointment—all without needing to download an app or create an account. 

---

## ⚙️ How It Works (The Complete Flow)

BookZy is split into two seamless experiences: The **Owner Dashboard** and the **Customer Booking Page**.

### 1. The Business Owner Setup Flow
1. **Passwordless Sign-Up:** The business owner visits the BookZy homepage and logs in using just their professional email address. A secure Magic Link or OTP is sent to their inbox via Supabase Auth (no passwords to remember).
2. **Onboarding Wizard:** Upon their first login, the owner is guided through a clean, step-by-step onboarding process:
   - *Step 1:* They enter their business name, category, and city. A custom URL slug (like `/dr-kumar-clinic`) is automatically generated.
   - *Step 2:* They add the **Services** they offer, specifying how long each service takes (e.g., "Root Canal - 45 minutes") and the price.
   - *Step 3:* They define their **Working Hours** for each day of the week (e.g., Monday-Friday, 9:00 AM to 5:00 PM).
3. **The Dashboard:** Once onboarded, the owner lands on their private Dashboard. Here they can view their schedule for the day, see upcoming appointments, manually block off time for lunch or vacations, and update their services.
4. **Sharing the Link:** The owner clicks the "Share Link" button to copy their custom URL or download a QR code, which they then paste into their WhatsApp status, Instagram bio, or directly to clients.

### 2. The Customer Booking Flow
1. **Opening the Link:** A customer clicks the business's link on Instagram or WhatsApp and lands on their clean, mobile-optimized public booking page.
2. **Choosing a Service:** The customer sees a list of available services and clicks the one they want.
3. **Dynamic Slot Generation:** The customer picks a date on the calendar. BookZy's backend instantly calculates available time slots by taking the business's open hours and *subtracting* any existing bookings or manually blocked slots on that day.
4. **Entering Details & Confirming:** The customer selects a green time slot, enters their name, WhatsApp number, and email, and clicks "Book".
5. **Instant Notifications:** As soon as the booking is made, the business owner sees it appear on their live dashboard. Simultaneously, **Nodemailer** sends a beautifully formatted confirmation email to both the customer and the owner with the appointment details and a cancellation link.

---

## 🚀 Key Features

### For Business Owners
- **Passwordless Authentication:** Secure login using email magic links and OTPs via Supabase Auth.
- **Onboarding Wizard:** Quick 4-step setup for new businesses.
- **Dashboard Hub:** View "Today's Schedule" at a glance and process upcoming appointments (Mark as Completed, Cancel, No-Show).
- **Service Management:** Add, edit, and deactivate services with custom durations and prices.
- **Availability Control:** Set weekly operating hours and manually block off specific dates and times for vacations or breaks.
- **Custom Booking Link:** Shareable QR codes and unique URLs to send to clients via WhatsApp or Instagram.

### For Customers
- **No Login Required:** Frictionless booking experience.
- **Real-Time Availability:** The booking engine calculates open slots dynamically to prevent double-booking.
- **Self-Serve Cancellations:** Customers receive an email with a secure token link allowing them to cancel their own appointment if needed.
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
