"use client";

import { TriageForm } from "@/components/triage/TriageForm";
import { Stethoscope } from "lucide-react";

export default function TriagePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Stethoscope className="size-5 text-primary" aria-hidden />
          <p className="eyebrow">AI-powered</p>
        </div>
        <h1 className="section-title">Symptom Triage</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Describe your symptoms and get an instant AI-powered triage recommendation.
          Takes under 2 minutes.
        </p>
      </div>
      <TriageForm />
    </div>
  );
}
