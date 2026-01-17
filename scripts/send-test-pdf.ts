import { generatePDF } from "../src/lib/generatePDF";

const sampleSession = {
  sessionId: "test-sample-123",
  startedAt: new Date().toISOString(),
  phase: "FINAL" as const,
  candidates: [
    {
      text: "Creating presentations from AI output",
      addedAt: new Date().toISOString(),
    },
  ],
  selectedCandidate:
    "Creating presentations from AI-generated content is a tedious copy-paste nightmare that wastes hours while producing mediocre results",
  evaluationMode: "deep" as const,
  audit: {
    consensusPassed: true,
    strategic: "critical" as const,
    measurable: "clear" as const,
    previousAttempts: "multiple" as const,
  },
  autopsy: {
    origin:
      "The process emerged when teams started using ChatGPT for content but had no good way to get it into slides. People began manually copying text and formatting it, which became the de facto workflow.",
    constraints:
      "Original constraint was that AI could only output text, not formatted slides. This is no longer true - AI can now generate structured content, work with templates, and even create visual layouts.",
    assumptions:
      "Everyone assumes presentations must be created in PowerPoint/Google Slides manually. The belief that good design requires human touch persists even for routine internal presentations.",
    workarounds:
      "Power users have created personal template libraries. Some teams use a shared doc where they dump AI output for others to format. One person became the unofficial slide person for their department.",
    stakeholders:
      "The marketing team controls brand templates and may resist automation that bypasses their review. The slide person role has become part of someone's identity and job security.",
    outcomes:
      "The real goal is brilliant, thoughtful presentations that are tailored to each audience, visually compelling, on-brand, and look like human thought went into their design.",
  },
  desuck: {
    outcomes: [
      "Strategic thinking - understanding purpose, audience, and key messages",
      "Content intelligence - generating ideas and information that matter",
      "Customization - adapting for specific context and audience",
      "Design polish - making it look professional and visually effective",
      "Quality assurance - ensuring final result meets standards",
    ],
    workflow: [
      {
        outcome: "Strategic thinking",
        mode: "consulting" as const,
        confidence: "high" as const,
        aiDoes:
          "Suggests audience analysis frameworks, proposes key message options, identifies potential objections",
        humanDoes:
          "Makes final decisions on strategy, applies organizational context AI does not have",
        reasoning:
          "Strategy requires human judgment about politics, relationships, and unstated goals",
      },
      {
        outcome: "Content generation",
        mode: "supervising" as const,
        confidence: "high" as const,
        aiDoes:
          "Drafts all content sections, creates multiple options, handles research and data gathering",
        humanDoes:
          "Reviews for accuracy, adds proprietary insights, catches hallucinations",
        reasoning:
          "AI excels at volume and variety; humans catch errors and add unique value",
      },
      {
        outcome: "Design and formatting",
        mode: "delegating" as const,
        confidence: "medium" as const,
        aiDoes:
          "Applies templates, handles all formatting, creates consistent visual hierarchy",
        humanDoes: "Sets brand parameters upfront, reviews final output",
        reasoning:
          "Formatting is mechanical and AI can match templates precisely",
      },
      {
        outcome: "Quality assurance",
        mode: "approving" as const,
        confidence: "high" as const,
        aiDoes:
          "Runs consistency checks, flags potential issues, compares against standards",
        humanDoes: "Final review and sign-off on every presentation",
        reasoning: "Human accountability required for external-facing content",
      },
    ],
    learning:
      "Track presentation effectiveness through audience feedback, measure time saved vs old process, and feed human corrections back to improve AI recommendations over time.",
    transition: {
      humanElement:
        "Start with the internal presentations team who already feels the pain most acutely. Get buy-in from marketing on template integration before scaling.",
      pilotPlan:
        "Pilot with internal team meetings for 2 weeks, then expand to client-facing decks with extra review layer.",
    },
  },
};

async function sendTestPdf() {
  console.log("Generating PDF...");
  const pdfBase64 = generatePDF(sampleSession);
  console.log("PDF generated, length:", pdfBase64.length);

  console.log("Sending to API...");
  const formData = new FormData();
  formData.append("email", "geoff@human-machines.com");
  formData.append("pdf", pdfBase64);

  const response = await fetch("http://localhost:3000/api/send-report", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log("API response:", result);
}

sendTestPdf().catch(console.error);
