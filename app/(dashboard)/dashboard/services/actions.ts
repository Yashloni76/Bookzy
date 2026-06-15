"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addServiceAction(formData: FormData) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const name = (formData.get("name") as string || "").trim();
  const duration = Number(formData.get("duration"));
  const rawPrice = formData.get("price") as string;
  const price = rawPrice ? Number(rawPrice) : null;

  if (name.length < 2 || name.length > 100) {
    return { error: "Service name must be between 2 and 100 characters" };
  }
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return { error: "Duration must be between 5 and 480 minutes" };
  }
  if (price !== null && price < 0) {
    return { error: "Price cannot be negative" };
  }

  const { error } = await adminClient.from("services").insert({
    business_id: business.id,
    name,
    duration_minutes: duration,
    price,
    is_active: true
  });

  if (error) {
    console.error("Failed to add service:", error);
    return { error: "Failed to add service, please try again." };
  }

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function updateServiceAction(serviceId: string, formData: FormData) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = (formData.get("name") as string || "").trim();
  const duration = Number(formData.get("duration"));
  const rawPrice = formData.get("price") as string;
  const price = rawPrice ? Number(rawPrice) : null;

  if (name.length < 2 || name.length > 100) {
    return { error: "Service name must be between 2 and 100 characters" };
  }
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return { error: "Duration must be between 5 and 480 minutes" };
  }
  if (price !== null && price < 0) {
    return { error: "Price cannot be negative" };
  }

  // We should ideally verify the service belongs to the user's business,
  // but using admin client here to bypass RLS issues MVP style.
  // We can query the business id first to verify ownership.
  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const { error } = await adminClient
    .from("services")
    .update({ name, duration_minutes: duration, price })
    .eq("id", serviceId)
    .eq("business_id", business.id); // ownership check

  if (error) {
    console.error("Failed to update service:", error);
    return { error: "Failed to update service, please try again." };
  }

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function toggleServiceStatusAction(serviceId: string, isActive: boolean) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found" };

  const { error } = await adminClient
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId)
    .eq("business_id", business.id);

  if (error) {
    console.error("Failed to update service status:", error);
    return { error: "Failed to update service status, please try again." };
  }

  revalidatePath("/dashboard/services");
  return { success: true };
}
