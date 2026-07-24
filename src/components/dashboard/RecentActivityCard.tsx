import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivities } from "@/mock/data";
import { Activity, Pill, Calendar } from "lucide-react";

export function RecentActivityCard() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'log': return <Activity className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex gap-4 relative">
              <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-accent text-primary flex items-center justify-center">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 pb-4 border-b last:border-0 last:pb-0">
                <p className="font-medium text-on-surface text-sm">{activity.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-on-surface-variant">{activity.time}</p>
                  <p className="text-sm font-semibold text-primary">{activity.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
