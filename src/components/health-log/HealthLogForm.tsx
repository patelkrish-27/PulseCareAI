"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Droplets, Scale, Pill, Moon, Dumbbell, CheckCircle2, Plus, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePulseCareStore } from "@/lib/store";
import { todayStr } from "@/lib/db";
import { cn } from "@/lib/utils";

// ─── Schemas per tab ──────────────────────────────────────────────────────────

const vitalsSchema = z.object({
  systolic: z.number({ invalid_type_error: "Required" }).min(50, "Too low").max(300, "Too high"),
  diastolic: z.number({ invalid_type_error: "Required" }).min(30, "Too low").max(200, "Too high"),
  heartRate: z.number().min(30).max(250).optional().or(z.literal(undefined)),
});

const sugarSchema = z.object({
  bloodSugar: z.number({ invalid_type_error: "Required" }).min(20).max(600),
  sugarTiming: z.enum(["fasting", "post-meal", "random"]),
});

const weightSchema = z.object({
  weight: z.number({ invalid_type_error: "Required" }).min(10).max(300),
});

const medicationSchema = z.object({
  name: z.string().min(2, "Medication name required"),
  dosage: z.string().min(1, "Dosage required"),
  time: z.string().min(1, "Time required"),
  frequency: z.enum(["daily", "twice-daily", "weekly", "as-needed"]),
});

const sleepSchema = z.object({
  sleepHours: z.number({ invalid_type_error: "Required" }).min(0).max(24),
  sleepQuality: z.number().min(1).max(5),
});

const activitySchema = z.object({
  activityType: z.string().min(2, "Activity type required"),
  activityDuration: z.number({ invalid_type_error: "Required" }).min(1).max(600),
  steps: z.number().min(0).optional().or(z.literal(undefined)),
});

// ─── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "vitals", label: "Vitals", icon: Heart },
  { id: "sugar", label: "Sugar", icon: Droplets },
  { id: "weight", label: "Weight", icon: Scale },
  { id: "meds", label: "Meds", icon: Pill },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "activity", label: "Activity", icon: Dumbbell },
];

// ─── Sub-forms ─────────────────────────────────────────────────────────────────

function VitalsForm({ onSave }: { onSave: (data: object) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(vitalsSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="systolic" className="mb-1.5 block">Systolic (mmHg) *</Label>
          <Input id="systolic" type="number"
            {...register("systolic", { valueAsNumber: true })}
            placeholder="120" className="h-12"
            aria-describedby="systolic-err"
          />
          {errors.systolic && <p id="systolic-err" className="text-xs text-destructive mt-1">{errors.systolic.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="diastolic" className="mb-1.5 block">Diastolic (mmHg) *</Label>
          <Input id="diastolic" type="number"
            {...register("diastolic", { valueAsNumber: true })}
            placeholder="80" className="h-12"
            aria-describedby="diastolic-err"
          />
          {errors.diastolic && <p id="diastolic-err" className="text-xs text-destructive mt-1">{errors.diastolic.message as string}</p>}
        </div>
        <div className="col-span-2">
          <Label htmlFor="heartRate" className="mb-1.5 block">Heart Rate (bpm)</Label>
          <Input id="heartRate" type="number"
            {...register("heartRate", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            placeholder="72" className="h-12"
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save Reading"}
      </Button>
    </form>
  );
}

function SugarForm({ onSave }: { onSave: (data: object) => Promise<void> }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(sugarSchema),
    defaultValues: { sugarTiming: "fasting" as const },
  });
  const timing = watch("sugarTiming");
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <Label htmlFor="bloodSugar" className="mb-1.5 block">Blood Sugar (mg/dL) *</Label>
        <Input id="bloodSugar" type="number"
          {...register("bloodSugar", { valueAsNumber: true })}
          placeholder="105" className="h-12"
        />
        {errors.bloodSugar && <p className="text-xs text-destructive mt-1">{errors.bloodSugar.message as string}</p>}
      </div>
      <div>
        <Label className="mb-2 block">Time of test</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["fasting", "post-meal", "random"] as const).map((t) => (
            <button key={t} type="button"
              onClick={() => setValue("sugarTiming", t)}
              aria-pressed={timing === t}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium capitalize transition-all",
                timing === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save Reading"}
      </Button>
    </form>
  );
}

function WeightForm({ onSave }: { onSave: (data: object) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(weightSchema) });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <Label htmlFor="weight" className="mb-1.5 block">Weight (kg) *</Label>
        <Input id="weight" type="number" step="0.1"
          {...register("weight", { valueAsNumber: true })}
          placeholder="72.5" className="h-12"
        />
        {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight.message as string}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save Weight"}
      </Button>
    </form>
  );
}

function MedicationForm({ onSave }: { onSave: (data: object) => Promise<void> }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(medicationSchema),
    defaultValues: { frequency: "daily" as const },
  });
  const freq = watch("frequency");
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <Label htmlFor="medName" className="mb-1.5 block">Medication Name *</Label>
        <Input id="medName" {...register("name")} placeholder="e.g. Metformin" className="h-12" />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dosage" className="mb-1.5 block">Dosage *</Label>
          <Input id="dosage" {...register("dosage")} placeholder="500mg" className="h-12" />
          {errors.dosage && <p className="text-xs text-destructive mt-1">{errors.dosage.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="time" className="mb-1.5 block">Time *</Label>
          <Input id="time" type="time" {...register("time")} className="h-12" />
          {errors.time && <p className="text-xs text-destructive mt-1">{errors.time.message as string}</p>}
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Frequency</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["daily", "twice-daily", "weekly", "as-needed"] as const).map((f) => (
            <button key={f} type="button"
              onClick={() => setValue("frequency", f)}
              aria-pressed={freq === f}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium capitalize transition-all",
                freq === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Add Medication"}
      </Button>
    </form>
  );
}

function SleepForm({ onSave }: { onSave: (data: object) => Promise<void> }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(sleepSchema),
    defaultValues: { sleepQuality: 3 },
  });
  const quality = watch("sleepQuality") ?? 3;
  const qualityLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <Label htmlFor="sleepHours" className="mb-1.5 block">Hours slept *</Label>
        <Input id="sleepHours" type="number" step="0.5"
          {...register("sleepHours", { valueAsNumber: true })}
          placeholder="7.5" className="h-12"
        />
        {errors.sleepHours && <p className="text-xs text-destructive mt-1">{errors.sleepHours.message as string}</p>}
      </div>
      <div>
        <Label className="mb-3 block">
          Sleep quality: <span className="font-semibold text-foreground">{qualityLabels[quality]}</span>
        </Label>
        <input type="range" min={1} max={5}
          {...register("sleepQuality", { valueAsNumber: true })}
          className="w-full accent-primary h-2 cursor-pointer"
          aria-label="Sleep quality 1 to 5"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Poor</span><span>Excellent</span>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save Sleep"}
      </Button>
    </form>
  );
}

