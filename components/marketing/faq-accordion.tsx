"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is BookZy really free?",
    answer: "Yes! Our core features are 100% free forever. This includes your booking page, up to 30 bookings per month, and email confirmations. We also offer a Pro plan for businesses that need unlimited bookings and advanced features."
  },
  {
    question: "Do my customers need to download an app?",
    answer: "No. Your customers simply click your booking link, pick a service, select a time, and confirm their booking directly in their browser. It's fast, frictionless, and works on any device."
  },
  {
    question: "Can I manage my own working hours?",
    answer: "Absolutely. You can set your exact open and close times for every day of the week, and easily block out time for holidays or personal breaks so customers can't double-book you."
  },
  {
    question: "How do I get notified of new bookings?",
    answer: "We send you an instant email confirmation as soon as a customer books a slot. Your dashboard will also automatically update in real-time to reflect your latest schedule."
  },
  {
    question: "Can I cancel a booking if I'm not available?",
    answer: "Yes, you can manage all your bookings directly from your dashboard. If something comes up, you can easily mark an appointment as cancelled or no-show, which frees up the slot for someone else."
  }
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
              <ChevronDown 
                className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-5 pt-0 text-slate-600 leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
