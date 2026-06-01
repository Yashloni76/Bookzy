"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle2, MessageCircle, Share2, Hash, MapPin } from "lucide-react";

export function ShareView({ businessName, slug }: { businessName: string, slug: string }) {
  const [copied, setCopied] = useState(false);

  // Fallback to window.location.origin if NEXT_PUBLIC_APP_URL is somehow missing
  const appUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const bookingUrl = `${appUrl}/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Book an appointment with ${businessName}: ${bookingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Share Booking Link</h1>
        <p className="text-slate-500 mt-1">Get more customers by sharing your unique booking page.</p>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <QRCodeSVG value={bookingUrl} size={160} level="M" includeMargin={false} />
            </div>
            
            <div className="flex-1 w-full space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Your Public Booking Link</label>
                <div className="flex gap-2">
                  <Input readOnly value={bookingUrl} className="bg-slate-50 font-medium text-blue-600" />
                  <Button onClick={handleCopy} className="shrink-0 w-24">
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button 
                  onClick={handleWhatsAppShare} 
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm h-12 text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
          <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Hash className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Instagram Bio</h3>
            <p className="text-xs text-slate-500">Add this link to your Instagram bio so followers can easily book.</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">WhatsApp Customers</h3>
            <p className="text-xs text-slate-500">Send it to customers on WhatsApp instead of typing out schedules.</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
          <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Google Maps</h3>
            <p className="text-xs text-slate-500">Add it to your Google Maps listing as your official appointment link.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
