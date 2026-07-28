/**
 * db.ts — Dexie.js IndexedDB wrapper for PulseCareAI
 * All patient data is stored locally on-device. Zero data leaves this device.
 */

import Dexie, { type EntityTable } from "dexie";

// ─── Schema Types ────────────────────────────────────────────────────────────

export type Condition = "Type 2 Diabetes" | "Hypertension" | "Asthma" | "None";
export type Language = "en" | "hi";

export interface UserProfile {
  id: number; // Always 1 — single-user app
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  language: Language;
  condition: Condition;
  weight?: number; // kg
  height?: number; // cm
  createdAt: string; // ISO
}

export interface HealthLog {
  id?: number;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
  type: "vitals" | "sugar" | "weight" | "sleep" | "activity";
  // Vitals
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  // Blood sugar
  bloodSugar?: number;
  sugarTiming?: "fasting" | "post-meal" | "random";
  // Weight
  weight?: number;
  // Sleep
  sleepHours?: number;
  sleepQuality?: number; // 1-5
  // Activity
  activityType?: string;
  activityDuration?: number; // minutes
  // Steps
  steps?: number;
  // Temperature
  temperature?: number; // °F
  notes?: string;
}

export interface Medication {
  id?: number;
  name: string;
  dosage: string;
  time: string; // HH:MM
  frequency: "daily" | "twice-daily" | "weekly" | "as-needed";
  active: boolean;
  createdAt: string;
}

export interface MedicationLog {
  id?: number;
  medicationId: number;
  date: string; // YYYY-MM-DD
  taken: boolean;
  takenAt?: string; // ISO timestamp when actually taken
}

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "system";
  content: string;
  language: Language;
  createdAt: string; // ISO
}

export interface TriageEvent {
  id?: number;
  symptoms: string;
  severity: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  duration: string;
  triageLevel: "HOME_CARE" | "CONSULT_48H" | "IMMEDIATE_FACILITY";
  rationale: string;
  redFlags: string[];
  confidenceScore: number;
  createdAt: string; // ISO
}

// ─── Database Class ───────────────────────────────────────────────────────────

export class PulseCareDB extends Dexie {
  userProfile!: EntityTable<UserProfile, "id">;
  healthLogs!: EntityTable<HealthLog, "id">;
  medications!: EntityTable<Medication, "id">;
  medicationLogs!: EntityTable<MedicationLog, "id">;
  chatHistory!: EntityTable<ChatMessage, "id">;
  triageEvents!: EntityTable<TriageEvent, "id">;

  constructor() {
    super("PulseCareAI");

    this.version(1).stores({
      userProfile: "id",
      healthLogs: "++id, date, type, createdAt",
      medications: "++id, active, createdAt",
      medicationLogs: "++id, medicationId, date",
      chatHistory: "++id, role, createdAt",
      triageEvents: "++id, triageLevel, createdAt",
    });
  }
}

// Singleton instance — safe for SSR (checked before use)
let _db: PulseCareDB | null = null;

export function getDB(): PulseCareDB {
  if (typeof window === "undefined") {
    throw new Error("getDB() called on server — IndexedDB is client-only");
  }
  if (!_db) {
    _db = new PulseCareDB();
  }
  return _db;
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function isoNow(): string {
  return new Date().toISOString();
}

/** Returns YYYY-MM-DD for n days ago (n=0 → today) */
export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

/** Calculate adherence % for a medication over last N days */
export async function calcAdherence(
  medicationId: number,
  days = 7
): Promise<number> {
  const db = getDB();
  const dates = Array.from({ length: days }, (_, i) => daysAgoStr(i));
  const logs = await db.medicationLogs
    .where("medicationId")
    .equals(medicationId)
    .and((l) => dates.includes(l.date))
    .toArray();
  const takenCount = logs.filter((l) => l.taken).length;
  return Math.round((takenCount / days) * 100);
}

/** Calculate consecutive logging streak (days with at least 1 health log) */
export async function calcStreak(): Promise<number> {
  const db = getDB();
  let streak = 0;
  let i = 0;
  while (true) {
    const dateStr = daysAgoStr(i);
    const count = await db.healthLogs.where("date").equals(dateStr).count();
    if (count === 0) break;
    streak++;
    i++;
  }
  return streak;
}

/** Get average vitals for the last N days of logs */
export async function getVitalsAverage(days = 7) {
  const db = getDB();
  const dates = Array.from({ length: days }, (_, i) => daysAgoStr(i));
  const logs = await db.healthLogs
    .where("date")
    .anyOf(dates)
    .and((l) => l.type === "vitals")
    .toArray();

  if (logs.length === 0) return null;

  const systolics = logs.filter((l) => l.systolic).map((l) => l.systolic!);
  const diastolics = logs.filter((l) => l.diastolic).map((l) => l.diastolic!);
  const heartRates = logs.filter((l) => l.heartRate).map((l) => l.heartRate!);

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  return {
    avgSystolic: avg(systolics),
    avgDiastolic: avg(diastolics),
    avgHeartRate: avg(heartRates),
    count: logs.length,
  };
}

/** Get average blood sugar for last N days */
export async function getSugarAverage(days = 7) {
  const db = getDB();
  const dates = Array.from({ length: days }, (_, i) => daysAgoStr(i));
  const logs = await db.healthLogs
    .where("date")
    .anyOf(dates)
    .and((l) => l.type === "sugar")
    .toArray();

  if (logs.length === 0) return null;
  const values = logs.filter((l) => l.bloodSugar).map((l) => l.bloodSugar!);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { avg: Math.round(avg), count: values.length };
}

/** Detect negative BP trend in last 3 days (all systolic >= 140) */
export async function detectBPTrend(): Promise<"high" | "normal" | "insufficient_data"> {
  const db = getDB();
  const dates = [daysAgoStr(0), daysAgoStr(1), daysAgoStr(2)];
  const dailyReadings: number[] = [];

  for (const date of dates) {
    const logs = await db.healthLogs
      .where("date")
      .equals(date)
      .and((l) => l.type === "vitals" && l.systolic !== undefined)
      .toArray();
    if (logs.length > 0) {
      // Take latest reading of the day
      const latest = logs[logs.length - 1];
      dailyReadings.push(latest.systolic!);
    }
  }

  if (dailyReadings.length < 2) return "insufficient_data";
  const allHigh = dailyReadings.every((v) => v >= 140);
  return allHigh ? "high" : "normal";
}
