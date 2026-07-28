"use client";

import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <BarChart2 className="size-5 text-primary" aria-hidden />
          <p className="eyebrow">7-day overview</p>
        </div>
        <h1 className="section-title">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Trends from your logged readings over the past week.
        </p>
      </div>
      <AnalyticsCharts />
    </div>
  );
}
