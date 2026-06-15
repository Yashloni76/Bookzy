"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  CalendarCheck, 
  CalendarDays, 
  Scissors, 
  Settings, 
  Share2,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { name: "Today's Schedule", href: "/dashboard", icon: CalendarCheck },
  { name: "All Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "Services", href: "/dashboard/services", icon: Scissors },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-20">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-bold">
          <CalendarCheck className="h-6 w-6 text-blue-700" />
          BookZy
        </div>
        <button onClick={toggle} className="text-slate-600 dark:text-slate-400 focus:outline-none">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-30" 
          onClick={toggle}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 hidden lg:flex items-center gap-2 text-slate-900 dark:text-slate-50 font-bold text-xl">
          <CalendarCheck className="h-7 w-7 text-blue-700" />
          BookZy
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-50"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Link href="/dashboard/share" className="w-full" onClick={() => setIsOpen(false)}>
            <Button variant="secondary" className="w-full gap-2 justify-center">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className="flex-1 gap-2 justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 dark:text-slate-400 dark:hover:text-slate-100" 
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
