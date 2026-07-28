"use client";
import * as React from "react";

import { HealthSummaryCard } from "@/components/dashboard/HealthSummaryCard";
import { MedicationCard } from "@/components/dashboard/MedicationCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Plus, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Welcome back, Robert</h2>
        <p className="text-on-surface-variant mt-2">Here is a summary of your health status today.</p>
      </div>

      <HealthSummaryCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <ShieldAlert className="h-8 w-8 mb-2 opacity-80" />
                <h3 className="font-semibold text-lg">Risk Status</h3>
                <p className="text-3xl font-bold">Low</p>
              </CardContent>
            </Card>
            <Card className="col-span-1 sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Link href="/triage" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Plus className="mr-2 h-5 w-5 text-primary" />
                    New Symptom
                  </Button>
                </Link>
                <Link href="/chat" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    Ask AI
                  </Button>
                </Link>
                <Link href="/logs" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <Activity className="mr-2 h-5 w-5 text-primary" />
                    Add Vitals
                  </Button>
                </Link>
                <Link href="/reports" className="w-full">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <MedicationCard />
        </div>
        
        <div className="lg:col-span-1 h-full">
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}

function Activity(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
