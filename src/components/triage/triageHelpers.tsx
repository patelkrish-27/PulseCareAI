"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Loader2, Mic, MicOff, AlertTriangle,
  CheckCircle2, XCircle, Info, Phone, MapPin, Clock, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { usePulseCareStore } from "@/lib/store";
import {
  LOCAL_RESOURCES, TRIAGE_LEVEL_RESOURCES, type HealthResource,
} from "@/lib/resources";
import type { TriageAPIResponse } from "@/app/api/triage/route";
import { cn } from "@/lib/utils";

// ─── Validation ───────────────────────────────────────────────────────────────

const formSchema = z.object({
  symptoms: z.string().min(5, "Please describe your symptoms in at least 5 characters"),
  severity: z.number().min(1).max(10),
  systolic: z.number().min(50).max(300).optional().or(z.literal(undefined)),
  diastolic: z.number().min(30).max(200).optional().or(z.literal(undefined)),
  temperature: z.number().min(90).max(110).optional().or(z.literal(undefined)),
  duration: z.string().min(1, "Please select a duration"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const DURATIONS = [
  "Less than 24 hours",
  "1–3 days",
  "3–7 days",
  "More than a week",
];

const STEP_LABELS = ["Symptoms", "Vitals", "Duration", "Review", "Result"];

// ─── Voice hook ───────────────────────────────────────────────────────────────

function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any | null>(null);

  const start = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const recog = new SR();
    recog.lang = "en-IN";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e: any) => {
      onResult(e.results[0][0].transcript);
      setListening(false);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    recog.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: HealthResource }) {
  const typeColor: Record<HealthResource["type"], string> = {
    PHC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    CHC: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    "District Hospital": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "Private Clinic": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    Emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="border border-border rounded-2xl p-4 bg-card/60 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{resource.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="size-3" aria-hidden /> {resource.address}
          </p>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", typeColor[resource.type])}>
          {resource.type}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3" aria-hidden /> {resource.distance}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" aria-hidden />
          {resource.open24h ? "Open 24h" : "Daytime hours"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {resource.services.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
      </div>
      <Button
        asChild
        className="w-full h-11 rounded-xl"
        variant={resource.type === "Emergency" ? "destructive" : "default"}
        size="sm"
      >
        <a href={`tel:${resource.phone}`} aria-label={`Call ${resource.name}`}>
          <Phone className="size-4 mr-2" aria-hidden /> Call {resource.phone}
        </a>
      </Button>
    </div>
  );
}

export { useSpeechRecognition, ResourceCard, DURATIONS, STEP_LABELS, formSchema, type FormData };
