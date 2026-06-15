"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Clock, User, Phone, CheckCircle2, UserX, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function BookingsList({ initialBookings }: { initialBookings: any[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const todayStr = format(today, "yyyy-MM-dd");

  const filteredBookings = initialBookings.filter(b => {
    if (activeTab === "all") return true;
    if (activeTab === "today") return b.appointment_date === todayStr;
    if (activeTab === "upcoming") return b.appointment_date > todayStr || (b.appointment_date === todayStr && b.status === "confirmed"); // Simplified upcoming logic
    if (activeTab === "past") return b.appointment_date < todayStr || (b.appointment_date === todayStr && (b.status === "completed" || b.status === "no_show"));
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const updateStatus = async (bookingId: string, status: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status });
        }
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update status");
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 flex w-full overflow-x-auto whitespace-nowrap scrollbar-hide justify-start md:justify-center p-1">
          <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
          <TabsTrigger value="today" className="flex-shrink-0">Today</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-shrink-0">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="flex-shrink-0">Past</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-shrink-0">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <CalendarClock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">No bookings found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">There are no bookings matching this filter.</p>
            </Card>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Service</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr 
                        key={booking.id} 
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900 dark:text-slate-50">
                            {format(new Date(booking.appointment_date), "MMM d, yyyy")}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(booking.start_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-slate-50">{booking.customer_name}</div>
                          <div className="text-slate-500 dark:text-slate-400 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {booking.customer_whatsapp}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900 dark:text-slate-50">{booking.services?.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          {booking.status === "confirmed" && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Confirmed</Badge>
                          )}
                          {booking.status === "completed" && (
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 border-none">Completed</Badge>
                          )}
                          {booking.status === "no_show" && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">No Show</Badge>
                          )}
                          {booking.status === "cancelled" && (
                            <Badge className="bg-slate-100 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 line-through border-none">Cancelled</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" className="h-8 px-3 text-sm" onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards View */}
              <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="p-4 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-50 text-base">{booking.customer_name}</div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center mt-1 text-sm">
                          <Phone className="w-3 h-3 mr-1" />
                          {booking.customer_whatsapp}
                        </div>
                      </div>
                      <div>
                        {booking.status === "confirmed" && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Confirmed</Badge>
                        )}
                        {booking.status === "completed" && (
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 border-none">Completed</Badge>
                        )}
                        {booking.status === "no_show" && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">No Show</Badge>
                        )}
                        {booking.status === "cancelled" && (
                          <Badge className="bg-slate-100 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 line-through border-none">Cancelled</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md text-sm border border-slate-100 dark:border-slate-800">
                      <div className="text-slate-700 font-medium mb-1">{booking.services?.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                        <div className="flex items-center">
                          <CalendarClock className="w-3.5 h-3.5 mr-1" />
                          {format(new Date(booking.appointment_date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {formatTime(booking.start_time)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal / Slide-over approximation */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/50" onClick={() => setSelectedBooking(null)}>
          <div 
            className="bg-white dark:bg-slate-900 w-full h-full sm:w-[450px] sm:h-screen shadow-xl overflow-y-auto animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Booking Details</h2>
              <Button variant="ghost" className="h-8 px-2" onClick={() => { setSelectedBooking(null); setError(""); }} aria-label="Close details">
                <XCircle className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Status</h3>
                {selectedBooking.status === "confirmed" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-sm">Confirmed</Badge>}
                {selectedBooking.status === "completed" && <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 border-none px-3 py-1 text-sm">Completed</Badge>}
                {selectedBooking.status === "no_show" && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-3 py-1 text-sm">No Show</Badge>}
                {selectedBooking.status === "cancelled" && <Badge className="bg-slate-100 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 line-through border-none px-3 py-1 text-sm">Cancelled</Badge>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Appointment</h3>
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-none">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Service</span>
                      <span className="font-medium">{selectedBooking.services?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Date</span>
                      <span className="font-medium">{format(new Date(selectedBooking.appointment_date), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Time</span>
                      <span className="font-medium">{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Customer</h3>
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-none">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="font-medium">{selectedBooking.customer_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-slate-700">{selectedBooking.customer_whatsapp}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              {selectedBooking.status === "confirmed" && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Actions</h3>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatus(selectedBooking.id, "completed")}
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Completed
                  </Button>
                  <Button 
                    variant="secondary"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => updateStatus(selectedBooking.id, "no_show")}
                    disabled={isLoading}
                  >
                    <UserX className="w-4 h-4 mr-2" /> Mark as No Show
                  </Button>
                    <Button 
                    variant="ghost"
                    className="w-full text-slate-500 dark:text-slate-400"
                    onClick={() => updateStatus(selectedBooking.id, "cancelled")}
                    disabled={isLoading}
                  >
                    Cancel Booking
                  </Button>
                  {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
