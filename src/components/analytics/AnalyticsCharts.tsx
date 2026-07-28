"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { weeklyReportData } from "@/mock/data";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, Droplets } from "lucide-react";

const pieData = [
  { name: 'Active', value: 45 },
  { name: 'Rest', value: 35 },
  { name: 'Sleep', value: 20 },
];
const COLORS = ['#066456', '#88d5c3', '#e6f4f1'];

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Blood Pressure Trends</CardTitle>
          <CardDescription>Systolic and Diastolic readings over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyReportData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#066456" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#88d5c3" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blood Sugar Levels</CardTitle>
          <CardDescription>Average fasting glucose readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyReportData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="step" dataKey="sugar" name="Glucose" stroke="#33675d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Distribution</CardTitle>
          <CardDescription>How you spent your time today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 font-medium">Weekly Goal: Steps</p>
              <h3 className="text-3xl font-bold mt-1">75% <span className="text-lg font-normal">completed</span></h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary text-secondary-foreground border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-secondary-foreground/80 font-medium">Hydration Goal</p>
              <h3 className="text-3xl font-bold mt-1">1.5 <span className="text-lg font-normal">/ 2 Liters</span></h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
