"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Activity } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Health Reports</h2>
          <p className="text-on-surface-variant mt-2">View and download your health summaries.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Weekly Report</CardTitle>
            <CardDescription>July 15 - July 21, 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-6">Summary of your vitals, medications taken, and daily step count for the past week.</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Monthly Report</CardTitle>
            <CardDescription>June 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-6">Comprehensive review of your health trends, AI assessments, and goals for the month.</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-primary/50 bg-accent/20">
          <CardHeader className="pb-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <CardTitle>Doctor Summary</CardTitle>
            <CardDescription>Generated today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant mb-6">A structured summary designed specifically for your next doctor&apos;s appointment.</p>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download for Doctor
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Monthly Report - May 2026", date: "June 1, 2026" },
              { name: "Monthly Report - April 2026", date: "May 1, 2026" },
              { name: "Cardiology Visit Summary", date: "April 15, 2026" },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-on-surface-variant" />
                  <div>
                    <h4 className="font-medium text-on-surface">{report.name}</h4>
                    <p className="text-sm text-on-surface-variant">{report.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
