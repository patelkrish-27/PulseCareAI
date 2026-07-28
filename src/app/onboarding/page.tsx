"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, User, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePulseCareStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Condition, Language } from "@/lib/db";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z
    .number({ message: "Age is required" })
    .min(1, "Age must be at least 1")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Please select gender" }),
  language: z.enum(["en", "hi"], { message: "Please select a language" }),
});

const step2Schema = z.object({
  condition: z.enum(["Type 2 Diabetes", "Hypertension", "Asthma", "None"], {
    message: "Please select a condition",
  }),
});

const step3Schema = z.object({
  weight: z.number().min(10).max(300).optional().or(z.literal(undefined)),
  height: z.number().min(50).max(250).optional().or(z.literal(undefined)),
});

// ─── Component ────────────────────────────────────────────────────────────────

const CONDITIONS: Condition[] = ["Type 2 Diabetes", "Hypertension", "Asthma", "None"];
const CONDITION_ICONS: Record<Condition, string> = {
  "Type 2 Diabetes": "🩸",
  Hypertension: "💓",
  Asthma: "🫁",
  None: "✅",
};

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile } = usePulseCareStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  // Collect data across steps
  const [step1Data, setStep1Data] = useState<z.infer<typeof step1Schema> | null>(null);
  const [step2Data, setStep2Data] = useState<z.infer<typeof step2Schema> | null>(null);

  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", age: undefined, gender: undefined, language: "en" },
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { condition: undefined },
  });

  const form3 = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { weight: undefined, height: undefined },
  });

  const goNext = () => {
    setDir(1);
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    setDir(-1);
    setStep((s) => s - 1);
  };

  const handleStep1 = form1.handleSubmit((data) => {
    setStep1Data(data);
    goNext();
  });

  const handleStep2 = form2.handleSubmit((data) => {
    setStep2Data(data);
    goNext();
  });

  const handleStep3 = form3.handleSubmit(async (data) => {
    if (!step1Data || !step2Data) return;
    setSaving(true);
    try {
      await saveProfile({
        name: step1Data.name,
        age: step1Data.age,
        gender: step1Data.gender,
        language: step1Data.language as Language,
        condition: step2Data.condition as Condition,
        weight: data.weight,
        height: data.height,
      });
      router.push("/");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F4C3A] via-[#0b6b62] to-[#1a9080] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
            <HeartPulse className="size-6 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PulseCare</h1>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Personal Health AI</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "rounded-full transition-all duration-300",
                s === step
                  ? "w-8 h-2 bg-white"
                  : s < step
                  ? "w-2 h-2 bg-white/60"
                  : "w-2 h-2 bg-white/20"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                    <User className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Step 1 of 3</p>
                    <h2 className="text-xl font-semibold text-white">About You</h2>
                  </div>
                </div>

                <form onSubmit={handleStep1} className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label className="text-white/80 text-sm mb-1.5 block">Full Name</Label>
                    <Input
                      {...form1.register("name")}
                      placeholder="e.g. Rohit Patel"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20 h-12"
                      aria-label="Full name"
                    />
                    {form1.formState.errors.name && (
                      <p className="text-red-300 text-xs mt-1">{form1.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <Label className="text-white/80 text-sm mb-1.5 block">Age</Label>
                    <Input
                      type="number"
                      {...form1.register("age", { valueAsNumber: true })}
                      placeholder="e.g. 45"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 h-12"
                      aria-label="Age"
                    />
                    {form1.formState.errors.age && (
                      <p className="text-red-300 text-xs mt-1">{form1.formState.errors.age.message}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <Label className="text-white/80 text-sm mb-1.5 block">Gender</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Male", "Female", "Other"] as const).map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => form1.setValue("gender", g, { shouldValidate: true })}
                          className={cn(
                            "h-11 rounded-xl border text-sm font-medium transition-all",
                            form1.watch("gender") === g
                              ? "bg-white text-[#0F4C3A] border-white"
                              : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
                          )}
                          aria-pressed={form1.watch("gender") === g}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {form1.formState.errors.gender && (
                      <p className="text-red-300 text-xs mt-1">{form1.formState.errors.gender.message}</p>
                    )}
                  </div>

                  {/* Language */}
                  <div>
                    <Label className="text-white/80 text-sm mb-1.5 flex items-center gap-1.5">
                      <Globe className="size-3.5" /> Preferred Language
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["en", "hi"] as const).map((l) => (
                        <button
                          type="button"
                          key={l}
                          onClick={() => form1.setValue("language", l, { shouldValidate: true })}
                          className={cn(
                            "h-11 rounded-xl border text-sm font-medium transition-all",
                            form1.watch("language") === l
                              ? "bg-white text-[#0F4C3A] border-white"
                              : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
                          )}
                          aria-pressed={form1.watch("language") === l}
                        >
                          {l === "en" ? "🇬🇧 English" : "🇮🇳 हिंदी"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-white text-[#0F4C3A] hover:bg-white/90 font-semibold rounded-xl mt-2 text-base"
                  >
                    Continue <ArrowRight className="ml-2 size-4" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: Condition ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                    <Activity className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Step 2 of 3</p>
                    <h2 className="text-xl font-semibold text-white">Primary Condition</h2>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-5">
                  Selecting your condition helps PulseCare tailor reminders and tracking to your needs.
                </p>

                <form onSubmit={handleStep2} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {CONDITIONS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => form2.setValue("condition", c, { shouldValidate: true })}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                          form2.watch("condition") === c
                            ? "bg-white text-[#0F4C3A] border-white shadow-lg scale-[1.02]"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/15"
                        )}
                        aria-pressed={form2.watch("condition") === c}
                      >
                        <span className="text-2xl">{CONDITION_ICONS[c]}</span>
                        <div>
                          <p className="font-semibold">{c}</p>
                          <p
                            className={cn(
                              "text-xs mt-0.5",
                              form2.watch("condition") === c ? "text-[#0F4C3A]/70" : "text-white/50"
                            )}
                          >
                            {c === "Type 2 Diabetes" && "Track fasting & post-meal glucose"}
                            {c === "Hypertension" && "Monitor BP & heart rate daily"}
                            {c === "Asthma" && "Log symptoms & peak flow"}
                            {c === "None" && "General health monitoring"}
                          </p>
                        </div>
                        {form2.watch("condition") === c && (
                          <CheckCircle2 className="ml-auto size-5 text-[#0F4C3A]" />
                        )}
                      </button>
                    ))}
                  </div>
                  {form2.formState.errors.condition && (
                    <p className="text-red-300 text-xs">{form2.formState.errors.condition.message}</p>
                  )}

                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={goPrev}
                      variant="outline"
                      className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 size-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-white text-[#0F4C3A] hover:bg-white/90 font-semibold rounded-xl"
                    >
                      Continue <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Step 3: Baseline Vitals ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                    <CheckCircle2 className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Step 3 of 3</p>
                    <h2 className="text-xl font-semibold text-white">Baseline Info</h2>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-5">
                  Optional — skip if you don&apos;t know these values. You can add them in the app later.
                </p>

                <form onSubmit={handleStep3} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80 text-sm mb-1.5 block">Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        {...form3.register("weight", { valueAsNumber: true })}
                        placeholder="72"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 h-12"
                        aria-label="Weight in kg"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80 text-sm mb-1.5 block">Height (cm)</Label>
                      <Input
                        type="number"
                        {...form3.register("height", { valueAsNumber: true })}
                        placeholder="170"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 h-12"
                        aria-label="Height in cm"
                      />
                    </div>
                  </div>

                  {/* Summary card */}
                  {step1Data && step2Data && (
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                      <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-3">Your Profile</p>
                      <div className="space-y-1.5 text-sm text-white">
                        <div className="flex justify-between">
                          <span className="text-white/60">Name</span>
                          <span className="font-medium">{step1Data.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Age</span>
                          <span className="font-medium">{step1Data.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Condition</span>
                          <span className="font-medium">
                            {CONDITION_ICONS[step2Data.condition]} {step2Data.condition}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Language</span>
                          <span className="font-medium">{step1Data.language === "en" ? "English" : "हिंदी"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={goPrev}
                      variant="outline"
                      className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 size-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 h-12 bg-white text-[#0F4C3A] hover:bg-white/90 font-semibold rounded-xl"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 rounded-full border-2 border-[#0F4C3A] border-t-transparent animate-spin" />
                          Saving…
                        </span>
                      ) : (
                        <>
                          Get Started <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          All data stays on your device — no account needed, no internet required.
        </p>
      </motion.div>
    </div>
  );
}
