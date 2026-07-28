"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { usePulseCareStore } from "@/lib/store";

export function NudgeBanner() {
  const { activeNudge, dismissNudge } = usePulseCareStore();

  return (
    <AnimatePresence>
      {activeNudge && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{activeNudge}</p>
            </div>
            <button
              onClick={dismissNudge}
              aria-label="Dismiss alert"
              className="shrink-0 rounded-lg p-1 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
