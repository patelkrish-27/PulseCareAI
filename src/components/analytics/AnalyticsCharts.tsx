"use client";

import { useMemo, useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";
import { usePulseCareStore } from "@/lib/store";
import { daysAgoStr, getDB } from "@/lib/db";
import type { HealthLog } from "@/lib/db";
import { TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayPoint {
  label: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  bloodSugar?: number;
  weight?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWeeklyData(logs: HealthLog[]): DayPoint[] {
  const days: DayPoint[] = Array.from({ length: 7 }, (_, i) => {
    const date = daysAgoStr(6 - i);
    const dayLogs = logs.filter((l) => l.date === date);

    const vitals = dayLogs.filter((l) => l.type === "vitals");
    const sugar = dayLogs.filter((l) => l.type === "sugar");
    const weight = dayLogs.filter((l) => l.type === "weight");

    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b) / arr.length) : undefined;

    return {
      label: new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" }),
      systolic: avg(vitals.map((v) => v.systolic!).filter(Boolean)),
      diastolic: avg(vitals.map((v) => v.diastolic!).filter(Boolean)),
      heartRate: avg(vitals.map((v) => v.heartRate!).filter(Boolean)),
      bloodSugar: avg(sugar.map((v) => v.bloodSugar!).filter(Boolean)),
      weight: weight.length ? weight[weight.length - 1].weight : undefined,
    };
  });
  return days;
}

function trendIcon(data: (number | undefined)[], goodDir: "down" | "up" | "neutral") {
  const valid = data.filter((v): v is number => v !== undefined);
  if (valid.length < 2) return <Minus className="size-4 text-muted-foreground" />;
  const diff = valid[valid.length - 1] - valid[0];
  if (Math.abs(diff) < 2) return <Minus className="size-4 text-muted-foreground" />;
  if (diff > 0)
    return goodDir === "up"
      ? <TrendingUp className="size-4 text-green-600" />
      : <TrendingDown className="size-4 text-red-500" />;
  return goodDir === "down"
    ? <TrendingUp className="size-4 text-green-600" />
    : <TrendingDown className="size-4 text-red-500" />;
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="size-1.5 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, trend }: {
  label: string; value: string | number; unit: string; trend: React.ReactNode;
}) {
  return (
    <div className="surface-card p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5">
          {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </p>
      </div>
      {trend}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
      <BarChart2 className="size-10 opacity-20" aria-hidden />
      <p className="text-sm">No {label} data yet</p>
      <p className="text-xs">Start logging to see your trends</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AnalyticsCharts() {
  const { profile } = usePulseCareStore();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const db = getDB();
        const dates = Array.from({ length: 7 }, (_, i) => daysAgoStr(i));
        const data = await db.healthLogs.where("date").anyOf(dates).toArray();
        setLogs(data);
      } catch {
        // DB not available
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const weekData = useMemo(() => buildWeeklyData(logs), [logs]);

  const hasBP = weekData.some((d) => d.systolic);
  const hasSugar = weekData.some((d) => d.bloodSugar);
  const hasWeight = weekData.some((d) => d.weight);

  const latestBP = weekData.filter((d) => d.systolic).at(-1);
  const latestSugar = weekData.filter((d) => d.bloodSugar).at(-1);
  const avgHR = (() => {
    const valid = weekData.map((d) => d.heartRate).filter((v): v is number => v !== undefined);
    return valid.length ? Math.round(valid.reduce((a, b) => a + b) / valid.length) : null;
  })();

  const isDiabetic = profile?.condition === "Type 2 Diabetes";
  const isHypertensive = profile?.condition === "Hypertension";

  if (!loaded) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="surface-card h-48 animate-pulse bg-muted/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Latest BP"
          value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "—"}
          unit="mmHg"
          trend={trendIcon(weekData.map((d) => d.systolic), "down")}
        />
        {isDiabetic && (
          <StatCard
            label="Latest Sugar"
            value={latestSugar?.bloodSugar ?? "—"}
            unit="mg/dL"
            trend={trendIcon(weekData.map((d) => d.bloodSugar), "down")}
          />
        )}
        <StatCard
          label="Avg Heart Rate"
          value={avgHR ?? "—"}
          unit="bpm"
          trend={trendIcon(weekData.map((d) => d.heartRate), "neutral")}
        />
      </div>

      {/* ── Blood Pressure chart ── */}
      <section className="surface-card p-5 sm:p-6">
        <p className="eyebrow mb-1">7-day trend</p>
        <h2 className="font-semibold mb-4">Blood Pressure</h2>
        {hasBP ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                {/* Stage 2 hypertension reference line */}
                <ReferenceLine y={140} stroke="#DC2626" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "HT threshold", fontSize: 9, fill: "#DC2626", position: "insideTopLeft" }} />
                <Line
                  type="monotone" dataKey="systolic" name="Systolic"
                  stroke="#0F4C3A" strokeWidth={2.5} dot={{ r: 3 }}
                  connectNulls activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone" dataKey="diastolic" name="Diastolic"
                  stroke="#75d5c3" strokeWidth={2.5} dot={{ r: 3 }}
                  connectNulls activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="blood pressure" />
        )}
      </section>

      {/* ── Blood Sugar chart (shown for diabetics or if data exists) ── */}
      {(isDiabetic || hasSugar) && (
        <section className="surface-card p-5 sm:p-6">
          <p className="eyebrow mb-1">7-day trend</p>
          <h2 className="font-semibold mb-4">Blood Sugar</h2>
          {hasSugar ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={126} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: "Fasting limit", fontSize: 9, fill: "#F59E0B", position: "insideTopLeft" }} />
                  <Line
                    type="monotone" dataKey="bloodSugar" name="Glucose"
                    stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }}
                    connectNulls activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="blood sugar" />
          )}
        </section>
      )}

      {/* ── Weight chart ── */}
      {hasWeight && (
        <section className="surface-card p-5 sm:p-6">
          <p className="eyebrow mb-1">7-day trend</p>
          <h2 className="font-semibold mb-4">Weight</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="weight" name="Weight (kg)"
                  stroke="#0b6b62" strokeWidth={2.5} dot={{ r: 3 }}
                  connectNulls activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {!hasBP && !hasSugar && !hasWeight && (
        <div className="surface-card p-10 text-center text-muted-foreground">
          <BarChart2 className="size-12 mx-auto mb-4 opacity-20" aria-hidden />
          <p className="font-medium">No analytics data yet</p>
          <p className="text-sm mt-1">Start logging your vitals to see trends here.</p>
        </div>
      )}
    </div>
  );
}
