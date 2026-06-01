"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addServiceAction(formData: FormData) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: business } = await serverClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const name = formData.get("name") as string;
  const duration = Number(formData.get("duration"));
  const rawPrice = formData.get("price") as string;
  const price = rawPrice ? Number(rawPrice) : null;

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.from("services").insert({
    business_id: business.id,
    name,
    duration_minutes: duration,
    price,
    is_active: true
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function updateServiceAction(serviceId: string, formData: FormData) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const duration = Number(formData.get("duration"));
  const rawPrice = formData.get("price") as string;
  const price = rawPrice ? Number(rawPrice) : null;

  // We should ideally verify the service belongs to the user's business,
  // but using admin client here to bypass RLS issues MVP style.
  // We can query the business id first to verify ownership.
  const { data: business } = await serverClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("services")
    .update({ name, duration_minutes: duration, price })
    .eq("id", serviceId)
    .eq("business_id", business.id); // ownership check

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function toggleServiceStatusAction(serviceId: string, isActive: boolean) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: business } = await serverClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId)
    .eq("business_id", business.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function deleteServiceAction(serviceId: string) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: business } = await serverClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("business_id", business.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  return { success: true };
}
