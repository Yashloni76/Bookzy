import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PublicBookingClient } from "@/components/booking/public-booking-client";

type BookingPageProps = {
  params: {
    slug: string;
  };
};

const RESERVED_SLUGS = ['login', 'onboarding', 'dashboard', 'booking', 'auth', 'api'];

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({ params }: BookingPageProps) {
  if (RESERVED_SLUGS.includes(params.slug)) {
    notFound();
  }

  const adminClient = createSupabaseAdminClient();

  const { data: business } = await adminClient
    .from("businesses")
    .select("id, business_name, category, city, description, is_active, whatsapp_number")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!business || !business.is_active) {
    notFound();
  }

  const { data: services } = await adminClient
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 text-center">
          <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-4">
            {business.category} {business.city ? `• ${business.city}` : ""}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{business.business_name}</h1>
          {business.description && (
            <p className="text-slate-500 max-w-lg mx-auto">{business.description}</p>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <PublicBookingClient 
          businessSlug={params.slug} 
          services={services || []} 
          businessName={business.business_name}
          whatsappNumber={business.whatsapp_number}
        />
      </div>
    </div>
  );
}