function ActivityForm({ onSave }: { onSave: (data: object) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(activitySchema) });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <Label htmlFor="actType" className="mb-1.5 block">Activity type *</Label>
        <Input id="actType" {...register("activityType")} placeholder="Walking, Yoga, Cycling…" className="h-12" />
        {errors.activityType && <p className="text-xs text-destructive mt-1">{errors.activityType.message as string}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="actDuration" className="mb-1.5 block">Duration (min) *</Label>
          <Input id="actDuration" type="number"
            {...register("activityDuration", { valueAsNumber: true })}
            placeholder="30" className="h-12"
          />
          {errors.activityDuration && <p className="text-xs text-destructive mt-1">{errors.activityDuration.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="steps" className="mb-1.5 block">Steps (optional)</Label>
          <Input id="steps" type="number"
            {...register("steps", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            placeholder="3000" className="h-12"
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Log Activity"}
      </Button>
    </form>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function HealthLogForm({ defaultTab = "vitals" }: { defaultTab?: string }) {
  const { addHealthLog, addMedication, profile } = usePulseCareStore();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleVitals = async (data: object) => {
    const d = data as z.infer<typeof vitalsSchema>;
    await addHealthLog({ type: "vitals", date: todayStr(), ...d });
    showToast("Blood pressure and heart rate saved ✓");
  };

  const handleSugar = async (data: object) => {
    const d = data as z.infer<typeof sugarSchema>;
    await addHealthLog({ type: "sugar", date: todayStr(), ...d });
    showToast("Blood sugar saved ✓");
  };

  const handleWeight = async (data: object) => {
    const d = data as z.infer<typeof weightSchema>;
    await addHealthLog({ type: "weight", date: todayStr(), ...d });
    showToast("Weight saved ✓");
  };

  const handleMedication = async (data: object) => {
    const d = data as z.infer<typeof medicationSchema>;
    await addMedication({ ...d, active: true });
    showToast(`${d.name} added to your medication list ✓`);
  };

  const handleSleep = async (data: object) => {
    const d = data as z.infer<typeof sleepSchema>;
    await addHealthLog({ type: "sleep", date: todayStr(), ...d });
    showToast("Sleep logged ✓");
  };

  const handleActivity = async (data: object) => {
    const d = data as z.infer<typeof activitySchema>;
    await addHealthLog({ type: "activity", date: todayStr(), ...d });
    showToast("Activity saved ✓");
  };

  // Put condition-relevant tab first
  const orderedTabs = [...TABS];
  if (profile?.condition === "Type 2 Diabetes") {
    const idx = orderedTabs.findIndex((t) => t.id === "sugar");
    if (idx > 0) { const [t] = orderedTabs.splice(idx, 1); orderedTabs.unshift(t); }
  }

  return (
    <div className="surface-card p-5 sm:p-6">
      <div className="mb-5">
        <p className="eyebrow">Health log</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Add new entry</h2>
        {profile?.condition && profile.condition !== "None" && (
          <p className="text-xs text-muted-foreground mt-1">
            Tailored for managing: <span className="text-primary font-medium">{profile.condition}</span>
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6 h-auto p-1 gap-1">
          {orderedTabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id}
              className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              <Icon className="size-4" aria-hidden />
              <span className="text-xs">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="vitals"><VitalsForm onSave={handleVitals} /></TabsContent>
        <TabsContent value="sugar"><SugarForm onSave={handleSugar} /></TabsContent>
        <TabsContent value="weight"><WeightForm onSave={handleWeight} /></TabsContent>
        <TabsContent value="meds"><MedicationForm onSave={handleMedication} /></TabsContent>
        <TabsContent value="sleep"><SleepForm onSave={handleSleep} /></TabsContent>
        <TabsContent value="activity"><ActivityForm onSave={handleActivity} /></TabsContent>
      </Tabs>

      {/* Success toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-[#0F4C3A] text-white px-5 py-3 shadow-2xl text-sm font-medium"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            {toast}
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="ml-2 opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
