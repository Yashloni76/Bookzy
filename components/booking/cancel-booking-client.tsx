"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { XCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CancelBookingClient({ booking, token }: { booking: any, token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(booking.status === "cancelled");
  const [error, setError] = useState("");
  const router = useRouter();

  const businessName = booking.businesses?.business_name || "the business";
  const serviceName = booking.services?.name || "Service";
  const businessSlug = booking.businesses?.slug;

  const handleCancel = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/public/booking/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_token: token }),
      });
      if (res.ok) {
        setIsCancelled(true);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to cancel booking");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    return format(d, "h:mm a");
  };

  if (isCancelled) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Cancelled</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Your appointment has been successfully cancelled.
        </p>
        {businessSlug && (
          <Link href={`/${businessSlug}`}>
            <Button variant="secondary" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {businessName}
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-center mb-2">Cancel Appointment?</h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
        Are you sure you want to cancel your appointment with <strong>{businessName}</strong>?
      </p>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 mb-8">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Service</span>
          <span className="font-medium text-sm">{serviceName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Date</span>
          <span className="font-medium text-sm">{format(new Date(booking.appointment_date), "MMMM d, yyyy")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Time</span>
          <span className="font-medium text-sm">{formatTime(booking.start_time)}</span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 h-11" 
          onClick={handleCancel}
          disabled={isLoading}
        >
          {isLoading ? "Cancelling..." : "Yes, Cancel Appointment"}
        </Button>
        {businessSlug && (
          <Link href={`/${businessSlug}`} className="block">
            <Button variant="ghost" className="w-full text-slate-500 dark:text-slate-400 h-11">
              Keep Appointment
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
