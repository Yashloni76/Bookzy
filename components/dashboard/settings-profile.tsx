"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateBusinessProfileAction } from "@/app/(dashboard)/dashboard/settings/actions";
import { Loader2 } from "lucide-react";

export function SettingsProfile({ business }: { business: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await updateBusinessProfileAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Business profile updated successfully!");
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>
          Update your public business details and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" required defaultValue={business.business_name} />
          </div>
          <div className="space-y-2">
            <Label>Booking URL Slug</Label>
            <Input disabled defaultValue={`localhost:3000/${business.slug}`} className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Contact support to change your booking URL.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required defaultValue={business.category || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input id="whatsapp" name="whatsapp" required defaultValue={business.whatsapp_number || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required defaultValue={business.city || ""} />
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
