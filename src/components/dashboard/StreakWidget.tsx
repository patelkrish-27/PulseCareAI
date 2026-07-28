"use client";

import { Flame, TrendingUp } from "lucide-react";
import { usePulseCareStore } from "@/lib/store";

export function StreakWidget() {
  const { streak } = usePulseCareStore();

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8a84d] to-[#d66d37] p-5 text-white shadow-[0_18px_32px_-20px_rgba(174,79,23,.8)]">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-white/15">
          <Flame className="size-5" aria-hidden />
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold flex items-center gap-1">
          <TrendingUp className="size-3" aria-hidden />
          This week
        </span>
      </div>
      <p className="mt-6 text-sm text-white/70">Healthy habit streak</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight">
        {streak.toString().padStart(2, "0")}{" "}
        <span className="text-base font-medium text-white/70">
          {streak === 1 ? "day" : "days"}
        </span>
      </p>

      {/* 7-day dots */}
      <div className="mt-5 flex gap-1.5" aria-label={`${streak} day streak`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < streak ? "bg-white" : "bg-white/25"
            }`}
          />
        ))}
      </div>

      {streak === 0 && (
        <p className="mt-3 text-xs text-white/60">
          Log your first reading today to start your streak!
        </p>
      )}
    </section>
  );
}
