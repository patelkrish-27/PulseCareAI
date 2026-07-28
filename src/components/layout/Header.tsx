"use client";

import {
  Bell, HeartPulse, PhoneCall, AlertTriangle, LogOut, Settings, UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePulseCareStore } from "@/lib/store";
import Link from "next/link";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 17) return `Good afternoon, ${name}.`;
  return `Good evening, ${name}.`;
}

function formattedDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function Header() {
  const { profile } = usePulseCareStore();
  const firstName = profile?.name.split(" ")[0] ?? "there";
  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "PC";

  return (
    <header className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-border/70 bg-background/55 px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse className="size-4" aria-hidden />
        </span>
        <span className="font-semibold">PulseCare</span>
      </div>

      {/* Desktop date */}
      <div className="hidden lg:block">
        <p className="text-xs text-muted-foreground">{formattedDate()}</p>
        <p className="text-sm font-medium">{getGreeting(firstName)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
          <Bell className="size-4" aria-hidden />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        {/* SOS */}
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="destructive" size="sm" className="hidden rounded-xl px-3 sm:flex">
                <PhoneCall className="size-3.5 mr-1.5" aria-hidden />
                SOS
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" aria-hidden />
                Emergency assistance
              </DialogTitle>
              <DialogDescription>
                For urgent symptoms, contact local emergency services immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="destructive"
                className="h-12 text-base"
                onClick={() => (window.location.href = "tel:112")}
              >
                📞 Call Emergency Services (112)
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => (window.location.href = "tel:1800-180-1104")}
              >
                🏥 National Health Helpline (1800-180-1104)
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ThemeToggle />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                <Avatar className="size-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-semibold">{profile?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                {profile?.condition ?? "General health"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem>
                <UserCircle className="size-4 mr-2" aria-hidden /> Profile & Settings
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" aria-hidden /> Preferences
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/onboarding">
              <DropdownMenuItem className="text-destructive">
                <LogOut className="size-4 mr-2" aria-hidden /> Reset Profile
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
