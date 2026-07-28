"use client";
import { HealthLogForm } from "@/components/health-log/HealthLogForm";
export default function LogsPage(){return <div className="mx-auto max-w-4xl"><p className="eyebrow">Daily record</p><h1 className="section-title mt-2">Health logs</h1><p className="mt-3 text-muted-foreground">Capture today’s details in a clear, focused record.</p><div className="mt-7"><HealthLogForm/></div></div>}
