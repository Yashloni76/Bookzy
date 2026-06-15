"use client";

import { useState } from "react";
import { SettingsProfile } from "./settings-profile";
import { SettingsHours } from "./settings-hours";

export function SettingsTabs({ business, businessHours }: { business: any; businessHours: any[] }) {
  const [activeTab, setActiveTab] = useState<"profile" | "hours">("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-50">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your business profile and availability.</p>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "profile" 
              ? "border-blue-700 text-blue-700" 
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50"
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab("hours")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "hours" 
              ? "border-blue-700 text-blue-700" 
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50"
          }`}
        >
          Working Hours
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "profile" && <SettingsProfile business={business} />}
        {activeTab === "hours" && <SettingsHours businessId={business.id} initialHours={businessHours} />}
      </div>
    </div>
  );
}
