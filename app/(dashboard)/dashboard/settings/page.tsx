import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use admin client to query business presence to bypass any database-level RLS discrepancies
  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  const { data: businessHours } = await adminClient
    .from("business_hours")
    .select("*")
    .eq("business_id", business.id);

  return <SettingsTabs business={business} businessHours={businessHours || []} />;
}
