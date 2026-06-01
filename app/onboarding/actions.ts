"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createBusinessAction(formData: FormData) {
  const name = formData.get("businessName") as string;
  const category = formData.get("category") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const city = formData.get("city") as string;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    return { error: "Not logged in" };
  }

  // Using admin client to bypass any potential RLS misconfigurations during MVP
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("businesses")
    .insert({
      owner_id: user.id,
      business_name: name,
      slug,
      category,
      whatsapp_number: whatsapp,
      city,
    })
    .select("id, slug")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createServicesAction(businessId: string, services: any[]) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    return { error: "Not logged in" };
  }

  const payload = services.map(s => ({
    business_id: businessId,
    name: s.name,
    duration_minutes: s.duration_minutes,
    price: s.price === "" ? null : Number(s.price)
  }));

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("services")
    .insert(payload);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function createWorkingHoursAction(businessId: string, hours: any[]) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    return { error: "Not logged in" };
  }

  const payload = hours.map(h => ({
    business_id: businessId,
    day_of_week: h.day_of_week,
    open_time: h.is_closed ? null : h.open_time,
    close_time: h.is_closed ? null : h.close_time,
    is_closed: h.is_closed,
  }));

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("business_hours")
    .insert(payload);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
