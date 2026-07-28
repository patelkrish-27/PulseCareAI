"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart2, FileText, HeartPulse, HelpCircle,
  Home, MessageSquare, Settings, Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePulseCareStore } from "@/lib/store";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Chat Assistant", href: "/chat", icon: MessageSquare },
  { name: "Health Triage", href: "/triage", icon: Stethoscope },
  { name: "Health Logs", href: "/logs", icon: Activity },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
];

const secondary = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { streak, profile } = usePulseCareStore();

  const NavItem = ({ name, href, icon: Icon }: typeof navigation[0]) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]",
          active
            ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgba(11,107,98,.85)]"
            : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className={cn("size-4.5 shrink-0", active ? "" : "text-primary/70 group-hover:text-primary")} aria-hidden />
        {name}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-72 flex-col bg-background/65 px-3 py-4 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="mb-7 flex items-center gap-3 px-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#2c9b8e] text-primary-foreground shadow-lg shadow-primary/20">
          <HeartPulse className="size-5" aria-hidden />
        </span>
        <span>
          <strong className="block text-base tracking-tight">PulseCare</strong>
          <span className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Personal health</span>
        </span>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Secondary nav */}
      <div className="mt-5 border-t border-border/70 pt-4">
        <nav className="flex flex-col gap-1" aria-label="Secondary navigation">
          {secondary.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Streak / status widget */}
        <div className="mx-2 mt-5 rounded-xl bg-primary/7 p-3">
          {streak > 0 ? (
            <>
              <p className="text-xs font-semibold">🔥 {streak}-day streak!</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Keep it up, {profile?.name.split(" ")[0] ?? "there"}!
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold">Your care is in sync</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Log today&apos;s readings to start a streak
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
