"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createWorkingHoursAction } from "@/app/onboarding/actions";

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
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

export function StepWorkingHours({
  businessId,
  onNext,
}: {
  businessId: string;
  onNext: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Default Monday-Friday 09:00 to 18:00, Sat-Sun closed
  const [hours, setHours] = useState<DayHours[]>(
    DAYS.map((_, index) => ({
      day_of_week: index,
      open_time: "09:00",
      close_time: "18:00",
      is_closed: index === 0 || index === 6,
    }))
  );

  const updateDay = (index: number, updates: Partial<DayHours>) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], ...updates };
    setHours(newHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await createWorkingHoursAction(businessId, hours);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardDescription>
          When are you available for bookings?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {hours.map((day, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border rounded-lg bg-white border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-32 justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!day.is_closed}
                      onChange={(e) => updateDay(index, { is_closed: !e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700"
                    />
                    <Label className={day.is_closed ? "text-slate-400" : ""}>{DAYS[index]}</Label>
                  </div>
                  {day.is_closed && (
                    <div className="text-sm text-slate-400 sm:hidden">Closed</div>
                  )}
                </div>
                
                {day.is_closed ? (
                  <div className="hidden sm:block text-sm text-slate-400">Closed</div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:flex-1">
                    <Input
                      type="time"
                      value={day.open_time}
                      onChange={(e) => updateDay(index, { open_time: e.target.value })}
                      required={!day.is_closed}
                      className="h-10 flex-1 sm:w-auto"
                    />
                    <span className="text-slate-400">to</span>
                    <Input
                      type="time"
                      value={day.close_time}
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Finish Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
