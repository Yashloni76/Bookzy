"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAnalytics, AnalyticsData } from "@/app/(dashboard)/dashboard/analytics/actions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarDays, Star, TrendingUp, BarChart3 } from "lucide-react";

type RangeType = "30" | "90" | "all";

export function AnalyticsDashboard() {
  const [range, setRange] = useState<RangeType>("30");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await getAnalytics(range);
        if ("error" in result) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (err) {
        setError("Failed to fetch analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const rangeLabel = range === "30" ? "Last 30 Days" : range === "90" ? "Last 90 Days" : "All Time";

  return (
    <div className="space-y-6">
      {/* Filter Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setRange("30")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              range === "30" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange("90")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              range === "90" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setRange("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              range === "all" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">{error}</div>
      ) : isLoading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">Loading analytics...</div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Bookings (All-Time)</CardTitle>
                <CalendarDays className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{data.totalBookingsAllTime}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Bookings ({rangeLabel})</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.bookingsInPeriod}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Busiest Day ({rangeLabel})</CardTitle>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{data.busiestDay || "-"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Service ({rangeLabel})</CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate" title={data.mostPopularService || "-"}>{data.mostPopularService || "-"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Bookings per Day of Week</CardTitle>
              <CardDescription>Distribution of bookings across days in the {rangeLabel.toLowerCase()}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
