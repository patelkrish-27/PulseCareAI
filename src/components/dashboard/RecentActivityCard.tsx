"use client";

import { useMemo } from "react";
import { Activity, Droplets, Heart, Moon, Pill, Stethoscope, Dumbbell } from "lucide-react";
import { usePulseCareStore } from "@/lib/store";
import type { HealthLog } from "@/lib/db";
import Link from "next/link";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function logToActivity(log: HealthLog): { icon: React.ElementType; title: string; value: string } {
  switch (log.type) {
    case "vitals":
      return {
        icon: Activity,
        title: "Blood Pressure Recorded",
        value: log.systolic && log.diastolic ? `${log.systolic}/${log.diastolic} mmHg` : "—",
      };
    case "sugar":
      return {
        icon: Droplets,
        title: "Blood Sugar Logged",
        value: log.bloodSugar ? `${log.bloodSugar} mg/dL (${log.sugarTiming ?? ""})` : "—",
      };
    case "weight":
      return {
        icon: Heart,
        title: "Weight Recorded",
        value: log.weight ? `${log.weight} kg` : "—",
      };
    case "sleep":
      return {
        icon: Moon,
        title: "Sleep Logged",
        value: log.sleepHours ? `${log.sleepHours}h sleep` : "—",
      };
    case "activity":
      return {
        icon: Dumbbell,
        title: log.activityType ? `${log.activityType} logged` : "Activity Logged",
        value: log.activityDuration ? `${log.activityDuration} min` : "—",
      };
    default:
      return { icon: Activity, title: "Health Log", value: "—" };
  }
}

export function RecentActivityCard() {
  const { todayLogs, triageEvents } = usePulseCareStore();

  const items = useMemo(() => {
    const logItems = [...todayLogs]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
      .map((log) => {
        const { icon, title, value } = logToActivity(log);
        return {
          id: `log-${log.id}`,
          icon,
          title,
          value,
          time: formatTime(log.createdAt),
          type: "log" as const,
        };
      });

    const triageItems = triageEvents.slice(0, 1).map((t) => ({
      id: `triage-${t.id}`,
      icon: Stethoscope,
      title: `Triage: ${t.triageLevel.replace(/_/g, " ")}`,
      value: `${t.confidenceScore}% confidence`,
      time: formatTime(t.createdAt),
      type: "triage" as const,
    }));

    const medItems =
      logItems.length === 0
        ? triageItems
        : [...logItems, ...triageItems].slice(0, 4);

    return medItems.length > 0 ? medItems : null;
  }, [todayLogs, triageEvents]);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-4">
        <p className="eyebrow">Recent activity</p>
        <h2 className="mt-1 font-semibold tracking-tight">Today&apos;s log</h2>
      </div>

      {!items ? (
        <div className="py-6 text-center text-muted-foreground">
          <Pill className="size-8 mx-auto mb-3 opacity-30" aria-hidden />
          <p className="text-sm">No activity yet today</p>
          <Link
            href="/logs"
            className="text-xs text-primary mt-2 inline-block hover:underline"
          >
            Log your first entry →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ id, icon: Icon, title, value, time }) => (
            <div
              key={id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background/50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/9 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-muted-foreground truncate">{value}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{time}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
