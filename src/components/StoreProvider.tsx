"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { usePulseCareStore } from "@/lib/store";

/**
 * StoreProvider — hydrates Zustand from IndexedDB on mount.
 * Redirects unauthenticated users to /onboarding.
 * Shows a premium loading screen while hydrating.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { hydrate, isHydrated, profile } = usePulseCareStore();
  const router = useRouter();
  const pathname = usePathname();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!profile && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isHydrated, profile, pathname, router]);

  // Show loading screen until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F4C3A] via-[#0b6b62] to-[#1a9080] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col items-center gap-5"
        >
          {/* Pulsing logo */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl bg-white/10"
            />
            <span className="relative grid size-20 place-items-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-2xl">
              <HeartPulse className="size-10 text-white" />
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">PulseCare</h1>
            <p className="text-white/60 text-sm mt-1">Loading your health data…</p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="size-2 rounded-full bg-white/50"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // On onboarding page, skip the guard
  if (pathname === "/onboarding") {
    return <AnimatePresence mode="wait">{children}</AnimatePresence>;
  }

  // Redirect in progress — don't flash the app
  if (!profile) return null;

  return <>{children}</>;
}
