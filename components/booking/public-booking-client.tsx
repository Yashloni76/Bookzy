"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Calendar as CalendarIcon, Clock, ArrowLeft, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
};

export function PublicBookingClient({ 
  businessSlug, 
  services,
  businessName,
  whatsappNumber
}: { 
  businessSlug: string; 
  services: Service[]; 
  businessName?: string;
  whatsappNumber?: string | null;
}) {
  const [step, setStep] = useState<"service" | "datetime" | "details" | "success">("service");
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState<{ id: string, cancel_token: string } | null>(null);
  
  const router = useRouter();

  // Generate next 14 days for date selection
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return {
      value: format(d, "yyyy-MM-dd"),
      label: format(d, "EEE, MMM d"),
    };
  });

  const fetchSlots = async (date: string, serviceId: string) => {
    setIsFetchingSlots(true);
    setSelectedTime(null);
    try {
      const res = await fetch(`/api/public/${businessSlug}/slots?service_id=${serviceId}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error(error);
      setAvailableSlots([]);
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("datetime");
    fetchSlots(selectedDate, service.id);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedService) {
      fetchSlots(date, selectedService.id);
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    return format(d, "h:mm a");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedService || !selectedTime) return;

    setIsSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const payload = {
      service_id: selectedService.id,
      date: selectedDate,
      start_time: selectedTime,
      customer_name: formData.get("name"),
      customer_whatsapp: formData.get("whatsapp"),
      customer_email: formData.get("email"),
      notes: formData.get("notes"),
    };

    try {
      const res = await fetch(`/api/public/${businessSlug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingData({ id: data.booking_id, cancel_token: data.cancel_token });
        setStep("success");
      } else {
        const data = await res.json();
        setError(data.error || "Booking failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <Card className="text-center p-8 max-w-lg mx-auto">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-slate-900 dark:text-slate-50 font-medium text-lg mb-2">
          Your appointment is confirmed for {selectedService?.name} on {format(new Date(selectedDate), "MMMM d")} at {selectedTime ? formatTime(selectedTime) : ""}.
        </p>
        
        {whatsappNumber && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-100 my-6">
            <p className="font-medium flex flex-col items-center gap-2">
              Need to make changes? Contact {businessName} on WhatsApp:
              <a 
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {whatsappNumber}
              </a>
            </p>
          </div>
        )}

        {bookingData && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg my-6 text-sm text-amber-800 text-left">
            <p className="font-semibold mb-1">Important: Keep this link to cancel or reschedule</p>
            <p className="mb-3">Save this page or screenshot it - you&apos;ll need this link if you need to cancel your appointment.</p>
            <Link 
              href={`/booking/${bookingData.id}/cancel?token=${bookingData.cancel_token}`}
              className="text-red-600 hover:text-red-700 font-medium underline underline-offset-4"
            >
              Cancel this booking
            </Link>
          </div>
        )}

        <Button onClick={() => window.location.reload()} className="w-full mt-2" variant="secondary">
          Book Another Appointment
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {step !== "service" && (
        <Button variant="ghost" className="mb-4" onClick={() => setStep(step === "datetime" ? "service" : "datetime")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}

      {step === "service" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">{service.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{service.duration_minutes} minutes</p>
                </div>
                {service.price && (
                  <div className="font-semibold text-slate-900 dark:text-slate-50">₹{service.price}</div>
                )}
              </CardContent>
            </Card>
          ))}
          {services.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400">No active services available.</p>
          )}
        </div>
      )}

      {step === "datetime" && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
            <div>
              <div className="font-medium">{selectedService?.name}</div>
              <div className="text-sm text-blue-600">{selectedService?.duration_minutes} minutes</div>
            </div>
            <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => setStep("service")}>Change</Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" /> 
              Select Date
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDateChange(d.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border ${selectedDate === d.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
                >
                  <div className={`text-xs ${selectedDate === d.value ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {d.label.split(',')[0]}
                  </div>
                  <div className="font-medium">
                    {d.label.split(',')[1].trim()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-slate-400" /> 
              Select Time
            </h3>
            {isFetchingSlots ? (
              <div className="text-slate-500 dark:text-slate-400 py-4 text-center">Loading available slots...</div>
            ) : availableSlots.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-400 py-4 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/50">No slots available on this date.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button 
            className="w-full h-12 text-lg mt-8" 
            disabled={!selectedTime}
            onClick={() => setStep("details")}
          >
            Continue
          </Button>
        </div>
      )}

      {step === "details" && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <h3 className="font-medium text-lg mb-1">{selectedService?.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> {format(new Date(selectedDate), "MMMM d, yyyy")}
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4" /> {selectedTime ? formatTime(selectedTime) : ""}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input id="whatsapp" name="whatsapp" required placeholder="+91 9876543210" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" />
              <p className="text-xs text-slate-500 dark:text-slate-400">We&apos;ll send a confirmation email if provided.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Any notes for the business? (Optional)</Label>
              <Input id="notes" name="notes" placeholder="E.g., I have a specific request..." />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 text-lg mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : "Confirm Booking"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
