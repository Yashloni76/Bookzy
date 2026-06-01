import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CancelBookingClient } from "@/components/booking/cancel-booking-client";

export const dynamic = "force-dynamic";

export default async function CancelBookingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) {
    notFound();
  }

  const adminClient = createSupabaseAdminClient();

  const { data: booking } = await adminClient
    .from("bookings")
    .select("id, status, cancel_token, appointment_date, start_time, services(name), businesses(business_name, slug)")
    .eq("id", params.id)
    .maybeSingle();

  if (!booking || booking.cancel_token !== token) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <CancelBookingClient booking={booking} token={token} />
      </div>
    </div>
  );
}
