import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["completed", "no_show", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();
    
    // Verify business ownership
    const { data: business } = await adminClient
      .from("businesses")
      .select("id, business_name, whatsapp_number")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Verify booking belongs to this business
    const { data: booking, error: fetchError } = await adminClient
      .from("bookings")
      .select("id, customer_id, customer_email, customer_name, appointment_date, start_time, end_time, services(name)")
      .eq("id", params.id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking status
    const updatePayload: any = { status };
    if (status === "cancelled") {
      updatePayload.cancelled_at = new Date().toISOString();
    }

    const { error: updateError } = await adminClient
      .from("bookings")
      .update(updatePayload)
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    // If no_show, increment customer's no_show_count
    if (status === "no_show" && booking.customer_id) {
      const { data: customer } = await adminClient
        .from("customers")
        .select("no_show_count")
        .eq("id", booking.customer_id)
        .single();
        
      if (customer) {
        await adminClient
          .from("customers")
          .update({ no_show_count: (customer.no_show_count || 0) + 1 })
          .eq("id", booking.customer_id);
      }
    }

    // Send cancellation email if email exists
    if (status === "cancelled" && booking.customer_email && process.env.EMAIL_USER) {
      try {
        await transporter.sendMail({
          from: `"BookZy Bookings" <${process.env.EMAIL_USER}>`,
          to: booking.customer_email,
          subject: `Booking Cancelled — ${business.business_name}`,
          html: `
            <h2>Booking Cancelled</h2>
            <p>Hi ${booking.customer_name},</p>
            <p>Your appointment with <strong>${business.business_name}</strong> has been cancelled by the business.</p>
            <ul>
              <li><strong>Service:</strong> ${(booking.services as any)?.name}</li>
              <li><strong>Date:</strong> ${booking.appointment_date}</li>
              <li><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</li>
            </ul>
            <p>If you have any questions, you can contact them on WhatsApp: ${business.whatsapp_number || 'Not provided'}</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send cancellation email:", emailErr);
      }
    }

    // Invalidate the entire dashboard cache to keep Today and All Bookings in sync
    revalidatePath("/dashboard", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
