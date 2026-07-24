"use client";

import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Analytics</h2>
        <p className="text-on-surface-variant mt-2">Visualizing your health trends over time.</p>
      </div>

      <AnalyticsCharts />
    </div>
  );
}
