"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 flex flex-col gap-4 z-50 animate-in slide-in-from-top-2">
          <a 
            href="#features" 
            className="text-slate-600 font-medium hover:text-blue-700 px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-slate-600 font-medium hover:text-blue-700 px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            How it works
          </a>
          <a 
            href="#pricing" 
            className="text-slate-600 font-medium hover:text-blue-700 px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </a>
          <hr className="border-slate-100" />
          <Link 
            href="/login" 
            className="px-4 py-3 text-center text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Add my business — it&apos;s free
          </Link>
        </div>
      )}
    </div>
  );
}
