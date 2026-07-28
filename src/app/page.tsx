"use client";

import { motion } from "framer-motion";
import {
  Activity, ArrowUpRight, FileText, Flame, MessageSquare, Plus, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { HealthSummaryCard } from "@/components/dashboard/HealthSummaryCard";
import { MedicationCard } from "@/components/dashboard/MedicationCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { usePulseCareStore } from "@/lib/store";

const QUICK_ACTIONS = [
  { label: "Check symptoms", caption: "Start a triage", href: "/triage", icon: Plus },
  { label: "Ask PulseCare", caption: "Talk to your assistant", href: "/chat", icon: MessageSquare },
  { label: "Log today", caption: "Record vitals", href: "/logs", icon: Activity },
  { label: "View reports", caption: "Your health story", href: "/reports", icon: FileText },
];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 17) return `Good afternoon, ${name}.`;
  return `Good evening, ${name}.`;
}

function getCareStatus(condition: string | undefined): string {
  if (condition === "Hypertension") return "Monitor your BP today";
  if (condition === "Type 2 Diabetes") return "Check your glucose levels";
  if (condition === "Asthma") return "Track your breathing today";
  return "Everything looks calm";
}

export default function Dashboard() {
  const { profile, todayLogs, medications, todayMedLogs } = usePulseCareStore();
  const firstName = profile?.name.split(" ")[0] ?? "there";
  const takenToday = todayMedLogs.filter((l) => l.taken).length;
  const totalMeds = medications.length;
  const careStatus = getCareStatus(profile?.condition);

  return (
    <div className="pb-5 space-y-6">
      {/* ── Hero Banner ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        className="reveal relative overflow-hidden rounded-3xl border border-primary/10 bg-[#103d3b] px-6 py-7 text-white shadow-[0_20px_50px_-26px_rgba(4,49,45,.8)] sm:px-8"
      >
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#6ccfbb]/20 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-1/3 size-48 rounded-full bg-[#d9eeb4]/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9ee4d4]">
              Your daily overview
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
              {getGreeting(firstName)}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              {totalMeds > 0
                ? `${totalMeds - takenToday} medication reminder${
                    totalMeds - takenToday !== 1 ? "s" : ""
                  } remaining today.`
                : "Welcome to PulseCare. Start by logging your first reading."}
            </p>
            {profile?.condition && profile.condition !== "None" && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Flame className="size-3 text-amber-300" aria-hidden />
                Managing: {profile.condition}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck className="size-4 text-[#9ee4d4]" aria-hidden />
              Care status
            </p>
            <p className="mt-1 text-lg font-semibold">{careStatus}</p>
          </div>
        </div>
      </motion.section>

      {/* ── Health Summary ── */}
      <HealthSummaryCard />

      {/* ── Bento Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Quick actions + Medication */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="surface-card p-5 sm:p-6"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep momentum</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  What would you like to do?
                </h2>
              </div>
              <span className="hidden text-sm text-muted-foreground sm:block">
                Four shortcuts for today
              </span>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {QUICK_ACTIONS.map((item) => (
                <Link
                  href={item.href}
                  key={item.label}
                  className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-3.5 transition hover:border-primary/30 hover:bg-primary/5 min-h-[56px]"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <item.icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">{item.caption}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary shrink-0"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Medication reminders */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <MedicationCard />
          </motion.div>
        </div>

        {/* Right: Streak + Recent Activity */}
        <aside className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <StreakWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <RecentActivityCard />
          </motion.div>

          {/* Today's summary card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="surface-card p-5"
          >
            <p className="eyebrow">Your profile</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">{profile?.age ?? "—"} yrs</span>
              </div>
              {profile?.weight && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{profile.weight} kg</span>
                </div>
              )}
              {profile?.height && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium">{profile.height} cm</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium">{profile?.condition ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entries today</span>
                <span className="font-medium text-primary">{todayLogs.length}</span>
              </div>
            </div>
            <Link
              href="/settings"
              className="mt-4 block text-center text-xs text-primary font-medium hover:underline"
            >
              Edit profile →
            </Link>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
