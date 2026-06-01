"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserX } from "lucide-react";

export function BookingActions({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (currentStatus !== "confirmed") {
    return null;
  }

  const updateStatus = async (status: string) => {
    setIsLoading(true);
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
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("An error occurred");
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
    </div>
  );
}
