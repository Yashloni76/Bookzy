# BookZy

**BookZy** is a simple, premium appointment scheduling tool designed to help small service businesses in India—like salons, clinics, and freelancers—manage their bookings without the usual WhatsApp back-and-forth.

Instead of writing down appointments in a notebook, business owners get a clean dashboard and a custom booking link (e.g., `bookzy.in/priya-salon`). Customers click the link, pick a time slot, and book instantly. No downloads, no passwords.

## How It Works

1. **For the Business Owner:** You log in securely with an email magic link. After a quick 4-step setup where you add your services and working hours, you're dropped into your dashboard. From there, you just share your unique booking link with clients on WhatsApp or Instagram.
2. **For the Customer:** Your client clicks the link, sees what times you're actually available, and books a slot. You both get an instant email confirmation.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React
- **Backend & Database:** Supabase (PostgreSQL, Auth, RLS)
- **Emails:** Nodemailer (via Gmail SMTP)

## Local Setup

1. **Clone & Install:**
   ```bash
   git clone https://github.com/Yashloni76/Bookzy.git
   cd Bookzy
   npm install # Use npm.cmd on Windows if needed
   ```

2. **Database:** 
   Run the migration file (`supabase/migrations/0001_initial_schema.sql`) in your Supabase SQL Editor to create the necessary tables and rules.

3. **Environment Variables:** 
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   EMAIL_USER=your_gmail
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` to start using BookZy!
