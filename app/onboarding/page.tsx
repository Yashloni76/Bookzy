import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use admin client to query business presence to bypass any database-level RLS discrepancies
  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  let hasServices = false;
  let hasHours = false;
  if (business) {
    const { count: servicesCount } = await adminClient
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    if (servicesCount && servicesCount > 0) hasServices = true;

    const { count: hoursCount } = await adminClient
      .from("business_hours")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    if (hoursCount && hoursCount > 0) hasHours = true;
  }

  if (business && hasServices && hasHours) {
    redirect("/dashboard");
  }

  let initialStep = 1;
  if (business) {
    initialStep = 2;
    if (hasServices) {
      initialStep = 3;
    }
  }

  return (
    <OnboardingWizard
      initialStep={initialStep}
      initialData={{
        businessId: business?.id || null,
        businessSlug: business?.slug || null,
      }}
    />
  );
}
