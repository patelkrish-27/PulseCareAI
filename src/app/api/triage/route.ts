import { NextResponse } from "next/server";

export interface TriageAPIRequest {
  symptoms: string;
  severity: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  duration: string;
  patientAge?: number;
  patientCondition?: string;
  notes?: string;
}

export interface TriageAPIResponse {
  triage_level: "HOME_CARE" | "CONSULT_48H" | "IMMEDIATE_FACILITY";
  rationale: string;
  red_flags: string[];
  confidence_score: number;
  home_care_tips?: string[];
}

const SYSTEM_PROMPT = `You are a clinical triage AI assistant for semi-urban and rural India.
Your role is to assess patient-reported symptoms and recommend an appropriate care level.

RESPOND ONLY WITH A RAW JSON OBJECT — no markdown, no backticks, no explanation outside the JSON.

JSON structure (strict):
{
  "triage_level": "HOME_CARE" | "CONSULT_48H" | "IMMEDIATE_FACILITY",
  "rationale": "2-3 plain-language sentences explaining the assessment in simple terms",
  "red_flags": ["array of specific serious symptom strings detected, empty if none"],
  "confidence_score": number between 50 and 99,
  "home_care_tips": ["3-4 actionable tips if HOME_CARE, empty array otherwise"]
}

Triage level definitions:
- HOME_CARE: Mild symptoms that can be managed at home with rest and over-the-counter remedies
- CONSULT_48H: Symptoms that warrant a doctor visit within 48 hours but are not an emergency
- IMMEDIATE_FACILITY: Potentially life-threatening symptoms requiring immediate hospital care

Red flag symptoms that ALWAYS trigger IMMEDIATE_FACILITY:
- Chest pain or pressure
- Difficulty breathing or severe shortness of breath  
- Sudden severe headache ("worst headache of life")
- Loss of consciousness or near-fainting
- Sudden weakness or numbness in face/arm/leg
- Slurred speech or confusion
- Blood pressure above 180 systolic or 120 diastolic
- High fever (>103°F / >39.4°C) with stiff neck
- Severe abdominal pain
- Signs of stroke

Be conservative: when in doubt, recommend a higher triage level.
Use plain language understandable to a rural Indian patient.`;

export async function POST(req: Request) {
  try {
    const body: TriageAPIRequest = await req.json();

    if (!body.symptoms || body.symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Symptoms description is required" },
        { status: 400 }
      );
    }

    const userPrompt = `
Patient Information:
- Age: ${body.patientAge ?? "Not provided"}
- Pre-existing condition: ${body.patientCondition ?? "None"}
- Reported symptoms: ${body.symptoms}
- Severity rating (1-10): ${body.severity}/10
- Duration: ${body.duration}
${body.systolic && body.diastolic ? `- Blood Pressure: ${body.systolic}/${body.diastolic} mmHg` : ""}
${body.temperature ? `- Temperature: ${body.temperature}°F` : ""}
${body.notes ? `- Additional notes: ${body.notes}` : ""}

Assess and provide triage recommendation.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "inclusionai/ling-3.0-flash:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2, // Low temperature for consistent medical outputs
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content ?? "";

    // Strip any accidental markdown wrapping
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Extract JSON if buried in text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }

    const parsed: TriageAPIResponse = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!["HOME_CARE", "CONSULT_48H", "IMMEDIATE_FACILITY"].includes(parsed.triage_level)) {
      throw new Error("Invalid triage_level in AI response");
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Triage API Error:", error);
    // Return a safe fallback — never silently fail
    return NextResponse.json(
      {
        triage_level: "CONSULT_48H",
        rationale:
          "We were unable to complete the AI assessment right now. As a precaution, we recommend consulting a doctor within 48 hours if your symptoms persist or worsen.",
        red_flags: [],
        confidence_score: 50,
        home_care_tips: [],
        _fallback: true,
      } satisfies TriageAPIResponse & { _fallback: boolean },
      { status: 200 } // 200 so UI can handle gracefully
    );
  }
}
