"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { medications as initialMeds } from "@/mock/data";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function MedicationCard() {
  const [meds, setMeds] = useState(initialMeds);

  const toggleMed = (id: string) => {
    setMeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
  };

  const takenCount = meds.filter((m) => m.taken).length;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Medication Reminders</CardTitle>
        <span className="text-sm font-medium text-muted-foreground">
          {takenCount}/{meds.length} taken
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meds.map((med) => (
            <button
              key={med.id}
              aria-label={`Mark ${med.name} as ${med.taken ? "not taken" : "taken"}`}
              onClick={() => toggleMed(med.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 border rounded-lg transition-colors text-left",
                med.taken
                  ? "bg-primary/5 border-primary/20"
                  : "hover:bg-accent/50"
              )}
            >
              <div className="flex items-center gap-3">
                {med.taken ? (
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className={cn("font-medium text-sm", med.taken && "line-through text-muted-foreground")}>
                    {med.name} {med.dosage}
                  </p>
                  <p className="text-xs text-muted-foreground">{med.time}</p>
                </div>
              </div>
              {med.taken && (
                <span className="text-xs font-semibold text-primary">✓ Done</span>
              )}
            </button>
          ))}
        </div>
        <Link href="/logs">
          <Button className="w-full mt-4" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Medication
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
