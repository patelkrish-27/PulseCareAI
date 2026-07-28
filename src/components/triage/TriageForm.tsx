"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Loader2, Mic, MicOff,
  AlertTriangle, CheckCircle2, XCircle, Info, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { usePulseCareStore } from "@/lib/store";
import { LOCAL_RESOURCES, TRIAGE_LEVEL_RESOURCES } from "@/lib/resources";
import type { TriageAPIResponse } from "@/app/api/triage/route";
import { cn } from "@/lib/utils";
import {
  useSpeechRecognition, ResourceCard, DURATIONS, STEP_LABELS,
  formSchema, type FormData,
} from "./triageHelpers";

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d < 0 ? 48 : -48, opacity: 0 }),
};

export function TriageForm() {
  const { profile, addTriageEvent } = usePulseCareStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<(TriageAPIResponse & { _fallback?: boolean }) | null>(null);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
    getValues, trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
      severity: 5,
      duration: "",
      notes: "",
    },
  });

  const severity = watch("severity") ?? 5;
  const duration = watch("duration");
  const symptoms = watch("symptoms");

  // Voice input
  const { listening, start: startVoice, stop: stopVoice } = useSpeechRecognition((text) => {
    setValue("symptoms", (symptoms ? symptoms + " " : "") + text, { shouldValidate: true });
  });

  const goNext = () => { setDir(1); setStep((s) => s + 1); };
  const goPrev = () => { setDir(-1); setStep((s) => s - 1); };

  // Exposed so step-4 button can call it directly
  const submitForm = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: data.symptoms,
          severity: data.severity,
          systolic: data.systolic,
          diastolic: data.diastolic,
          temperature: data.temperature,
          duration: data.duration,
          notes: data.notes,
          patientAge: profile?.age,
          patientCondition: profile?.condition,
        }),
      });
      const parsed: TriageAPIResponse = await res.json();
      setResult(parsed);

      // Persist triage event to local DB
      await addTriageEvent({
        symptoms: data.symptoms,
        severity: data.severity,
        systolic: data.systolic,
        diastolic: data.diastolic,
        temperature: data.temperature,
        duration: data.duration,
        triageLevel: parsed.triage_level,
        rationale: parsed.rationale,
        redFlags: parsed.red_flags,
        confidenceScore: parsed.confidence_score,
      });

      setDir(1);
      setStep(5);
    } catch {
      // Fallback result
      const fallback: TriageAPIResponse & { _fallback: boolean } = {
        triage_level: "CONSULT_48H",
        rationale:
          "We could not reach the AI service. As a precaution, please consult a doctor within 48 hours if symptoms continue.",
        red_flags: [],
        confidence_score: 50,
        home_care_tips: [],
        _fallback: true,
      };
      setResult(fallback);
      setDir(1);
      setStep(5);
    } finally {
      setSubmitting(false);
    }
  });

  // Determine level color/icon for result step
  const levelConfig = result
    ? {
        HOME_CARE: {
          bg: "bg-green-50 dark:bg-green-950/20",
          border: "border-green-200 dark:border-green-800",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
          label: "Home Care",
        },
        CONSULT_48H: {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          border: "border-amber-200 dark:border-amber-800",
          icon: Info,
          iconColor: "text-amber-600",
          badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
          label: "Consult within 48h",
        },
        IMMEDIATE_FACILITY: {
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-800",
          icon: XCircle,
          iconColor: "text-red-600",
          badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
          label: "Go to Hospital Now",
        },
      }[result.triage_level]
    : null;

  // Relevant facilities for result
  const relevantFacilities = result
    ? LOCAL_RESOURCES.filter((r) =>
        TRIAGE_LEVEL_RESOURCES[result.triage_level].includes(r.type)
      ).slice(0, 3)
    : [];

  const isImmediate = result?.triage_level === "IMMEDIATE_FACILITY";

  return (
    <div className="surface-card overflow-hidden">
      {/* Progress bar */}
      {step < 5 && (
        <div className="border-b border-border/70 px-5 py-4 sm:px-6">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Step {step} of 4</span>
            <span>{STEP_LABELS[step - 1]}</span>
          </div>
          <Progress value={((step - 1) / 4) * 100} className="h-1.5" />
        </div>
      )}

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          {/* ── Step 1: Symptoms ── */}
          {step === 1 && (
            <motion.div key="s1" custom={dir} variants={slideVariants} initial="enter"
              animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="p-5 sm:p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Describe your symptoms</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Be as specific as you can. You can also use the microphone.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="symptoms">Symptoms *</Label>
                  <Button
                    type="button"
                    variant={listening ? "destructive" : "outline"}
                    size="sm"
                    onClick={listening ? stopVoice : startVoice}
                    aria-label={listening ? "Stop voice input" : "Start voice input"}
                    className="rounded-full gap-1.5 text-xs h-8"
                  >
                    {listening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                    {listening ? "Stop" : "Dictate"}
                  </Button>
                </div>
                <Textarea
                  id="symptoms"
                  {...register("symptoms")}
                  placeholder="E.g., I have had a headache and mild fever for the past two days…"
                  className={cn("min-h-28 resize-none", listening && "ring-2 ring-primary")}
                  aria-describedby="symptoms-error"
                />
                {listening && (
                  <p className="text-xs text-primary flex items-center gap-1.5 mt-1.5 animate-pulse">
                    <span className="size-1.5 rounded-full bg-primary" /> Listening…
                  </p>
                )}
                {errors.symptoms && (
                  <p id="symptoms-error" className="text-xs text-destructive mt-1">
                    {errors.symptoms.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-3 block">
                  Severity: <span className="font-bold text-foreground">{severity}/10</span>
                </Label>
                <input
                  type="range" min={1} max={10}
                  {...register("severity", { valueAsNumber: true })}
                  className="w-full accent-primary h-2 cursor-pointer"
                  aria-label="Symptom severity from 1 to 10"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Mild</span><span>Moderate</span><span>Severe</span>
                </div>
              </div>

              <Button onClick={async () => {
                const ok = await trigger("symptoms");
                if (ok) goNext();
              }} className="w-full h-12 rounded-xl">
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Vitals ── */}
          {step === 2 && (
            <motion.div key="s2" custom={dir} variants={slideVariants} initial="enter"
              animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="p-5 sm:p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Current vitals</h2>
                <p className="text-sm text-muted-foreground mt-1">Leave blank if you don&apos;t have a reading.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolic" className="mb-1.5 block">Systolic (mmHg)</Label>
                  <Input id="systolic" type="number"
                    {...register("systolic", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    placeholder="120" className="h-12"
                    aria-label="Systolic blood pressure"
                  />
                  {errors.systolic && (
                    <p className="text-xs text-destructive mt-1">{errors.systolic.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="diastolic" className="mb-1.5 block">Diastolic (mmHg)</Label>
                  <Input id="diastolic" type="number"
                    {...register("diastolic", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    placeholder="80" className="h-12"
                    aria-label="Diastolic blood pressure"
                  />
                  {errors.diastolic && (
                    <p className="text-xs text-destructive mt-1">{errors.diastolic.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="temperature" className="mb-1.5 block">Temperature (°F)</Label>
                  <Input id="temperature" type="number" step="0.1"
                    {...register("temperature", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    placeholder="98.6" className="h-12"
                    aria-label="Body temperature in Fahrenheit"
                  />
                  {errors.temperature && (
                    <p className="text-xs text-destructive mt-1">{errors.temperature.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goPrev} className="flex-1 h-12 rounded-xl">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
                <Button onClick={goNext} className="flex-1 h-12 rounded-xl">
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Duration ── */}
          {step === 3 && (
            <motion.div key="s3" custom={dir} variants={slideVariants} initial="enter"
              animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="p-5 sm:p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-semibold tracking-tight">How long have you had these symptoms?</h2>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {DURATIONS.map((d) => (
                  <button key={d} type="button"
                    onClick={() => setValue("duration", d, { shouldValidate: true })}
                    aria-pressed={duration === d}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border text-sm font-medium transition-all text-left min-h-[52px]",
                      duration === d
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    {d}
                    {duration === d && <CheckCircle2 className="size-4 shrink-0" aria-hidden />}
                  </button>
                ))}
              </div>
              {errors.duration && (
                <p className="text-xs text-destructive">{errors.duration.message}</p>
              )}

              <div>
                <Label htmlFor="notes" className="mb-1.5 block">Additional notes (optional)</Label>
                <Textarea
                  id="notes" {...register("notes")}
                  placeholder="Any other context, medications you're taking, allergies…"
                  className="resize-none min-h-20"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goPrev} className="flex-1 h-12 rounded-xl">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => { if (duration) goNext(); else setValue("duration", "", { shouldValidate: true }); }}
                  className="flex-1 h-12 rounded-xl"
                >
                  Review <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Review + Submit ── */}
          {step === 4 && (
            <motion.div key="s4" custom={dir} variants={slideVariants} initial="enter"
              animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="p-5 sm:p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Review &amp; submit</h2>
                <p className="text-sm text-muted-foreground mt-1">Confirm your details before the AI assessment.</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3 text-sm">
                {[
                  { label: "Patient", value: profile ? `${profile.name}, ${profile.age}yo` : "Unknown" },
                  { label: "Condition", value: profile?.condition ?? "None" },
                  { label: "Symptoms", value: getValues("symptoms") },
                  { label: "Severity", value: `${getValues("severity")}/10` },
                  { label: "Duration", value: getValues("duration") },
                  {
                    label: "Blood pressure",
                    value: getValues("systolic") && getValues("diastolic")
                      ? `${getValues("systolic")}/${getValues("diastolic")} mmHg`
                      : "Not provided",
                  },
                  {
                    label: "Temperature",
                    value: getValues("temperature") ? `${getValues("temperature")}°F` : "Not provided",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-muted-foreground w-32 shrink-0">{label}</span>
                    <span className="font-medium flex-1 break-words">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 text-sm">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                <p className="text-amber-800 dark:text-amber-300">
                  This AI assessment provides guidance only — not a medical diagnosis.
                  Always consult a qualified doctor for serious concerns.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={goPrev} className="flex-1 h-12 rounded-xl">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => submitForm()}
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl"
                >
                  {submitting ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" /> Analysing…</>
                  ) : (
                    <>Get Assessment <ChevronRight className="size-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Result ── */}
          {step === 5 && result && levelConfig && (
            <motion.div key="s5" custom={dir} variants={slideVariants} initial="enter"
              animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="p-5 sm:p-6 space-y-6"
            >
              {/* Urgent pulsing banner for IMMEDIATE */}
              {isImmediate && (
                <motion.div
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex items-center gap-3 rounded-2xl bg-red-600 text-white p-4"
                  role="alert"
                  aria-live="assertive"
                >
                  <ShieldAlert className="size-6 shrink-0" aria-hidden />
                  <p className="font-semibold text-sm">
                    URGENT — Please go to the nearest hospital or call 108 immediately.
                  </p>
                </motion.div>
              )}

              {/* Result card */}
              <div className={cn("rounded-2xl border p-5 space-y-4", levelConfig.bg, levelConfig.border)}>
                <div className="flex items-center gap-3">
                  <levelConfig.icon className={cn("size-7 shrink-0", levelConfig.iconColor)} aria-hidden />
                  <div>
                    <span className={cn("text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full", levelConfig.badge)}>
                      {levelConfig.label}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {result.confidence_score}%
                      {result._fallback && " (AI unavailable — safe default)"}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed">{result.rationale}</p>

                {result.red_flags.length > 0 && (
                  <div className="rounded-xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                      🚨 Red flags detected
                    </p>
                    <ul className="space-y-1">
                      {result.red_flags.map((f, i) => (
                        <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                          <span className="text-red-500 shrink-0 mt-0.5">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.home_care_tips && result.home_care_tips.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Home care tips
                    </p>
                    <ul className="space-y-1.5">
                      {result.home_care_tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-green-600 shrink-0 mt-0.5" aria-hidden />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Nearby facilities */}
              {relevantFacilities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">
                    {isImmediate ? "🏥 Nearest emergency facilities" : "📍 Nearby health centres"}
                  </p>
                  <div className="space-y-3">
                    {relevantFacilities.map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => { setStep(1); setDir(-1); setResult(null); }}
                className="w-full h-12 rounded-xl"
              >
                Start new assessment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
