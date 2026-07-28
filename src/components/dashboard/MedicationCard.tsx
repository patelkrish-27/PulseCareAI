"use client";

import { useCallback } from "react";
import { CheckCircle2, Circle, Plus, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePulseCareStore } from "@/lib/store";
import type { Medication, MedicationLog } from "@/lib/db";

async function fireConfetti() {
  // Dynamically import to avoid SSR issues
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0.5, y: 0.7 },
    colors: ["#0F4C3A", "#75d5c3", "#E8F5F1", "#F59E0B"],
    gravity: 1.2,
    scalar: 0.8,
  });
}

export function MedicationCard() {
  const { medications, todayMedLogs, toggleMedication } = usePulseCareStore();

  const isTaken = useCallback(
    (medId: number): boolean => {
      return todayMedLogs.some((l: MedicationLog) => l.medicationId === medId && l.taken);
    },
    [todayMedLogs]
  );

  const handleToggle = async (med: Medication) => {
    if (!med.id) return;
    const wasUntaken = !isTaken(med.id);
    await toggleMedication(med.id);
    if (wasUntaken) {
      await fireConfetti();
    }
  };

  const takenCount = medications.filter((m) => m.id && isTaken(m.id)).length;
  const total = medications.length;

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="eyebrow">Today&apos;s schedule</p>
          <h2 className="mt-1 font-semibold tracking-tight">Medication Reminders</h2>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            takenCount === total && total > 0
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
          aria-label={`${takenCount} of ${total} medications taken`}
        >
          {takenCount}/{total} taken
        </span>
      </div>

      {medications.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <Pill className="size-10 mx-auto mb-3 opacity-30" aria-hidden />
          <p className="text-sm font-medium">No medications added yet</p>
          <p className="text-xs mt-1">Add your first medication to get daily reminders</p>
        </div>
      ) : (
        <div className="space-y-2">
          {medications.map((med) => {
            const taken = med.id ? isTaken(med.id) : false;
            return (
              <button
                key={med.id}
                onClick={() => handleToggle(med)}
                aria-label={`Mark ${med.name} as ${taken ? "not taken" : "taken"}`}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left min-h-[56px] active:scale-[0.98]",
                  taken
                    ? "bg-primary/5 border-primary/20"
                    : "bg-background/50 border-border/70 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-3">
                  {taken ? (
                    <CheckCircle2 className="size-6 text-primary shrink-0" aria-hidden />
                  ) : (
                    <Circle className="size-6 text-muted-foreground shrink-0" aria-hidden />
                  )}
                  <div>
                    <p
                      className={cn(
                        "font-medium text-sm leading-tight",
                        taken && "line-through text-muted-foreground"
                      )}
                    >
                      {med.name} {med.dosage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{med.time}</p>
                  </div>
                </div>
                {taken && (
                  <span className="text-xs font-semibold text-primary shrink-0">✓ Done</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Link href="/logs?tab=meds">
        <Button className="w-full mt-4 rounded-xl" variant="outline">
          <Plus className="size-4 mr-2" aria-hidden />
          {medications.length === 0 ? "Add First Medication" : "Add Medication"}
        </Button>
      </Link>
    </section>
  );
}
