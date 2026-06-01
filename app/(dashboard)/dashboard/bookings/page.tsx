import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { BookingsList } from "@/components/dashboard/bookings-list";
import { BlockSlotsManager } from "@/components/dashboard/block-slots-manager";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function BookingsPage() {
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

  const { data: bookings } = await adminClient
    .from("bookings")
    .select(`
      id,
      customer_name,
      customer_whatsapp,
      appointment_date,
      start_time,
      end_time,
      status,
      notes,
      services ( name )
    `)
    .eq("business_id", business.id)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false });

  const { data: blockedSlots } = await adminClient
    .from("blocked_slots")
    .select("*")
    .eq("business_id", business.id)
    .order("block_date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Bookings</h1>
        <p className="text-slate-500 mt-1">Manage your schedule and appointments.</p>
      </div>

      <BookingsList initialBookings={bookings || []} />
      
      <div className="border-t border-slate-200 mt-12 pt-12">
        <BlockSlotsManager initialBlockedSlots={blockedSlots || []} />
      </div>
    </div>
  );
}
