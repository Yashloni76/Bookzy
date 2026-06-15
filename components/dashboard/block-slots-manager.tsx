"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, CalendarX2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BlockSlotsManager({ initialBlockedSlots }: { initialBlockedSlots: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  const handleBlockSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDeleteError("");

    const formData = new FormData(e.currentTarget);
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;

    const payload = {
      block_date: formData.get("block_date"),
      start_time,
      end_time,
      reason: formData.get("reason"),
    };

    if (start_time >= end_time) {
      setError("End time must be after start time");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/dashboard/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to block slot");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this block?")) return;
    setDeleteError("");
    
    try {
      const res = await fetch(`/api/dashboard/block`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setDeleteError(data.error || "Failed to remove blocked slot");
      }
    } catch (err) {
      setDeleteError("An error occurred");
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    return format(d, "h:mm a");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Block a Time Slot</CardTitle>
          <CardDescription>Prevent customers from booking during a specific time.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBlockSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block_date">Date</Label>
              <Input type="date" id="block_date" name="block_date" required min={format(new Date(), "yyyy-MM-dd")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input type="time" id="start_time" name="start_time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input type="time" id="end_time" name="end_time" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input type="text" id="reason" name="reason" placeholder="e.g., Lunch break, Maintenance" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Blocking..." : "Block Slot"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Blocked Slots</CardTitle>
          <CardDescription>Your currently blocked time periods.</CardDescription>
        </CardHeader>
        <CardContent>
          {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
          {initialBlockedSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
              <CalendarX2 className="w-8 h-8 mb-2 text-slate-300" />
              <p>No blocked slots</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialBlockedSlots.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {format(new Date(block.block_date), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(block.start_time)} - {formatTime(block.end_time)}
                    </div>
                    {block.reason && <div className="text-xs text-slate-400 mt-1">{block.reason}</div>}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                    onClick={() => handleDelete(block.id)}
                    aria-label="Delete blocked slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
