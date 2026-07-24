"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Droplets, Scale, Pill, Moon, Dumbbell, CheckCircle2 } from "lucide-react";

export function HealthLogForm() {
  const [activeTab, setActiveTab] = useState("vitals");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Successfully logged!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6 h-auto p-1">
            <TabsTrigger value="vitals" className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Heart className="h-5 w-5" />
              <span className="text-xs">Vitals</span>
            </TabsTrigger>
            <TabsTrigger value="sugar" className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Droplets className="h-5 w-5" />
              <span className="text-xs">Sugar</span>
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Scale className="h-5 w-5" />
              <span className="text-xs">Weight</span>
            </TabsTrigger>
            <TabsTrigger value="meds" className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Pill className="h-5 w-5" />
              <span className="text-xs">Meds</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Moon className="h-5 w-5" />
              <span className="text-xs">Sleep</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex flex-col gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs">Activity</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSave} className="space-y-6">
            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic (mmHg)</Label>
                  <Input id="systolic" placeholder="120" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                  <Input id="diastolic" placeholder="80" required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input id="heartRate" placeholder="72" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sugar" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bloodSugar">Blood Sugar Level (mg/dL)</Label>
                <Input id="bloodSugar" placeholder="105" required />
              </div>
              <div className="space-y-2">
                <Label>Time of Test</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <input type="radio" id="fasting" name="sugarTime" className="accent-primary" defaultChecked />
                    <Label htmlFor="fasting" className="cursor-pointer">Fasting</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <input type="radio" id="postprandial" name="sugarTime" className="accent-primary" />
                    <Label htmlFor="postprandial" className="cursor-pointer">Post-Meal</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weight" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input id="weight" placeholder="72.5" required />
              </div>
            </TabsContent>

            <TabsContent value="meds" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medName">Medication Name</Label>
                <Input id="medName" placeholder="E.g., Lisinopril" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" placeholder="10mg" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time Taken</Label>
                  <Input id="time" type="time" required />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Slept</Label>
                  <Input id="hours" type="number" placeholder="7" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input id="minutes" type="number" placeholder="15" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sleep Quality</Label>
                <input type="range" className="w-full accent-primary" min="1" max="5" defaultValue="3" />
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Input id="activityType" placeholder="Walking, Cycling, etc." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" placeholder="30" required />
              </div>
            </TabsContent>

            {successMsg && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4" /> {successMsg}
              </div>
            )}

            <Button type="submit" className="w-full">Save Entry</Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
