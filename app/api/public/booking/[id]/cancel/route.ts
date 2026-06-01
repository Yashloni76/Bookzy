import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cancel_token } = await request.json();

    if (!cancel_token) {
      return NextResponse.json({ error: "Missing cancel token" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // Fetch booking
    const { data: booking } = await adminClient
      .from("bookings")
      .select("id, status, cancel_token, customer_email, appointment_date, start_time, services(name), businesses(business_name)")
      .eq("id", params.id)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.cancel_token !== cancel_token) {
      return NextResponse.json({ error: "Invalid cancel token" }, { status: 403 });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
    }

    // Cancel booking
    const { error: updateError } = await adminClient
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString()
      })
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }

    // Send Cancellation Email via Nodemailer if email is provided
    if (booking.customer_email && process.env.EMAIL_USER) {
      try {
        const businessName = (booking.businesses as any)?.business_name || "the business";
        const serviceName = (booking.services as any)?.name || "Service";

        await transporter.sendMail({
          from: `"BookZy Bookings" <${process.env.EMAIL_USER}>`,
          to: booking.customer_email,
          subject: `Booking Cancelled — ${businessName}`,
          html: `
            <h2>Booking Cancelled</h2>
            <p>Your appointment with <strong>${businessName}</strong> has been cancelled successfully.</p>
            <ul>
              <li><strong>Service:</strong> ${serviceName}</li>
              <li><strong>Date:</strong> ${booking.appointment_date}</li>
              <li><strong>Time:</strong> ${booking.start_time}</li>
            </ul>
            <p>We hope to see you again soon.</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send cancellation email:", emailErr);
      }
    }

    // Invalidate dashboard cache so the owner sees the cancellation immediately
    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
