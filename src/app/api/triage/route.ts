import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const systemPrompt = `You are an AI medical triage assistant. Analyze the following patient data and symptoms.
Respond ONLY with a raw JSON object (no markdown, no backticks) with the following exact structure:
{
  "level": "Critical" | "Warning" | "Mild",
  "color": "red" | "yellow" | "green",
  "title": "Short title of recommendation (e.g. 'See a Doctor Soon')",
  "description": "A 2-3 sentence explanation of the assessment.",
  "actions": ["Action 1", "Action 2", "Action 3"]
}

Patient Data:
${JSON.stringify(data, null, 2)}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "inclusionai/ling-3.0-flash:free",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        // Adding response_format to ensure JSON if supported, otherwise prompt handles it
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const aiData = await response.json();
    let aiMessage = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown formatting if the model accidentally included it
    aiMessage = aiMessage.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedOutcome = JSON.parse(aiMessage);

    return NextResponse.json(parsedOutcome);
  } catch (error) {
    console.error("Triage API Error:", error);
    return NextResponse.json(
      { error: "Failed to process triage assessment" },
      { status: 500 }
    );
  }
}
