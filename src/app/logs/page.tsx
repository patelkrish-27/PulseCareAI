"use client";

import { HealthLogForm } from "@/components/health-log/HealthLogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivities } from "@/mock/data";

export default function LogsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Health Logs</h2>
        <p className="text-on-surface-variant mt-2">Track your daily vitals, medications, and activities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthLogForm />
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.filter(a => a.type === 'log').map((activity) => (
                  <div key={activity.id} className="flex flex-col pb-4 border-b last:border-0 last:pb-0">
                    <p className="font-medium text-on-surface text-sm">{activity.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-on-surface-variant">{activity.time}</p>
                      <p className="text-sm font-semibold text-primary">{activity.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col pb-4 border-b last:border-0 last:pb-0">
                  <p className="font-medium text-on-surface text-sm">Weight Recorded</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-on-surface-variant">Yesterday</p>
                    <p className="text-sm font-semibold text-primary">72.5 kg</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
