import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Insights and performance of your business.</p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
