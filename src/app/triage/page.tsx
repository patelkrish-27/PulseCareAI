"use client";

import { TriageForm } from "@/components/triage/TriageForm";

export default function TriagePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Health Triage</h2>
        <p className="text-on-surface-variant mt-2">Complete this assessment to help us understand your symptoms and provide guidance.</p>
      </div>
      
      <TriageForm />
    </div>
  );
}
