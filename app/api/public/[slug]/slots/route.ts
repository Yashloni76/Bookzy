import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rangesOverlap } from "@/lib/availability/slots";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const service_id = searchParams.get("service_id");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!service_id || !date) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return NextResponse.json({ slots: [] });
    }

    const adminClient = createSupabaseAdminClient();

    // Fetch business
    const { data: business } = await adminClient
      .from("businesses")
      .select("id, is_active")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!business || !business.is_active) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Fetch service
    const { data: service } = await adminClient
      .from("services")
      .select("duration_minutes")
      .eq("id", service_id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Determine day of week for date (0-6)
    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = dateObj.getDay(); // Returns 0 for Sunday, 1 for Monday, etc.

    // Fetch business_hours
    const { data: hours } = await adminClient
      .from("business_hours")
      .select("open_time, close_time, is_closed")
      .eq("business_id", business.id)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (!hours || hours.is_closed || !hours.open_time || !hours.close_time) {
      return NextResponse.json({ slots: [] });
    }

    // Fetch bookings and blocked_slots
    const { data: bookings } = await adminClient
      .from("bookings")
      .select("start_time, end_time")
      .eq("business_id", business.id)
      .eq("appointment_date", date)
      .in("status", ["confirmed", "completed"]);

    const { data: blockedSlots } = await adminClient
      .from("blocked_slots")
      .select("start_time, end_time")
      .eq("business_id", business.id)
      .eq("block_date", date);

    const busyRanges = [
      ...(bookings || []),
      ...(blockedSlots || []),
    ];

    // Generate slots
    const slots: string[] = [];
    const duration = service.duration_minutes;
    
    // Parse open/close times to minutes
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    
    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    };

    const startMin = parseTime(hours.open_time);
    const endMin = parseTime(hours.close_time);

    let currentMin = startMin;
    while (currentMin + duration <= endMin) {
      const slotStart = formatTime(currentMin);
      const slotEnd = formatTime(currentMin + duration);
      
      const isOverlap = busyRanges.some(busy => rangesOverlap(
        { start: slotStart, end: slotEnd }, 
        { start: busy.start_time, end: busy.end_time }
      ));
      
      if (!isOverlap) {
        slots.push(slotStart);
      }
      
      currentMin += duration;
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
