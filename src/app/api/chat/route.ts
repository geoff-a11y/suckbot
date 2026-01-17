import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SUCKBOT_SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { SessionData, ClaudeResponse, Message, Phase } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Phases that require deeper reasoning - use Sonnet
const COMPLEX_PHASES: Phase[] = [
  "QUICK_COMPARE",
  "COMPARE_SUMMARY",
  "AUTOPSY_INTRO",
  "L1_ORIGIN",
  "L2_CONSTRAINTS",
  "L3_ASSUMPTIONS",
  "L4_WORKAROUNDS",
  "L5_STAKEHOLDERS",
  "L6_OUTCOMES",
  "AUTOPSY_REPORT",
  "DESUCK_INTRO",
  "M1_OUTCOMES",
  "M2_CAPABILITIES",
  "M3_WORKFLOW",
  "M4_LEARNING",
  "M5_TRANSITION",
  "DESUCK_SUMMARY",
  "FINAL_SUMMARY",
];

// Select model based on phase complexity
function getModelForPhase(phase: Phase): string {
  if (COMPLEX_PHASES.includes(phase)) {
    return "claude-sonnet-4-20250514"; // Complex reasoning
  }
  return "claude-3-5-haiku-20241022"; // Fast for simple phases
}

export async function POST(req: NextRequest) {
  try {
    const { messages, session }: { messages: Message[]; session: SessionData } =
      await req.json();

    // Build dynamic session context (small, changes each request)
    const sessionContext = `
---

## IMPORTANT: HANDLING CONVERSATION START

When you receive "[START_CONVERSATION]" as the first message, the frontend has already shown the Welcome and Privacy cards to the user. You should respond with the OPENING phase immediately - ask what sucks most in their ORGANIZATION. Frame it as organizational dysfunction that affects everyone, not personal complaints.

---

## CURRENT SESSION STATE

\`\`\`json
${JSON.stringify(session, null, 2)}
\`\`\`

Continue the conversation from phase: ${session.phase}
`;

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Use prompt caching: static system prompt is cached, dynamic context is not
    // Use intelligent model selection: Haiku for simple phases, Sonnet for complex reasoning
    const selectedModel = getModelForPhase(session.phase);
    console.log(`[Chat API] Phase: ${session.phase}, Model: ${selectedModel}`);
    const response = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SUCKBOT_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: sessionContext,
        },
      ],
      messages: anthropicMessages,
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response from Claude
    let parsed: ClaudeResponse;
    try {
      // Claude should return JSON, but might wrap it in markdown code blocks
      let jsonStr = textContent.text;

      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      parsed = JSON.parse(jsonStr.trim());
    } catch {
      // If Claude didn't return valid JSON, wrap the response
      parsed = {
        message: textContent.text,
        phase: session.phase,
        inputType: "freetext",
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
