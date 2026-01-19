import jsPDF from "jspdf";
import "jspdf-autotable";
import { SessionData } from "./types";
import { LOGO_BASE64 } from "./logo";
import {
  YOUNG_SERIF_REGULAR,
  OPEN_SANS_REGULAR,
  OPEN_SANS_BOLD,
  OPEN_SANS_ITALIC,
} from "@/fonts/embedded";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generatePDF(session: SessionData): string {
  const doc = new jsPDF();

  // Register custom fonts
  doc.addFileToVFS("YoungSerif-Regular.ttf", YOUNG_SERIF_REGULAR);
  doc.addFont("YoungSerif-Regular.ttf", "YoungSerif", "normal");

  doc.addFileToVFS("OpenSans-Regular.ttf", OPEN_SANS_REGULAR);
  doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");

  doc.addFileToVFS("OpenSans-Bold.ttf", OPEN_SANS_BOLD);
  doc.addFont("OpenSans-Bold.ttf", "OpenSans", "bold");

  doc.addFileToVFS("OpenSans-Italic.ttf", OPEN_SANS_ITALIC);
  doc.addFont("OpenSans-Italic.ttf", "OpenSans", "italic");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Color palette - #7877df as primary
  const colors = {
    primary: [120, 119, 223] as [number, number, number], // #7877df
    dark: [26, 26, 46] as [number, number, number],
    muted: [107, 107, 128] as [number, number, number],
    light: [248, 247, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  // Helper functions
  const setColor = (color: [number, number, number]) => {
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const addSectionTitle = (text: string) => {
    checkPageBreak(30);
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, yPos - 5, pageWidth, 14, "F");
    doc.setFontSize(14);
    doc.setFont("YoungSerif", "normal");
    setColor(colors.white);
    doc.text(text.toUpperCase(), margin, yPos + 5);
    yPos += 20;
  };

  const addSubheading = (text: string) => {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("YoungSerif", "normal");
    setColor(colors.dark);
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  const addParagraph = (text: string, indent: number = 0) => {
    doc.setFontSize(10);
    doc.setFont("OpenSans", "normal");
    setColor(colors.muted);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 5 + 6;
  };

  const addNarrativeParagraph = (text: string) => {
    doc.setFontSize(11);
    doc.setFont("OpenSans", "normal");
    setColor(colors.dark);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5.5 + 8;
  };

  const addEmphasisBox = (text: string) => {
    checkPageBreak(30);
    const lines = doc.splitTextToSize(text, contentWidth - 20);
    const boxHeight = lines.length * 6 + 16;
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(margin, yPos - 4, contentWidth, boxHeight, "F");
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos - 4, margin, yPos - 4 + boxHeight);
    doc.setFontSize(11);
    doc.setFont("OpenSans", "italic");
    setColor(colors.dark);
    doc.text(lines, margin + 10, yPos + 6);
    yPos += boxHeight + 8;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont("OpenSans", "normal");
    setColor(colors.muted);
    const lines = doc.splitTextToSize(text, contentWidth - 15);
    doc.text("•", margin + 5, yPos);
    doc.text(lines, margin + 12, yPos);
    yPos += lines.length * 5 + 3;
  };

  const checkPageBreak = (neededSpace: number = 40) => {
    if (yPos > pageHeight - neededSpace) {
      doc.addPage();
      yPos = margin;
    }
  };

  // === HEADER ===
  // White background with logo
  if (LOGO_BASE64) {
    // Add logo at top left
    try {
      doc.addImage(LOGO_BASE64, "PNG", margin, 12, 50, 15);
    } catch (e) {
      // Fallback if logo fails to load
      console.warn("Could not add logo to PDF:", e);
    }
  }

  // Title on the right side of logo
  doc.setFontSize(20);
  doc.setFont("YoungSerif", "normal");
  setColor(colors.primary);
  doc.text("Human-AI Workflow Blueprint", margin + 55, 20);

  // Problem-specific subtitle
  const problemSummary = session.selectedCandidate
    ? session.selectedCandidate.length > 80
      ? session.selectedCandidate.substring(0, 77) + "..."
      : session.selectedCandidate
    : "Process Transformation";

  doc.setFontSize(11);
  doc.setFont("OpenSans", "normal");
  setColor(colors.dark);
  const subtitleLines = doc.splitTextToSize(problemSummary, contentWidth - 60);
  doc.text(subtitleLines, margin + 55, 28);

  // Date on the right
  doc.setFontSize(9);
  setColor(colors.muted);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, 20, { align: "right" });

  // Divider line
  doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.setLineWidth(1);
  doc.line(margin, 42, pageWidth - margin, 42);

  yPos = 52;

  // === EXECUTIVE SUMMARY ===
  addSectionTitle("Executive Summary");

  const problemShort = session.selectedCandidate || "A broken process";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autopsy = session.autopsy as any || {};
  const audit = session.audit || {};
  const desuck = session.desuck || {};

  // Use LLM-generated executive summary if available
  if (desuck.executiveSummary) {
    addNarrativeParagraph(desuck.executiveSummary);
  } else {
    // Fallback to dynamic summary construction
    addNarrativeParagraph(
      `This report examines a critical organizational challenge: ${problemShort.toLowerCase()}.`
    );

    // Build dynamic second paragraph from actual findings
    const originsSnippet = (autopsy.originsConstraints || autopsy.origin || "").split('.')[0];
    const hasPreviousAttempts = audit.previousAttempts === "multiple" || audit.previousAttempts === "one";

    let summaryParagraph = "";
    if (originsSnippet) {
      summaryParagraph = `Our analysis found that ${originsSnippet.toLowerCase()}. `;
    }
    if (hasPreviousAttempts) {
      summaryParagraph += "Previous attempts to fix this addressed symptoms rather than root causes. ";
    }
    if (desuck.workflow && desuck.workflow.length > 0) {
      summaryParagraph += `We've designed a ${desuck.workflow.length}-part human-AI collaboration model to transform this workflow.`;
    }

    if (summaryParagraph) {
      addNarrativeParagraph(summaryParagraph);
    }
  }

  // Key findings - derived from actual session data
  addSubheading("Key Findings");

  // Build dynamic findings from session data
  const findings: string[] = [];

  // Consensus finding
  if (audit.consensusPassed) {
    findings.push("Universal consensus confirmed — this isn't one person's complaint, it's a shared organizational pain point.");
  }

  // Origins finding - extract key insight from autopsy
  const originsData = autopsy.originsConstraints || autopsy.origin;
  if (originsData) {
    // Extract first sentence or meaningful chunk
    const originInsight = originsData.split('.')[0];
    findings.push(`Root cause identified: ${originInsight.toLowerCase()}.`);
  }

  // Previous attempts finding
  if (audit.previousAttempts === "multiple") {
    findings.push("Multiple previous fix attempts addressed symptoms rather than the underlying structural issues.");
  } else if (audit.previousAttempts === "one") {
    findings.push("A prior attempt to fix this didn't succeed — likely because root causes weren't addressed.");
  }

  // Stakes/outcomes finding
  const stakesData = autopsy.stakesOutcomes || autopsy.outcomes;
  if (stakesData) {
    const stakesInsight = stakesData.split('.').find((s: string) => s.toLowerCase().includes('goal') || s.toLowerCase().includes('real'));
    if (stakesInsight) {
      findings.push(stakesInsight.trim() + ".");
    }
  }

  // Workflow finding
  if (desuck.workflow && desuck.workflow.length > 0) {
    const modes = [...new Set(desuck.workflow.map(w => w.mode))];
    findings.push(`A ${desuck.workflow.length}-part human-AI collaboration model can transform this workflow using ${modes.join(", ")} modes.`);
  }

  // Only show findings section if we have actual findings
  if (findings.length === 0 && session.selectedCandidate) {
    findings.push(`"${session.selectedCandidate}" represents a systemic issue requiring structural change.`);
  }

  findings.forEach((f) => addBullet(f));
  yPos += 5;

  // Recommendation preview - derived from actual workflow
  if (desuck.workflow && desuck.workflow.length > 0) {
    addSubheading("Recommended Approach");

    // Get the primary outcomes
    const outcomesList = desuck.workflow.slice(0, 3).map(w => w.outcome.toLowerCase()).join(", ");

    // Get delegation summary
    const delegatedCount = desuck.workflow.filter(w => w.mode === "delegating").length;
    const supervisedCount = desuck.workflow.filter(w => w.mode === "supervising").length;
    const humanLedCount = desuck.workflow.filter(w => w.mode === "consulting" || w.mode === "approving").length;

    let approachSummary = `We recommend a ${desuck.workflow.length}-part collaboration model focused on ${outcomesList}. `;

    if (delegatedCount > 0) {
      approachSummary += `AI fully handles ${delegatedCount} outcome${delegatedCount > 1 ? 's' : ''} within defined guardrails. `;
    }
    if (supervisedCount > 0) {
      approachSummary += `${supervisedCount} outcome${supervisedCount > 1 ? 's' : ''} run on AI with human oversight. `;
    }
    if (humanLedCount > 0) {
      approachSummary += `Humans lead ${humanLedCount} outcome${humanLedCount > 1 ? 's' : ''} with AI assistance. `;
    }

    if (desuck.transition?.pilotPlan) {
      const pilotSnippet = desuck.transition.pilotPlan.split('.')[0];
      approachSummary += pilotSnippet + ".";
    }

    addParagraph(approachSummary);
  }

  checkPageBreak(60);

  // === THE PROBLEM ===
  addSectionTitle("The Problem");

  // Problem statement box
  if (session.selectedCandidate) {
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    const problemLines = doc.splitTextToSize(`"${session.selectedCandidate}"`, contentWidth - 20);
    const problemBoxHeight = problemLines.length * 7 + 20;
    doc.rect(margin, yPos, contentWidth, problemBoxHeight, "F");
    doc.setFontSize(13);
    doc.setFont("OpenSans", "bold");
    setColor(colors.dark);
    doc.text(problemLines, margin + 10, yPos + 12);
    yPos += problemBoxHeight + 10;
  }

  // Validation
  addSubheading("Why This Problem Matters");

  const validationPoints = [];

  if (audit.consensusPassed) {
    validationPoints.push("Universal agreement: This isn't one person's complaint — it's a shared organizational pain point that everyone recognizes.");
  }
  if (audit.strategic) {
    validationPoints.push(`Strategic importance: This problem is ${audit.strategic} to the organization's core objectives and outcomes.`);
  }
  if (audit.measurable) {
    validationPoints.push(`Measurable impact: The dysfunction has ${audit.measurable} indicators that will show when improvement occurs.`);
  }
  if (audit.previousAttempts) {
    validationPoints.push(`Previous attempts: There have been ${audit.previousAttempts} efforts to fix this before — suggesting the root cause hasn't been addressed.`);
  }

  if (validationPoints.length > 0) {
    validationPoints.forEach((point) => {
      const [title, ...rest] = point.split(": ");
      doc.setFontSize(10);
      doc.setFont("OpenSans", "bold");
      setColor(colors.dark);
      doc.text(title + ":", margin + 5, yPos);
      doc.setFont("OpenSans", "normal");
      setColor(colors.muted);
      const restText = rest.join(": ");
      const lines = doc.splitTextToSize(restText, contentWidth - 15);
      doc.text(lines, margin + 5, yPos + 5);
      yPos += lines.length * 5 + 10;
    });
  }

  checkPageBreak(60);

  // === WHY IT PERSISTS ===
  addSectionTitle("Why It Persists");

  // Check if using new 3-layer format or legacy 6-layer format
  const isNewFormat = autopsy.originsConstraints || autopsy.assumptionsWorkarounds || autopsy.stakesOutcomes;

  if (isNewFormat) {
    // Write as flowing narrative, not rigid boxes
    if (autopsy.originsConstraints) {
      addNarrativeParagraph(autopsy.originsConstraints);
    }

    checkPageBreak(40);

    if (autopsy.assumptionsWorkarounds) {
      addNarrativeParagraph(autopsy.assumptionsWorkarounds);
    }

    checkPageBreak(40);

    if (autopsy.stakesOutcomes) {
      addNarrativeParagraph(autopsy.stakesOutcomes);
    }
  } else {
    // Legacy 6-layer format - also as narrative
    const narrativeParts: string[] = [];

    if (autopsy.origin) narrativeParts.push(autopsy.origin);
    if (autopsy.constraints) narrativeParts.push(autopsy.constraints);
    if (autopsy.assumptions) narrativeParts.push(autopsy.assumptions);
    if (autopsy.workarounds) narrativeParts.push(autopsy.workarounds);
    if (autopsy.stakeholders) narrativeParts.push(autopsy.stakeholders);
    if (autopsy.outcomes) narrativeParts.push(autopsy.outcomes);

    narrativeParts.forEach(part => {
      checkPageBreak(40);
      addNarrativeParagraph(part);
    });
  }

  checkPageBreak(80);

  // === THE SOLUTION ===
  addSectionTitle("The Solution");

  // Outcomes - show what we're actually solving for
  if (desuck.outcomes && desuck.outcomes.length > 0) {
    addSubheading("Target Outcomes");
    desuck.outcomes.forEach((outcome, i) => {
      doc.setFontSize(10);
      doc.setFont("OpenSans", "normal");
      setColor(colors.dark);
      doc.text(`${i + 1}. ${outcome}`, margin + 5, yPos);
      yPos += 7;
    });
    yPos += 8;
  }

  checkPageBreak(60);

  // Workflow design
  if (desuck.workflow && desuck.workflow.length > 0) {
    addSubheading("Human-AI Collaboration Model");

    yPos += 5;

    desuck.workflow.forEach((w, i) => {
      checkPageBreak(50);

      // Outcome header
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.rect(margin, yPos - 3, contentWidth, 10, "F");
      doc.setFontSize(11);
      doc.setFont("OpenSans", "bold");
      setColor(colors.primary);
      doc.text(`${i + 1}. ${w.outcome}`, margin + 5, yPos + 4);

      // Mode badge
      doc.setFontSize(9);
      doc.setFont("OpenSans", "bold");
      setColor(colors.dark);
      const modeText = w.mode.charAt(0).toUpperCase() + w.mode.slice(1) + " Mode";
      doc.text(modeText, pageWidth - margin - 30, yPos + 4);

      yPos += 14;

      // Two-column layout for AI/Human
      const colWidth = (contentWidth - 10) / 2;

      // AI column
      doc.setFontSize(9);
      doc.setFont("OpenSans", "bold");
      setColor(colors.primary);
      doc.text("AI handles:", margin, yPos);
      doc.setFont("OpenSans", "normal");
      setColor(colors.muted);
      const aiLines = doc.splitTextToSize(w.aiDoes || "", colWidth - 5);
      doc.text(aiLines, margin, yPos + 5);

      // Human column
      doc.setFont("OpenSans", "bold");
      setColor(colors.primary);
      doc.text("Human handles:", margin + colWidth + 10, yPos);
      doc.setFont("OpenSans", "normal");
      setColor(colors.muted);
      const humanLines = doc.splitTextToSize(w.humanDoes || "", colWidth - 5);
      doc.text(humanLines, margin + colWidth + 10, yPos + 5);

      const maxLines = Math.max(aiLines.length, humanLines.length);
      yPos += maxLines * 4 + 10;

      // Reasoning
      if (w.reasoning) {
        doc.setFontSize(9);
        doc.setFont("OpenSans", "italic");
        setColor(colors.muted);
        const reasonLines = doc.splitTextToSize(`Why: ${w.reasoning}`, contentWidth - 10);
        doc.text(reasonLines, margin + 5, yPos);
        yPos += reasonLines.length * 4 + 8;
      }

      yPos += 5;
    });
  }

  checkPageBreak(80);

  // === MAKING IT HAPPEN ===
  addSectionTitle("Making It Happen");

  // Transition - use actual data from conversation
  if (desuck.transition) {
    if (desuck.transition.humanElement) {
      addSubheading("Change Management");
      addNarrativeParagraph(desuck.transition.humanElement);
    }

    checkPageBreak(40);

    if (desuck.transition.pilotPlan) {
      addSubheading("Pilot Strategy");
      addNarrativeParagraph(desuck.transition.pilotPlan);
    }
  }

  checkPageBreak(40);

  // Learning system
  if (desuck.learning) {
    addSubheading("Continuous Improvement");
    addNarrativeParagraph(desuck.learning);
  }

  checkPageBreak(50);

  // Success metrics - derived from actual measurability data
  addSubheading("How You'll Know It's Working");

  const successIndicators: string[] = [];

  // Build from audit.measurable
  if (audit.measurable === "clear") {
    successIndicators.push("You identified clear metrics during our conversation — track these weekly and compare against your baseline.");
  } else if (audit.measurable === "noticeable") {
    successIndicators.push("While metrics aren't perfectly defined, you'll notice improvements in speed, quality, and team satisfaction.");
  } else if (audit.measurable === "subjective") {
    successIndicators.push("Success here is more qualitative — gather regular feedback from people involved and watch for reduced friction.");
  }

  // Add workflow-specific indicators
  if (desuck.workflow && desuck.workflow.length > 0) {
    const delegatedTasks = desuck.workflow.filter(w => w.mode === "delegating");
    if (delegatedTasks.length > 0) {
      successIndicators.push(`For delegated tasks like "${delegatedTasks[0].outcome.toLowerCase()}", measure volume handled and exceptions flagged.`);
    }

    const approvedTasks = desuck.workflow.filter(w => w.mode === "approving");
    if (approvedTasks.length > 0) {
      successIndicators.push(`For approval workflows, track review time and approval rates.`);
    }
  }

  // Fallback only if no data
  if (successIndicators.length === 0) {
    successIndicators.push("Track time spent, output quality, and team feedback before and after implementation.");
  }

  successIndicators.forEach((m) => addBullet(m));

  checkPageBreak(60);

  // === CONCLUSION ===
  addSectionTitle("Next Steps");

  // Build conclusion from actual session data
  const conclusionParts: string[] = [];

  if (session.selectedCandidate) {
    conclusionParts.push(`You identified "${session.selectedCandidate.toLowerCase()}" as a critical organizational challenge.`);
  }

  if (autopsy.originsConstraints || autopsy.origin) {
    conclusionParts.push("We traced its origins and found it was designed for constraints that no longer apply.");
  }

  if (desuck.workflow && desuck.workflow.length > 0) {
    const modeBreakdown = desuck.workflow.reduce((acc, w) => {
      acc[w.mode] = (acc[w.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const modeDescriptions = Object.entries(modeBreakdown)
      .map(([mode, count]) => `${count} ${mode}`)
      .join(", ");

    conclusionParts.push(`The ${desuck.workflow.length}-part solution assigns ${modeDescriptions} collaboration modes to match each outcome with the right human-AI balance.`);
  }

  if (desuck.transition?.pilotPlan) {
    conclusionParts.push(`Start with the pilot approach outlined above, then scale based on what you learn.`);
  }

  conclusionParts.forEach(part => {
    addNarrativeParagraph(part);
    checkPageBreak(30);
  });

  // Share with team prompt
  checkPageBreak(45);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPos, contentWidth, 35, "F");
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin, yPos + 35);

  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("OpenSans", "bold");
  setColor(colors.dark);
  doc.text("Share this with your team", margin + 10, yPos);

  yPos += 7;
  doc.setFontSize(9);
  doc.setFont("OpenSans", "normal");
  setColor(colors.muted);
  const shareText = "This blueprint was designed for collective action. Share it with stakeholders who need to understand the problem and the path forward.";
  const shareLines = doc.splitTextToSize(shareText, contentWidth - 20);
  doc.text(shareLines, margin + 10, yPos);

  yPos += shareLines.length * 4 + 15;

  // CTA box with clickable links
  checkPageBreak(50);
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(margin, yPos, contentWidth, 40, "F");

  yPos += 12;
  doc.setFontSize(12);
  doc.setFont("OpenSans", "bold");
  setColor(colors.dark);
  doc.text("Ready to implement?", margin + 10, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("OpenSans", "normal");
  setColor(colors.primary);

  // Clickable link - Book a call
  doc.textWithLink("Book a 30-minute call", margin + 10, yPos, {
    url: "https://calendly.com/geoff-human-machines/30min"
  });
  doc.text("  |  ", margin + 55, yPos);
  // Clickable link - Email
  doc.textWithLink("Email us", margin + 65, yPos, {
    url: "mailto:hello@human-machines.com"
  });

  // === FOOTER ON ALL PAGES ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("OpenSans", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Human Machines | human-machines.com",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  }

  // Return as base64
  return doc.output("datauristring").split(",")[1];
}
