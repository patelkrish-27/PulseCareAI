"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Loader2, Activity, Droplets, Heart, Pill, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePulseCareStore } from "@/lib/store";
import { getDB, daysAgoStr, getVitalsAverage, getSugarAverage, calcAdherence } from "@/lib/db";
import type { HealthLog, TriageEvent } from "@/lib/db";

// ─── Generate PDF ──────────────────────────────────────────────────────────────

async function generatePDF(
  profile: NonNullable<ReturnType<typeof usePulseCareStore.getState>["profile"]>,
  weekLogs: HealthLog[],
  triageEvents: TriageEvent[],
  vitalsAvg: Awaited<ReturnType<typeof getVitalsAverage>>,
  sugarAvg: Awaited<ReturnType<typeof getSugarAverage>>,
  adherence: number,
  aiSummary: string
) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryColor: [number, number, number] = [15, 76, 58];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const pageW = 210;
  const margin = 16;
  let y = 20;

  // ── Header ──
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PulseCare Weekly Health Summary", margin, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, margin, 26);
  doc.text(`Period: ${new Date(daysAgoStr(6) + "T00:00").toLocaleDateString("en-IN")} – ${new Date().toLocaleDateString("en-IN")}`, margin, 32);

  y = 46;

  // ── Patient Details ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Details", margin, y);
  y += 2;
  doc.setDrawColor(...primaryColor);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const details = [
    ["Name", profile.name],
    ["Age", `${profile.age} years`],
    ["Gender", profile.gender],
    ["Primary Condition", profile.condition],
    ...(profile.weight ? [["Weight", `${profile.weight} kg`]] : []),
    ...(profile.height ? [["Height", `${profile.height} cm`]] : []),
  ];
  details.forEach(([label, val]) => {
    doc.setTextColor(...mutedColor);
    doc.text(label + ":", margin, y);
    doc.setTextColor(0, 0, 0);
    doc.text(val, margin + 38, y);
    y += 6;
  });

  y += 4;

  // ── Vitals Summary ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("7-Day Vitals Summary", margin, y);
  y += 2;
  doc.setDrawColor(...primaryColor);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const vitalItems: [string, string, boolean][] = [
    ["Avg Systolic BP", vitalsAvg ? `${vitalsAvg.avgSystolic} mmHg` : "No data", vitalsAvg ? (vitalsAvg.avgSystolic ?? 0) >= 140 : false],
    ["Avg Diastolic BP", vitalsAvg ? `${vitalsAvg.avgDiastolic} mmHg` : "No data", vitalsAvg ? (vitalsAvg.avgDiastolic ?? 0) >= 90 : false],
    ["Avg Heart Rate", vitalsAvg ? `${vitalsAvg.avgHeartRate} bpm` : "No data", false],
    ["Avg Blood Sugar", sugarAvg ? `${sugarAvg.avg} mg/dL` : "No data", sugarAvg ? sugarAvg.avg >= 126 : false],
    ["Medication Adherence (7d)", `${adherence}%`, adherence < 60],
    ["Triage Events", `${triageEvents.length} event${triageEvents.length !== 1 ? "s" : ""}`, false],
    ["Health Logs (week)", `${weekLogs.length} entries`, false],
  ];

  vitalItems.forEach(([label, value, isAlert]) => {
    doc.setTextColor(...mutedColor);
    doc.text(label + ":", margin, y);
    doc.setTextColor(isAlert ? 185 : 0, isAlert ? 28 : 0, isAlert ? 28 : 0);
    doc.setFont("helvetica", isAlert ? "bold" : "normal");
    doc.text(value + (isAlert ? " ⚠" : ""), margin + 55, y);
    doc.setFont("helvetica", "normal");
    y += 6.5;
  });

  y += 4;

  // ── AI Summary ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("AI-Generated Clinical Summary", margin, y);
  y += 2;
  doc.setDrawColor(...primaryColor);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  const splitSummary = doc.splitTextToSize(aiSummary, pageW - margin * 2);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 5.5 + 4;

  // ── Triage Events ──
  if (triageEvents.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Recent Triage Events", margin, y);
    y += 2;
    doc.setDrawColor(...primaryColor);
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    triageEvents.slice(0, 5).forEach((t) => {
      const levelColors: Record<string, [number, number, number]> = {
        HOME_CARE: [22, 163, 74],
        CONSULT_48H: [217, 119, 6],
        IMMEDIATE_FACILITY: [220, 38, 38],
      };
      const [r, g, b] = levelColors[t.triageLevel] ?? [100, 100, 100];
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(`${t.triageLevel.replace(/_/g, " ")} — ${new Date(t.createdAt).toLocaleDateString("en-IN")}`, margin, y);
      y += 5.5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      const lines = doc.splitTextToSize(t.rationale, pageW - margin * 2 - 5);
      doc.text(lines, margin + 3, y);
      y += lines.length * 5 + 3;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(
      "This report is generated by PulseCareAI for informational purposes only. Not a substitute for professional medical advice.",
      margin,
      295
    );
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin - 18, 295);
  }

  doc.save(`PulseCare_Report_${profile.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─── AI Summary fetch ─────────────────────────────────────────────────────────

async function fetchAISummary(
  profile: NonNullable<ReturnType<typeof usePulseCareStore.getState>["profile"]>,
  vitalsAvg: Awaited<ReturnType<typeof getVitalsAverage>>,
  sugarAvg: Awaited<ReturnType<typeof getSugarAverage>>,
  adherence: number,
  triageCount: number
): Promise<string> {
  try {
    const prompt = `Write a 3-sentence clinical summary for a weekly health report. Patient: ${profile.name}, ${profile.age}yo, managing ${profile.condition}. 
Average BP this week: ${vitalsAvg?.avgSystolic ?? "N/A"}/${vitalsAvg?.avgDiastolic ?? "N/A"} mmHg. 
Average blood sugar: ${sugarAvg?.avg ?? "N/A"} mg/dL. 
Medication adherence: ${adherence}%. Triage events: ${triageCount}.
Use plain, compassionate language suitable for a clinician reviewing a rural patient's data. End with one actionable recommendation.`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        context: { name: profile.name, age: profile.age, condition: profile.condition, language: "en" },
      }),
    });
    const data = await res.json();
    return data.content ?? "Summary unavailable.";
  } catch {
    return `${profile.name} (${profile.age}yo, ${profile.condition}) completed their weekly health check. Vitals and medication data have been recorded. Please review the attached readings and follow up as needed.`;
  }
}

