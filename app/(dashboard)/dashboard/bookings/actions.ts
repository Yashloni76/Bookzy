"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
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

export async function getAvailableSlots(serviceId: string, date: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const adminClient = createSupabaseAdminClient();
    const { data: business } = await adminClient
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!business) {
      return { error: "Business not found" };
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return { slots: [] };
    }

    const { data: service } = await adminClient
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!service) {
      return { error: "Service not found" };
    }

    const dateObj = new Date(`${date}T00:00:00`);
    const dayOfWeek = dateObj.getDay();

    const { data: hours } = await adminClient
      .from("business_hours")
      .select("open_time, close_time, is_closed")
      .eq("business_id", business.id)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (!hours || hours.is_closed || !hours.open_time || !hours.close_time) {
      return { slots: [] };
    }

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

    const slots: string[] = [];
    const duration = service.duration_minutes;
    
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

    return { slots };
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return { error: "Internal Server Error" };
  }
}

export async function createManualBookingAction(formData: FormData) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const service_id = formData.get("service_id") as string;
    const date = formData.get("date") as string;
    const start_time = formData.get("start_time") as string;
    const customer_name = formData.get("customer_name") as string;
    const customer_whatsapp = formData.get("customer_whatsapp") as string;
    const customer_email = formData.get("customer_email") as string;
    const notes = formData.get("notes") as string;
    const sendEmail = formData.get("send_email") === "true";

    if (!service_id || !date || !start_time || !customer_name || !customer_whatsapp) {
      return { error: "Missing required fields" };
    }

    const trimmedName = String(customer_name).trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return { error: "Name must be between 2 and 100 characters" };
    }

    if (!/^[6-9]\d{9}$/.test(String(customer_whatsapp))) {
      return { error: "Invalid phone number. Enter a 10-digit Indian mobile number starting with 6-9" };
    }

    if (customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer_email))) {
      return { error: "Invalid email address format" };
    }

    const adminClient = createSupabaseAdminClient();

    const { data: business } = await adminClient
      .from("businesses")
      .select("id, business_name, whatsapp_number")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!business) {
      return { error: "Business not found" };
    }

    const { data: service } = await adminClient
      .from("services")
      .select("id, name, duration_minutes")
      .eq("id", service_id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!service) {
      return { error: "Service not found" };
    }

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
      return { error: "Slot is no longer available" };
    }

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
          name: trimmedName,
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

    const { data: booking, error: bookingError } = await adminClient
      .from("bookings")
      .insert({
        business_id: business.id,
        service_id: service.id,
        customer_id,
        customer_name: trimmedName,
        customer_whatsapp,
        customer_email: customer_email || null,
        appointment_date: date,
        start_time,
        end_time,
        status: "confirmed",
        notes: notes ? String(notes).trim().slice(0, 500) : null,
        cancel_token,
      })
      .select("id")
      .single();

    if (bookingError) {
      if (bookingError.code === "23P01") {
        return { error: "This slot was just booked by someone else. Please choose another time." };
      }
      return { error: "Failed to create booking" };
    }

    if (sendEmail && customer_email && process.env.EMAIL_USER) {
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

    revalidatePath("/dashboard", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error creating manual booking:", error);
    return { error: "Internal Server Error" };
  }
}
