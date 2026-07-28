"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HealthLogForm } from "@/components/health-log/HealthLogForm";
import { Activity } from "lucide-react";

function LogsContent() {
  const params = useSearchParams();
  const tab = params.get("tab") ?? "vitals";
  return <HealthLogForm defaultTab={tab} />;
}

export default function LogsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Activity className="size-5 text-primary" aria-hidden />
          <p className="eyebrow">Daily tracking</p>
        </div>
        <h1 className="section-title">Health Logs</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Record your vitals, medication, and activity. All data stays on this device.
        </p>
      </div>
      <Suspense fallback={<div className="surface-card p-8 text-center text-muted-foreground">Loading…</div>}>
        <LogsContent />
      </Suspense>
    </div>
  );
}
