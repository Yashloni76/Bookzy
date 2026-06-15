import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    .select("id, slug, business_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  let isFullyOnboarded = false;
  if (business) {
    const { count: servicesCount } = await adminClient
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    const { count: hoursCount } = await adminClient
      .from("business_hours")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    if (servicesCount && servicesCount > 0 && hoursCount && hoursCount > 0) {
      isFullyOnboarded = true;
    }
  }

  if (!isFullyOnboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 lg:flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Pass down business context if needed later, but standard layout wraps children */}
        <main className="flex-1 p-4 lg:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
