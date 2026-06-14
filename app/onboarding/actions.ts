"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createBusinessAction(formData: FormData) {
  const name = (formData.get("businessName") as string || "").trim();
  const category = (formData.get("category") as string || "").trim();
  const whatsapp = (formData.get("whatsapp") as string || "").trim();
  const city = (formData.get("city") as string || "").trim();

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // Validation
  if (name.length < 2 || name.length > 100) {
    return { error: "Business name must be between 2 and 100 characters" };
  }
  if (!category) {
    return { error: "Category is required" };
  }
  if (!/^[6-9]\d{9}$/.test(whatsapp)) {
    return { error: "Invalid WhatsApp number. Use a 10-digit Indian mobile number." };
  }
  if (city.length < 2 || city.length > 50) {
    return { error: "City must be between 2 and 50 characters" };
  }
  if (slug.length < 3 || slug.length > 50 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Generated booking link is invalid. Try a different business name." };
  }

  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    return { error: "Not logged in" };
  }

  const adminClient = createSupabaseAdminClient();

  try {
    // Check for duplicate owner_id
    const { data: existingBusiness } = await adminClient
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (existingBusiness) {
      return { error: "Business already exists for this account" };
    }

    // Check for duplicate slug
    const { data: existingSlug } = await adminClient
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return { error: "This booking link name is already taken, please choose another" };
    }

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
      console.error("Failed to create business:", error);
      return { error: "Failed to create business, please try again." };
    }

    return { data };
  } catch (error) {
    console.error("Error in createBusinessAction:", error);
    return { error: "An unexpected error occurred." };
  }
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
    console.error("Failed to create services:", error);
    return { error: "Failed to create services, please try again." };
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
    console.error("Failed to create working hours:", error);
    return { error: "Failed to create working hours, please try again." };
  }

  return { success: true };
}
