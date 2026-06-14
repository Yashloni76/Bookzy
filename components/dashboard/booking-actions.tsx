"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserX } from "lucide-react";

export function BookingActions({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (currentStatus !== "confirmed") {
    return null;
  }

  const updateStatus = async (status: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update status");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("An error occurred");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="secondary" 
        className="text-green-600 border-green-200 hover:bg-green-50 px-3 py-1 h-9"
        onClick={() => updateStatus("completed")}
        disabled={isLoading}
      >
        <CheckCircle2 className="w-4 h-4 mr-1" />
        Complete
      </Button>
      <Button 
        variant="secondary" 
        className="text-red-600 border-red-200 hover:bg-red-50 px-3 py-1 h-9"
        onClick={() => updateStatus("no_show")}
        disabled={isLoading}
      >
        <UserX className="w-4 h-4 mr-1" />
        No Show
      </Button>
      {error && (
        <div className="absolute mt-10 text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded px-2 py-1 shadow-sm whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
