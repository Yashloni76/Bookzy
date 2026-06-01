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
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("An error occurred");
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
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <CalendarClock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No bookings found</h3>
              <p className="text-slate-500 mt-1">There are no bookings matching this filter.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
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
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">
                            {format(new Date(booking.appointment_date), "MMM d, yyyy")}
                          </div>
                          <div className="text-slate-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(booking.start_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{booking.customer_name}</div>
                          <div className="text-slate-500 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {booking.customer_whatsapp}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900">{booking.services?.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          {booking.status === "confirmed" && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Confirmed</Badge>
                          )}
                          {booking.status === "completed" && (
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Completed</Badge>
                          )}
                          {booking.status === "no_show" && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">No Show</Badge>
                          )}
                          {booking.status === "cancelled" && (
                            <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 line-through border-none">Cancelled</Badge>
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
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal / Slide-over approximation */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/50" onClick={() => setSelectedBooking(null)}>
          <div 
            className="bg-white w-full h-full sm:w-[450px] sm:h-screen shadow-xl overflow-y-auto animate-in slide-in-from-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-slate-900">Booking Details</h2>
              <Button variant="ghost" className="h-8 px-2" onClick={() => setSelectedBooking(null)}>
                <XCircle className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Status</h3>
                {selectedBooking.status === "confirmed" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-sm">Confirmed</Badge>}
                {selectedBooking.status === "completed" && <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-3 py-1 text-sm">Completed</Badge>}
                {selectedBooking.status === "no_show" && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-3 py-1 text-sm">No Show</Badge>}
                {selectedBooking.status === "cancelled" && <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 line-through border-none px-3 py-1 text-sm">Cancelled</Badge>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Appointment</h3>
                <Card className="bg-slate-50 border-none">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service</span>
                      <span className="font-medium">{selectedBooking.services?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium">{format(new Date(selectedBooking.appointment_date), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time</span>
                      <span className="font-medium">{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Customer</h3>
                <Card className="bg-slate-50 border-none">
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
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              {selectedBooking.status === "confirmed" && (
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Actions</h3>
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
                    className="w-full text-slate-500"
                    onClick={() => updateStatus(selectedBooking.id, "cancelled")}
                    disabled={isLoading}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
