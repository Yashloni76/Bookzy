import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rangesOverlap } from "@/lib/availability/slots";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { publicEnv } from "@/lib/env";
import { revalidatePath } from "next/cache";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { service_id, date, start_time, customer_name, customer_whatsapp, customer_email, notes } = body;

    if (!service_id || !date || !start_time || !customer_name || !customer_whatsapp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // Fetch business
    const { data: business } = await adminClient
      .from("businesses")
      .select("id, is_active, business_name, whatsapp_number")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!business || !business.is_active) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Fetch service
    const { data: service } = await adminClient
      .from("services")
      .select("id, name, duration_minutes")
      .eq("id", service_id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Calculate end time
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
    };
    
    const startMin = parseTime(start_time);
    const end_time = formatTime(startMin + service.duration_minutes);

    // Re-validate availability
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
    
    const isOverlap = busyRanges.some(busy => rangesOverlap(
      { start: start_time, end: end_time }, 
      { start: busy.start_time, end: busy.end_time }
    ));
    
    if (isOverlap) {
      return NextResponse.json({ error: "Slot is no longer available" }, { status: 409 });
    }

    // Find or create customer
    let customer_id = null;
    const { data: existingCustomer } = await adminClient
      .from("customers")
      .select("id")
      .eq("business_id", business.id)
      .eq("whatsapp_number", customer_whatsapp)
      .maybeSingle();
      
    if (existingCustomer) {
      customer_id = existingCustomer.id;
    } else {
      const { data: newCustomer } = await adminClient
        .from("customers")
        .insert({
          business_id: business.id,
          name: customer_name,
          whatsapp_number: customer_whatsapp,
          email: customer_email || null,
        })
        .select("id")
        .single();
      
      if (newCustomer) {
        customer_id = newCustomer.id;
      }
    }

    const cancel_token = crypto.randomUUID();

    // Create booking
    const { data: booking, error: bookingError } = await adminClient
      .from("bookings")
      .insert({
        business_id: business.id,
        service_id: service.id,
        customer_id,
        customer_name,
        customer_whatsapp,
        customer_email: customer_email || null,
        appointment_date: date,
        start_time,
        end_time,
        status: "confirmed",
        notes: notes || null,
        cancel_token,
      })
      .select("id")
      .single();

    if (bookingError) {
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Send Email via Nodemailer if email is provided
    if (customer_email && process.env.EMAIL_USER) {
      const cancelLink = `${publicEnv.appUrl}/booking/${booking.id}/cancel?token=${cancel_token}`;
      
      try {
        await transporter.sendMail({
          from: `"BookZy Bookings" <${process.env.EMAIL_USER}>`,
          to: customer_email,
          subject: `Booking confirmed — ${business.business_name}`,
          html: `
            <h2>Booking Confirmed</h2>
            <p>Your appointment with <strong>${business.business_name}</strong> is confirmed.</p>
            <ul>
              <li><strong>Service:</strong> ${service.name}</li>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Time:</strong> ${start_time} - ${end_time}</li>
            </ul>
            <p>If you need to contact the business, their WhatsApp number is: ${business.whatsapp_number}</p>
            <br/>
            <p>If you need to cancel this appointment, please <a href="${cancelLink}">click here</a>.</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    // Invalidate dashboard cache so the owner sees the new booking immediately
    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ success: true, booking_id: booking.id, cancel_token });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
