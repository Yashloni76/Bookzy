import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarX2, Clock, CheckCircle2, UserX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingActions } from "@/components/dashboard/booking-actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  // Fetch today's bookings in IST
  const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  // We need to format the date correctly for postgres date field (YYYY-MM-DD)
  const todayStr = format(todayIST, "yyyy-MM-dd");

  const { data: bookings } = await adminClient
    .from("bookings")
    .select(`
      id,
      customer_name,
      customer_whatsapp,
      start_time,
      end_time,
      status,
      services ( name )
    `)
    .eq("business_id", business.id)
    .eq("appointment_date", todayStr)
    .order("start_time", { ascending: true });

  const typedBookings = bookings || [];

  const totalToday = typedBookings.length;
  
  // Future time check using IST
  const currentTimeStr = `${todayIST.getHours().toString().padStart(2, '0')}:${todayIST.getMinutes().toString().padStart(2, '0')}:00`;
  
  const upcoming = typedBookings.filter(b => b.status === "confirmed" && b.start_time >= currentTimeStr).length;
  const completed = typedBookings.filter(b => b.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Today &mdash; {format(todayIST, "EEEE, d MMMM")}
        </h1>
        <p className="text-slate-500 mt-1">Here is your schedule for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completed}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Appointments</h2>

      {typedBookings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <CalendarX2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No appointments today</h3>
          <p className="text-slate-500 max-w-sm mt-1 mb-6">
            Share your booking link to get started and fill up your schedule.
          </p>
          <Link href="/dashboard/share">
            <Button>Share Booking Link</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {typedBookings.map((booking: any) => {
            // Format time nicely
            // We assume start_time and end_time are "HH:MM:SS"
            const formatTime = (timeStr: string) => {
              const [h, m] = timeStr.split(':');
              const d = new Date();
              d.setHours(parseInt(h, 10));
              d.setMinutes(parseInt(m, 10));
              return format(d, "h:mm a");
            };

            return (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Time section */}
                  <div className="bg-slate-50 border-r border-slate-100 p-4 flex flex-col justify-center min-w-[140px]">
                    <div className="flex items-center text-slate-900 font-semibold">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {formatTime(booking.start_time)}
                    </div>
                    <div className="text-sm text-slate-500 ml-6">
                      to {formatTime(booking.end_time)}
                    </div>
                  </div>
                  
                  {/* Details section */}
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{booking.customer_name}</h4>
                        <p className="text-slate-500">{booking.services?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions section */}
                  <div className="p-4 bg-slate-50 border-l border-slate-100 flex items-center justify-end sm:justify-center min-w-[180px]">
                    <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
