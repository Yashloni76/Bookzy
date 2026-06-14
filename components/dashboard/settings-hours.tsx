"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateWorkingHoursAction } from "@/app/(dashboard)/dashboard/settings/actions";
import { Loader2 } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type DayHours = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export function SettingsHours({ businessId, initialHours }: { businessId: string; initialHours: DayHours[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Sort by day_of_week to ensure correct order
  const sortedHours = [...initialHours].sort((a, b) => a.day_of_week - b.day_of_week);
  
  // Fill in any missing days just in case
  const completeHours = DAYS.map((_, index) => {
    const existing = sortedHours.find(h => h.day_of_week === index);
    return existing || {
      day_of_week: index,
      open_time: "09:00",
      close_time: "18:00",
      is_closed: true,
    };
  });

  const [hours, setHours] = useState<DayHours[]>(completeHours);

  const updateDay = (index: number, updates: Partial<DayHours>) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], ...updates };
    setHours(newHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const result = await updateWorkingHoursAction(businessId, hours);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Working hours updated successfully!");
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardDescription>
          Configure your weekly availability. These hours govern when customers can book your services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="space-y-4">
            {hours.map((day, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-white border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-32 shrink-0 justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!day.is_closed}
                      onChange={(e) => updateDay(index, { is_closed: !e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                    />
                    <Label className={day.is_closed ? "text-slate-400" : "font-semibold"}>{DAYS[index]}</Label>
                  </div>
                  {day.is_closed && (
                    <div className="text-sm text-slate-400 font-medium sm:hidden">Closed</div>
                  )}
                </div>
                
                {day.is_closed ? (
                  <div className="hidden sm:block text-sm text-slate-400 font-medium">Closed</div>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:flex-1">
                    <Input
                      type="time"
                      value={day.open_time || "09:00"}
                      onChange={(e) => updateDay(index, { open_time: e.target.value })}
                      required={!day.is_closed}
                      className="h-10 flex-1 sm:w-auto"
                    />
                    <span className="text-slate-400 text-sm font-medium">to</span>
                    <Input
                      type="time"
                      value={day.close_time || "18:00"}
                      onChange={(e) => updateDay(index, { close_time: e.target.value })}
                      required={!day.is_closed}
                      className="h-10 flex-1 sm:w-auto"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600 font-medium">{message}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
