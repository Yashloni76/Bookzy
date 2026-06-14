import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rangesOverlap } from "@/lib/availability/slots";

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { block_date, start_time, end_time, reason } = await request.json();

    if (!block_date || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (start_time >= end_time) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    if (block_date < today) {
      return NextResponse.json({ error: "Cannot block a date in the past" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    
    // Verify business ownership
    const { data: business } = await adminClient
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Check for overlap with existing confirmed bookings
    const { data: bookings } = await adminClient
      .from("bookings")
      .select("start_time, end_time")
      .eq("business_id", business.id)
      .eq("appointment_date", block_date)
      .eq("status", "confirmed");

    if (bookings) {
      const hasOverlap = bookings.some(booking => 
        rangesOverlap(
          { start: start_time, end: end_time },
          { start: booking.start_time, end: booking.end_time }
        )
      );

      if (hasOverlap) {
        return NextResponse.json(
          { error: "This time range has an existing booking. Cancel or reschedule it first." },
          { status: 409 }
        );
      }
    }

    const { data, error } = await adminClient
      .from("blocked_slots")
      .insert({
        business_id: business.id,
        block_date,
        start_time,
        end_time,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to block slot" }, { status: 500 });
    }

    return NextResponse.json({ blocked_slot: data });
  } catch (error) {
    console.error("Error blocking slot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    
    // Verify business ownership
    const { data: business } = await adminClient
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify blocked slot belongs to this business
    const { data: blockedSlot, error: fetchError } = await adminClient
      .from("blocked_slots")
      .select("id")
      .eq("id", id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (fetchError || !blockedSlot) {
      return NextResponse.json({ error: "Blocked slot not found" }, { status: 404 });
    }

    const { error: deleteError } = await adminClient
      .from("blocked_slots")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to remove blocked slot" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blocked slot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
