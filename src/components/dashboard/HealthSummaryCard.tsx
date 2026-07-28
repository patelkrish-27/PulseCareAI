"use client";

import { useMemo } from "react";
import { Activity, Heart, Droplets, Footprints, Moon, ArrowUpRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { usePulseCareStore } from "@/lib/store";
import Link from "next/link";

interface Stat {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  status?: "normal" | "warning" | "critical";
}

function getStatusColor(status?: string) {
  if (status === "critical") return "text-red-500";
  if (status === "warning") return "text-amber-500";
  return "text-primary";
}

export function HealthSummaryCard() {
  const { todayLogs, profile } = usePulseCareStore();

  const stats: Stat[] = useMemo(() => {
    // Latest vitals log today
    const vitalsLogs = todayLogs
      .filter((l) => l.type === "vitals")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const latestVitals = vitalsLogs[vitalsLogs.length - 1];

    // Latest blood sugar log today
    const sugarLogs = todayLogs
      .filter((l) => l.type === "sugar")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const latestSugar = sugarLogs[sugarLogs.length - 1];

    // Latest activity
    const activityLogs = todayLogs.filter((l) => l.type === "activity");
    const totalSteps = activityLogs.reduce((s, l) => s + (l.steps ?? 0), 0);

    // Latest sleep
    const sleepLogs = todayLogs.filter((l) => l.type === "sleep");
    const latestSleep = sleepLogs[sleepLogs.length - 1];

    // ── Build BP stat ──
    let bpValue = "—";
    let bpDetail = "Log your BP today";
    let bpStatus: Stat["status"] = "normal";
    if (latestVitals?.systolic && latestVitals?.diastolic) {
      bpValue = `${latestVitals.systolic}/${latestVitals.diastolic}`;
      if (latestVitals.systolic >= 140 || latestVitals.diastolic >= 90) {
        bpDetail = "Above target — take note";
        bpStatus = "critical";
      } else if (latestVitals.systolic >= 130) {
        bpDetail = "Elevated — monitor closely";
        bpStatus = "warning";
      } else {
        bpDetail = "Within healthy range";
      }
    }

    // ── Build HR stat ──
    let hrValue = "—";
    let hrDetail = "Log your heart rate";
    if (latestVitals?.heartRate) {
      hrValue = `${latestVitals.heartRate} bpm`;
      hrDetail =
        latestVitals.heartRate < 60
          ? "Below average — rest well"
          : latestVitals.heartRate > 100
          ? "Elevated — take a break"
          : "Resting average";
    }

    // ── Build Sugar stat ──
    let sugarValue = "—";
    let sugarDetail = "Log your glucose";
    let sugarStatus: Stat["status"] = "normal";
    if (latestSugar?.bloodSugar) {
      sugarValue = `${latestSugar.bloodSugar}`;
      const timing = latestSugar.sugarTiming ?? "fasting";
      if (
        (timing === "fasting" && latestSugar.bloodSugar > 126) ||
        (timing === "post-meal" && latestSugar.bloodSugar > 200)
      ) {
        sugarDetail = "High — consult your doctor";
        sugarStatus = "critical";
      } else {
        sugarDetail = `mg/dL · ${timing}`;
      }
    }

    // ── Build Steps stat ──
    const stepGoal = 8000;
    const stepsValue = totalSteps > 0 ? totalSteps.toLocaleString() : "—";
    const stepsDetail =
      totalSteps > 0
        ? `${Math.round((totalSteps / stepGoal) * 100)}% of daily goal`
        : "Log your activity";

    // ── Build Sleep stat ──
    const sleepValue =
      latestSleep?.sleepHours
        ? `${latestSleep.sleepHours}h ${latestSleep.sleepQuality ? `· ${latestSleep.sleepQuality}/5` : ""}`
        : "—";
    const sleepDetail = latestSleep ? "Last night" : "Log your sleep";

    // Show condition-relevant stat first
    const isHypertensive = profile?.condition === "Hypertension";
    const isDiabetic = profile?.condition === "Type 2 Diabetes";

    const base: Stat[] = [
      { label: "Blood pressure", value: bpValue, detail: bpDetail, icon: Activity, status: bpStatus },
      { label: "Heart rate", value: hrValue, detail: hrDetail, icon: Heart },
      { label: "Blood sugar", value: sugarValue, detail: sugarDetail, icon: Droplets, status: sugarStatus },
      { label: "Steps", value: stepsValue, detail: stepsDetail, icon: Footprints },
      { label: "Sleep", value: sleepValue, detail: sleepDetail, icon: Moon },
    ];

    // Bubble condition-relevant stat to front
    if (isDiabetic) {
      const idx = base.findIndex((s) => s.label === "Blood sugar");
      if (idx > 0) [base[0], base[idx]] = [base[idx], base[0]];
    }

    return base;
  }, [todayLogs, profile]);

  const hasAnyData = todayLogs.length > 0;

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow">Live snapshot</p>
          <h2 className="mt-1 font-semibold tracking-tight">Today&apos;s readings</h2>
        </div>
        {hasAnyData ? (
          <span className="hidden items-center gap-1.5 text-xs font-medium text-primary sm:flex">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
            Updated just now
          </span>
        ) : (
          <Link
            href="/logs"
            className="hidden items-center gap-1.5 text-xs font-medium text-primary sm:flex hover:underline"
          >
            <Plus className="size-3.5" aria-hidden />
            Log your first reading today
          </Link>
        )}
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5"
      >
        {stats.map(({ label, value, detail, icon: Icon, status }) => (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            key={label}
            className="group relative p-5 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/9 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <ArrowUpRight
                className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {value === "—" ? <span className="text-muted-foreground text-base">—</span> : value}
            </p>
            <p className={`mt-1 text-xs ${getStatusColor(status)}`}>{detail}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
