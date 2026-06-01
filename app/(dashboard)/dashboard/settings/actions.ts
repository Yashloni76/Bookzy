"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateBusinessProfileAction(formData: FormData) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = formData.get("businessName") as string;
  const category = formData.get("category") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const city = formData.get("city") as string;

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("businesses")
    .update({
      business_name: name,
      category,
      whatsapp_number: whatsapp,
      city,
    })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard"); // Might affect sidebar name
  return { success: true };
}

export async function updateWorkingHoursAction(businessId: string, hours: any[]) {
  const serverClient = createSupabaseServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify ownership
  const { data: business } = await serverClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!business || business.id !== businessId) {
    return { error: "Unauthorized" };
  }

  const adminClient = createSupabaseAdminClient();
  
  // Update each day (we do this in a loop or as upserts. Since they already exist, we update them)
  // The easiest way is to use upsert, but we need the primary key `id` for that.
  // Instead, we can delete existing hours and re-insert, OR just update by business_id AND day_of_week
  
  // Let's delete existing and re-insert for simplicity and guaranteed clean state
  const { error: deleteError } = await adminClient
    .from("business_hours")
    .delete()
    .eq("business_id", businessId);

  if (deleteError) return { error: deleteError.message };

  const payload = hours.map(h => ({
    business_id: businessId,
    day_of_week: h.day_of_week,
    open_time: h.is_closed ? null : h.open_time,
    close_time: h.is_closed ? null : h.close_time,
    is_closed: h.is_closed,
  }));

  const { error: insertError } = await adminClient
    .from("business_hours")
    .insert(payload);

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}
