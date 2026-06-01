import Link from "next/link";
import { 
  CalendarCheck, 
  Scissors, 
  GraduationCap, 
  Stethoscope, 
  Dumbbell,
  Link as LinkIcon,
  Mail,
  LayoutDashboard,
  UserX,
  Smartphone,
  Check
} from "lucide-react";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-700">BookZy</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-700 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-700 transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-blue-700 transition-colors">Pricing</a>
            </div>

            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Add my business — it&apos;s free
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* 2. HERO */}
        <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
          {/* Subtle blue gradient blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Your free booking page, <br className="hidden md:block" />
              ready in 5 minutes
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop managing appointments on WhatsApp. Give your customers a booking link — salons, tutors, clinics, and coaches across India are already using it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 flex items-center justify-center"
              >
                Get started free
              </Link>
              <a 
                href="#how-it-works" 
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

        {/* 3. SOCIAL PROOF BAR */}
        <section className="border-y border-slate-100 bg-slate-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
              Trusted by service businesses across India
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
              <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
                <Scissors className="w-8 h-8" />
                <span className="font-medium">Salons</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
                <GraduationCap className="w-8 h-8" />
                <span className="font-medium">Tutors</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
                <Stethoscope className="w-8 h-8" />
                <span className="font-medium">Clinics</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
                <Dumbbell className="w-8 h-8" />
                <span className="font-medium">Fitness Studios</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES (Bento Grid) */}
        <section id="features" className="py-24 bg-white scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to run your business</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Powerful, simple tools designed specifically for Indian service professionals.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: LinkIcon, title: "Custom Booking Link", desc: "Get a professional bookzy.in/your-name link to share anywhere." },
                { icon: CalendarCheck, title: "Real-time Availability", desc: "Customers only see the slots you actually have open." },
                { icon: Mail, title: "Instant Confirmations", desc: "Automated email receipts sent to you and your customer instantly." },
                { icon: LayoutDashboard, title: "Owner Dashboard", desc: "A clean, private dashboard to view your schedule at a glance." },
                { icon: UserX, title: "No-show Tracking", desc: "Keep track of clients who missed appointments easily." },
                { icon: Smartphone, title: "Mobile Friendly", desc: "Looks beautiful and works perfectly on any smartphone." }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-12 w-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-slate-50 scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works</h2>
              <p className="text-lg text-slate-600">Get up and running in minutes, not days.</p>
            </div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {[
                { step: 1, title: "Create your account", desc: "Sign up with just your email. It's completely free and no credit card is required." },
                { step: 2, title: "Add services & hours", desc: "List what you do, how long it takes, and exactly when you're available to work." },
                { step: 3, title: "Share & get booked", desc: "Put your link on WhatsApp, Instagram, or your website and watch the bookings roll in." }
              ].map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-slate-50 bg-blue-700 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-xl font-bold z-10">
                    {item.step}
                  </div>
                  <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. PRICING */}
        <section id="pricing" className="py-24 bg-white scroll-mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-slate-600">Start for free, upgrade when you need to.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Free Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['1 service type', '30 bookings per month', 'Basic booking page', 'Email confirmations'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login" 
                  className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl text-center transition-colors"
                >
                  Get started free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-blue-700 rounded-3xl p-8 shadow-lg relative flex flex-col bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-700 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹299</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Unlimited services', 'Unlimited bookings', 'Custom branding', 'No-show tracking', 'Priority support'].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login" 
                  className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-center transition-colors shadow-md shadow-blue-700/20"
                >
                  Start Pro plan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
              <p className="text-lg text-slate-600">Got questions? We&apos;ve got answers.</p>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-100 rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to stop managing bookings on WhatsApp?
            </h2>
            <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
              Join hundreds of Indian service businesses already using BookZy.
            </p>
            <Link 
              href="/login" 
              className="inline-block px-8 py-4 text-base font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-700/20"
            >
              Add my business for free
            </Link>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-700 text-white">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-900">BookZy</span>
            <span className="text-slate-400 text-sm ml-2">| Made for Indian businesses</span>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          </div>
          
          <div className="text-sm text-slate-500">
            © 2026 BookZy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
