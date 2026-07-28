import { NextResponse } from "next/server";

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    name?: string;
    age?: number;
    condition?: string;
    lastBP?: string;
    lastSugar?: number;
    language?: "en" | "hi";
  };
}

function buildSystemPrompt(ctx?: ChatRequest["context"]): string {
  const lang = ctx?.language === "hi" ? "Hindi (Devanagari script)" : "English";

  const patientInfo = ctx?.name
    ? `The patient's name is ${ctx.name}, age ${ctx.age ?? "unknown"}, managing ${ctx.condition ?? "general health"}.${
        ctx.lastBP ? ` Their last recorded blood pressure was ${ctx.lastBP} mmHg.` : ""
      }${ctx.lastSugar ? ` Their last blood sugar reading was ${ctx.lastSugar} mg/dL.` : ""}`
    : "No patient profile available.";

  return `You are PulseCare, an empathetic, knowledgeable AI health assistant designed for patients in semi-urban and rural India.

PATIENT CONTEXT:
${patientInfo}

INSTRUCTIONS:
1. ALWAYS respond in ${lang}. Do not switch languages unless the user does.
2. Keep responses concise and in plain language that a non-medical person can understand.
3. When a patient reports symptoms that could be serious (chest pain, difficulty breathing, high fever, severe headache, loss of consciousness), ALWAYS advise them to seek immediate medical help and call 108.
4. Never provide a definitive diagnosis. Offer guidance and recommend seeing a doctor when relevant.
5. Reference the patient's known condition and recent readings if relevant to their question.
6. Be warm, reassuring, and culturally sensitive.
7. End responses with a follow-up question or actionable next step when possible.

ALWAYS include a disclaimer when giving specific medical guidance: "Please consult your doctor to confirm this advice."`;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, context } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "inclusionai/ling-3.0-flash:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Send last 10 messages for context window efficiency
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ??
      (context?.language === "hi"
        ? "मुझे खेद है, मैं अभी आपकी मदद नहीं कर सका। कृपया पुनः प्रयास करें।"
        : "I'm sorry, I couldn't process that right now. Please try again.");

    return NextResponse.json({ role: "assistant", content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. If you have a medical emergency, please call 108 immediately.",
      },
      { status: 200 } // 200 so UI handles gracefully
    );
  }
}