// ─── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({ icon: Icon, label, value, alert }: {
  icon: React.ElementType; label: string; value: string; alert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-primary/9 text-primary shrink-0">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${alert ? "text-red-600" : "text-foreground"}`}>
        {value}
        {alert && <AlertTriangle className="inline size-3.5 ml-1.5 text-red-500" aria-hidden />}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { profile, triageEvents, medications } = usePulseCareStore();
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<{
    vitalsAvg: Awaited<ReturnType<typeof getVitalsAverage>>;
    sugarAvg: Awaited<ReturnType<typeof getSugarAverage>>;
    adherence: number;
    logCount: number;
  } | null>(null);

  const handleGenerate = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const db = getDB();
      const dates = Array.from({ length: 7 }, (_, i) => daysAgoStr(i));
      const weekLogs = await db.healthLogs.where("date").anyOf(dates).toArray();

      const [vitalsAvg, sugarAvg] = await Promise.all([
        getVitalsAverage(7),
        getSugarAverage(7),
      ]);

      // Calculate average adherence across all active medications
      let adherence = 0;
      if (medications.length > 0) {
        const adherences = await Promise.all(
          medications.filter((m) => m.id).map((m) => calcAdherence(m.id!, 7))
        );
        adherence = Math.round(adherences.reduce((a, b) => a + b, 0) / adherences.length);
      }

      setSummary({ vitalsAvg, sugarAvg, adherence, logCount: weekLogs.length });

      const aiSummary = await fetchAISummary(profile, vitalsAvg, sugarAvg, adherence, triageEvents.length);

      await generatePDF(
        profile,
        weekLogs,
        triageEvents.slice(0, 5),
        vitalsAvg,
        sugarAvg,
        adherence,
        aiSummary
      );
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <FileText className="size-5 text-primary" aria-hidden />
          <p className="eyebrow">Weekly report</p>
        </div>
        <h1 className="section-title">Health Summary</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Generate a PDF summary of your last 7 days — vitals, medications, and triage events.
        </p>
      </div>

      {/* Preview card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-5 sm:p-6"
      >
        <p className="eyebrow mb-4">Report preview</p>

        {profile ? (
          <>
            <div className="rounded-2xl bg-muted/40 border border-border p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.age}yo · {profile.gender} · {profile.condition}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Report period: last 7 days · {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>

            {summary && (
              <div className="mb-5">
                <StatRow
                  icon={Activity}
                  label="Avg Blood Pressure"
                  value={summary.vitalsAvg
                    ? `${summary.vitalsAvg.avgSystolic}/${summary.vitalsAvg.avgDiastolic} mmHg`
                    : "No data"}
                  alert={summary.vitalsAvg ? (summary.vitalsAvg.avgSystolic ?? 0) >= 140 : false}
                />
                <StatRow
                  icon={Droplets}
                  label="Avg Blood Sugar"
                  value={summary.sugarAvg ? `${summary.sugarAvg.avg} mg/dL` : "No data"}
                  alert={summary.sugarAvg ? summary.sugarAvg.avg >= 126 : false}
                />
                <StatRow
                  icon={Pill}
                  label="Medication Adherence"
                  value={`${summary.adherence}%`}
                  alert={summary.adherence < 60}
                />
                <StatRow
                  icon={Heart}
                  label="Health Log Entries"
                  value={`${summary.logCount} entries`}
                />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-12 rounded-xl text-base gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  Generating report…
                </>
              ) : (
                <>
                  <Download className="size-5" aria-hidden />
                  Generate &amp; Download PDF
                </>
              )}
            </Button>

            {generating && (
              <p className="text-xs text-center text-muted-foreground mt-3 animate-pulse">
                Fetching AI summary and compiling your data…
              </p>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="size-10 mx-auto mb-3 opacity-20" aria-hidden />
            <p>Complete onboarding first to generate your report.</p>
          </div>
        )}
      </motion.div>

      {/* Info box */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1.5">
        <p className="font-semibold text-foreground text-xs uppercase tracking-wider">What&apos;s included</p>
        {[
          "Patient profile and baseline details",
          "7-day average vitals (BP, heart rate, blood sugar)",
          "Medication adherence percentage",
          "AI-generated 3-sentence clinical summary",
          "Recent triage assessment events",
        ].map((item) => (
          <p key={item} className="flex items-center gap-2 text-xs">
            <span className="size-1 rounded-full bg-primary shrink-0" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
