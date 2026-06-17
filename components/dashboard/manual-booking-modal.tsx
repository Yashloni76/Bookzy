"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XCircle, CalendarIcon, Clock } from "lucide-react";
import { createManualBookingAction, getAvailableSlots } from "@/app/(dashboard)/dashboard/bookings/actions";

export function ManualBookingModal({ 
  open, 
  setOpen, 
  services 
}: { 
  open: boolean; 
  setOpen: (open: boolean) => void;
  services: any[];
}) {
  const [step, setStep] = useState<"service" | "datetime" | "details">("service");
  
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Details state
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  // Generate next 14 days
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
      const { slots, error } = await getAvailableSlots(serviceId, date);
      if (error) {
        setAvailableSlots([]);
      } else {
        setAvailableSlots(slots || []);
      }
    } catch (error) {
      setAvailableSlots([]);
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const handleServiceSelect = (service: any) => {
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
    
    const formData = new FormData();
    formData.append("service_id", selectedService.id);
    formData.append("date", selectedDate);
    formData.append("start_time", selectedTime);
    formData.append("customer_name", customerName);
    formData.append("customer_whatsapp", customerWhatsapp);
    if (customerEmail) formData.append("customer_email", customerEmail);
    if (notes) formData.append("notes", notes);
    formData.append("send_email", sendEmail ? "true" : "false");

    const result = await createManualBookingAction(formData);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setOpen(false);
      // Reset state for next time
      setStep("service");
      setSelectedService(null);
      setCustomerName("");
      setCustomerWhatsapp("");
      setCustomerEmail("");
      setNotes("");
      setSendEmail(true);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!customerEmail) {
      setSendEmail(false);
    }
  }, [customerEmail]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/50" onClick={() => setOpen(false)}>
      <div 
        className="bg-white dark:bg-slate-900 w-full h-full sm:w-[450px] sm:h-screen shadow-xl overflow-y-auto animate-in slide-in-from-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">New Booking</h2>
          <Button variant="ghost" className="h-8 px-2" onClick={() => setOpen(false)} aria-label="Close form">
            <XCircle className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {step !== "service" && (
            <Button variant="ghost" className="mb-2 -ml-3" onClick={() => setStep(step === "datetime" ? "service" : "datetime")}>
              &larr; Back
            </Button>
          )}

          {step === "service" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Select Service</h3>
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/50"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="font-medium text-slate-900 dark:text-slate-50">{service.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{service.duration_minutes} mins</div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-sm text-slate-500">No services available. Add services first.</p>
              )}
            </div>
          )}

          {step === "datetime" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="font-medium text-blue-900 dark:text-blue-100">{selectedService?.name}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">{selectedService?.duration_minutes} mins</div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center text-sm text-slate-900 dark:text-slate-50">
                  <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" /> 
                  Date
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => handleDateChange(d.value)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg border ${selectedDate === d.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
                    >
                      <div className={`text-xs ${selectedDate === d.value ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {d.label.split(',')[0]}
                      </div>
                      <div className={`font-medium text-sm ${selectedDate === d.value ? 'text-white' : 'text-slate-900 dark:text-slate-50'}`}>
                        {d.label.split(',')[1].trim()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center text-sm text-slate-900 dark:text-slate-50">
                  <Clock className="w-4 h-4 mr-2 text-slate-400" /> 
                  Time
                </h3>
                {isFetchingSlots ? (
                  <div className="text-sm text-slate-500 py-4 text-center">Loading slots...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/50">No slots available.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-2 rounded-lg border text-sm font-medium ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 text-slate-900 dark:text-slate-50'}`}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                className="w-full mt-4" 
                disabled={!selectedTime}
                onClick={() => setStep("details")}
              >
                Continue
              </Button>
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-4 text-sm">
                <div className="font-medium text-slate-900 dark:text-slate-50">{selectedService?.name}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-1">
                  {format(new Date(selectedDate), "MMM d, yyyy")} at {selectedTime ? formatTime(selectedTime) : ""}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input 
                  id="name" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  required 
                  placeholder="John Doe" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input 
                  id="whatsapp" 
                  value={customerWhatsapp} 
                  onChange={e => setCustomerWhatsapp(e.target.value)} 
                  required 
                  placeholder="9876543210" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={customerEmail} 
                  onChange={e => {
                    setCustomerEmail(e.target.value);
                    if (e.target.value && customerEmail === "") {
                      setSendEmail(true);
                    }
                  }} 
                  placeholder="john@example.com" 
                />
              </div>

              {customerEmail && (
                <div className="flex items-center space-x-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="send_email" 
                    checked={sendEmail} 
                    onChange={e => setSendEmail(e.target.checked)} 
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="send_email" className="text-sm font-normal">Send email confirmation to customer</Label>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input 
                  id="notes" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Any special requests..." 
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
