import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthSummary } from "@/mock/data";
import { Activity, Heart, Droplets, Footprints, Moon } from "lucide-react";

export function HealthSummaryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="flex flex-col p-4 bg-accent rounded-lg border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Activity className="h-5 w-5" />
            <span className="font-semibold text-sm">Blood Pressure</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{healthSummary.bloodPressure}</span>
        </div>
        <div className="flex flex-col p-4 bg-accent rounded-lg border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Heart className="h-5 w-5" />
            <span className="font-semibold text-sm">Heart Rate</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{healthSummary.heartRate} bpm</span>
        </div>
        <div className="flex flex-col p-4 bg-accent rounded-lg border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Droplets className="h-5 w-5" />
            <span className="font-semibold text-sm">Blood Sugar</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{healthSummary.bloodSugar} mg/dL</span>
        </div>
        <div className="flex flex-col p-4 bg-accent rounded-lg border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Footprints className="h-5 w-5" />
            <span className="font-semibold text-sm">Steps</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{healthSummary.steps}</span>
        </div>
        <div className="flex flex-col p-4 bg-accent rounded-lg border">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Moon className="h-5 w-5" />
            <span className="font-semibold text-sm">Sleep</span>
          </div>
          <span className="text-2xl font-bold text-on-surface">{healthSummary.sleep}</span>
        </div>
      </CardContent>
    </Card>
  );
}
