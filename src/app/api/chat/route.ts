import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "inclusionai/ling-3.0-flash:free",
        messages: [
          {
            role: "system",
            content: "You are PulseCareAI, a helpful, empathetic medical assistant. Provide concise, informative answers. Always remind the user that you are an AI and they should consult a real doctor for medical advice.",
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request right now.";

    return NextResponse.json({
      role: "assistant",
      content: aiMessage,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
