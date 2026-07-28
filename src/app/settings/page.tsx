"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePulseCareStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { Condition, Language } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.number().min(1).max(120),
  gender: z.enum(["Male", "Female", "Other"]),
  language: z.enum(["en", "hi"]),
  condition: z.enum(["Type 2 Diabetes", "Hypertension", "Asthma", "None"]),
  weight: z.number().min(10).max(300).optional().or(z.literal(undefined)),
  height: z.number().min(50).max(250).optional().or(z.literal(undefined)),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS: Condition[] = ["Type 2 Diabetes", "Hypertension", "Asthma", "None"];

export default function SettingsPage() {
  const { profile, updateProfile } = usePulseCareStore();

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", age: undefined, gender: "Male", language: "en",
      condition: "None", weight: undefined, height: undefined,
    },
  });

  // Hydrate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        language: profile.language,
        condition: profile.condition,
        weight: profile.weight,
        height: profile.height,
      });
    }
  }, [profile, reset]);

  const condition = watch("condition");
  const language = watch("language");
  const gender = watch("gender");

  const onSubmit = async (data: FormData) => {
    await updateProfile({
      name: data.name,
      age: data.age,
      gender: data.gender,
      language: data.language as Language,
      condition: data.condition as Condition,
      weight: data.weight,
      height: data.height,
    });
    reset(data); // Clear dirty state
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Settings className="size-5 text-primary" aria-hidden />
          <p className="eyebrow">Preferences</p>
        </div>
        <h1 className="section-title">Settings</h1>
      </div>

      {/* Profile settings */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="size-4 text-primary" aria-hidden />
          <h2 className="font-semibold">Profile</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="mb-1.5 block">Full Name</Label>
              <Input id="name" {...register("name")} className="h-12" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="age" className="mb-1.5 block">Age</Label>
              <Input id="age" type="number" {...register("age", { valueAsNumber: true })} className="h-12" />
              {errors.age && <p className="text-xs text-destructive mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <Label className="mb-2 block">Gender</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <button key={g} type="button"
                    onClick={() => setValue("gender", g, { shouldDirty: true })}
                    aria-pressed={gender === g}
                    className={cn(
                      "h-10 rounded-xl border text-xs font-medium transition-all",
                      gender === g ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Primary Condition</Label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <button key={c} type="button"
                  onClick={() => setValue("condition", c, { shouldDirty: true })}
                  aria-pressed={condition === c}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium text-left transition-all",
                    condition === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-1.5 block">
              <Globe className="size-3.5" aria-hidden /> Language
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(["en", "hi"] as const).map((l) => (
                <button key={l} type="button"
                  onClick={() => setValue("language", l, { shouldDirty: true })}
                  aria-pressed={language === l}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-medium transition-all",
                    language === l ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"
                  )}
                >
                  {l === "en" ? "🇬🇧 English" : "🇮🇳 हिंदी"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="mb-1.5 block">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1"
                {...register("weight", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                placeholder="72" className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="height" className="mb-1.5 block">Height (cm)</Label>
              <Input id="height" type="number"
                {...register("height", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                placeholder="170" className="h-12"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full h-12 rounded-xl gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="size-4 animate-spin" /> Saving…</>
            ) : isSubmitSuccessful && !isDirty ? (
              "Profile saved ✓"
            ) : (
              <><Save className="size-4" /> Save Changes</>
            )}
          </Button>
        </form>
      </motion.section>

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface-card p-5 sm:p-6"
      >
        <h2 className="font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Color theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </motion.section>

      {/* Privacy */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="surface-card p-5 sm:p-6"
      >
        <h2 className="font-semibold mb-3">Privacy</h2>
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 text-sm space-y-2">
          <p className="font-semibold text-primary">🔒 Your data never leaves this device</p>
          <p className="text-muted-foreground text-xs leading-5">
            All health records, vitals, and chat history are stored exclusively in your browser&apos;s
            local storage (IndexedDB). No account required. No data is sent to any server except
            anonymised AI prompts to generate triage and chat responses.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
