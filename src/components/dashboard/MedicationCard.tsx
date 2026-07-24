import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { medications } from "@/mock/data";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MedicationCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Medication Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <button aria-label={`Mark ${med.name} as taken`} className={med.taken ? "text-primary" : "text-muted-foreground"}>
                  {med.taken ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>
                <div>
                  <p className="font-medium text-on-surface">{med.name} {med.dosage}</p>
                  <p className="text-sm text-on-surface-variant">{med.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline">View All Medications</Button>
      </CardContent>
    </Card>
  );
}
