"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createServicesAction } from "@/app/onboarding/actions";
import { Plus, Trash2 } from "lucide-react";

type Service = {
  name: string;
  duration_minutes: number;
  price: number | "";
};

export function StepServices({
  businessId,
  onNext,
}: {
  businessId: string;
  onNext: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Service[]>([
    { name: "", duration_minutes: 30, price: "" },
  ]);

  const addService = () => {
    setServices([...services, { name: "", duration_minutes: 30, price: "" }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const validServices = services.filter((s) => s.name.trim() !== "");

    if (validServices.length === 0) {
      setError("Please add at least one service.");
      setIsLoading(false);
      return;
    }

    const result = await createServicesAction(businessId, validServices);

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
        <CardTitle>Add Services</CardTitle>
        <CardDescription>
          What services do you offer? You can add more or edit these later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex gap-4 items-end bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex-1 space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    required
                    placeholder="e.g. Haircut"
                    value={service.name}
                    onChange={(e) => updateService(index, "name", e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    required
                    type="number"
                    min="5"
                    step="5"
                    value={service.duration_minutes}
                    onChange={(e) => updateService(index, "duration_minutes", Number(e.target.value))}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Price (₹) (Opt)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={service.price}
                    onChange={(e) => updateService(index, "price", e.target.value)}
                  />
                </div>
                {services.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mb-1 h-12 w-12 p-0 text-slate-400 hover:text-red-600"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={addService}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add another service
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
