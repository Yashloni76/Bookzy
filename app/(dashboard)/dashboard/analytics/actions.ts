"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { format, subDays, getDay, parseISO } from "date-fns";

export type AnalyticsData = {
  totalBookingsAllTime: number;
  bookingsInPeriod: number;
  busiestDay: string | null;
  mostPopularService: string | null;
  chartData: { name: string; bookings: number }[];
};

export async function getAnalytics(range: '30' | '90' | 'all'): Promise<AnalyticsData | { error: string }> {
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

    // Fetch all bookings for this business to calculate all-time and period stats
    const { data: allBookings, error } = await adminClient
      .from("bookings")
      .select(`
        id,
        appointment_date,
        services ( name )
      `)
      .eq("business_id", business.id)
      .in("status", ["confirmed", "completed"]);

    if (error) {
      console.error("Error fetching bookings:", error);
      return { error: "Failed to fetch analytics data" };
    }

    const typedBookings = allBookings || [];
    const totalBookingsAllTime = typedBookings.length;

    // Filter for the selected period
    let periodBookings = typedBookings;
    if (range !== 'all') {
      const daysToSubtract = parseInt(range, 10);
      // We use today in IST (or server local time) but basically comparing string dates
      const today = new Date();
      const cutoffDate = subDays(today, daysToSubtract);
      const cutoffStr = format(cutoffDate, "yyyy-MM-dd");
      
      periodBookings = typedBookings.filter(b => b.appointment_date >= cutoffStr);
    }

    const bookingsInPeriod = periodBookings.length;

    // Calculate busiest day
    const dayCounts: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    };
    
    // Calculate most popular service
    const serviceCounts: Record<string, number> = {};

    periodBookings.forEach(b => {
      // Day of week
      const dateObj = parseISO(b.appointment_date);
      const dayIndex = getDay(dateObj); // 0 = Sunday, 1 = Monday
      dayCounts[dayIndex] += 1;

      // Service count
      const serviceName = (b.services as any)?.name || "Unknown";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Find busiest day
    let maxDayCount = -1;
    let busiestDayIndex = -1;
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] > maxDayCount) {
        maxDayCount = dayCounts[i];
        busiestDayIndex = i;
      }
    }
    const busiestDay = maxDayCount > 0 ? daysOfWeek[busiestDayIndex] : null;

    // Find most popular service
    let maxServiceCount = -1;
    let mostPopularService = null;
    for (const [service, count] of Object.entries(serviceCounts)) {
      if (count > maxServiceCount) {
        maxServiceCount = count;
        mostPopularService = service;
      }
    }

    // Format chart data (starting from Monday for better business logic display)
    const chartData = [
      { name: "Mon", bookings: dayCounts[1] },
      { name: "Tue", bookings: dayCounts[2] },
      { name: "Wed", bookings: dayCounts[3] },
      { name: "Thu", bookings: dayCounts[4] },
      { name: "Fri", bookings: dayCounts[5] },
      { name: "Sat", bookings: dayCounts[6] },
      { name: "Sun", bookings: dayCounts[0] },
    ];

    return {
      totalBookingsAllTime,
      bookingsInPeriod,
      busiestDay,
      mostPopularService,
      chartData
    };
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    return { error: "Internal Server Error" };
  }
}
