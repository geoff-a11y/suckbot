import jsPDF from "jspdf";
import "jspdf-autotable";
import { SessionData } from "./types";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generatePDF(session: SessionData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Color palette
  const colors = {
    primary: [124, 58, 237] as [number, number, number],
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
    doc.setFont("helvetica", "bold");
    setColor(colors.white);
    doc.text(text.toUpperCase(), margin, yPos + 5);
    yPos += 20;
  };

  const addSubheading = (text: string) => {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    setColor(colors.dark);
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  const addParagraph = (text: string, indent: number = 0) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    setColor(colors.muted);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 5 + 6;
  };

  const addNarrativeParagraph = (text: string) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
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
    doc.setFont("helvetica", "italic");
    setColor(colors.dark);
    doc.text(lines, margin + 10, yPos + 6);
    yPos += boxHeight + 8;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
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
  // Create a short problem summary for the subtitle (first 60 chars)
  const problemSummary = session.selectedCandidate
    ? session.selectedCandidate.length > 60
      ? session.selectedCandidate.substring(0, 57) + "..."
      : session.selectedCandidate
    : "Process Transformation";

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  setColor(colors.white);
  doc.text("HUMAN-AI WORKFLOW", margin, 18);
  doc.text("BLUEPRINT", margin, 30);

  // Problem-specific subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitleLines = doc.splitTextToSize(`For: ${problemSummary}`, contentWidth - 70);
  doc.text(subtitleLines, margin, 40);

  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin - 25, 48);

  yPos = 70;

  // === EXECUTIVE SUMMARY ===
  addSectionTitle("Executive Summary");

  const problemShort = session.selectedCandidate || "A broken process";

  addNarrativeParagraph(
    `This report examines a critical organizational challenge: ${problemShort.toLowerCase()}.`
  );

  addNarrativeParagraph(
    "Through systematic analysis, we've identified why this problem persists despite widespread agreement that it needs to change, and we've designed a human-AI collaboration model to solve it."
  );

  // Key findings box
  addSubheading("Key Findings");
  const findings = [
    "The problem has universal consensus — everyone agrees it needs to change",
    "Previous fix attempts addressed symptoms, not root causes",
    "The process was designed for constraints that no longer exist",
    "A human-AI collaboration model can transform this workflow",
  ];
  findings.forEach((f) => addBullet(f));
  yPos += 5;

  // Recommendation preview
  if (session.desuck?.workflow && session.desuck.workflow.length > 0) {
    addSubheading("Recommended Approach");
    addParagraph(
      `We recommend a ${session.desuck.workflow.length}-part collaboration model where AI handles routine execution while humans retain strategic control and final accountability. Implementation begins with a focused pilot before scaling organization-wide.`
    );
  }

  checkPageBreak(60);

  // === THE PROBLEM ===
  addSectionTitle("The Problem");

  addNarrativeParagraph(
    "Before designing solutions, we need to be precise about what we're solving. This section establishes the target for transformation."
  );

  // Problem statement box
  if (session.selectedCandidate) {
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    const problemLines = doc.splitTextToSize(`"${session.selectedCandidate}"`, contentWidth - 20);
    const problemBoxHeight = problemLines.length * 7 + 20;
    doc.rect(margin, yPos, contentWidth, problemBoxHeight, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    setColor(colors.dark);
    doc.text(problemLines, margin + 10, yPos + 12);
    yPos += problemBoxHeight + 10;
  }

  // Validation
  addSubheading("Why This Problem Matters");

  const audit = session.audit || {};
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
      doc.setFont("helvetica", "bold");
      setColor(colors.dark);
      doc.text(title + ":", margin + 5, yPos);
      doc.setFont("helvetica", "normal");
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

  addNarrativeParagraph(
    "Understanding what sucks is only the beginning. To fix it sustainably, we need to understand why it persists — what keeps a clearly broken process in place despite everyone agreeing it's broken."
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autopsy = session.autopsy as any || {};

  // Check if using new 3-layer format or legacy 6-layer format
  const isNewFormat = autopsy.originsConstraints || autopsy.assumptionsWorkarounds || autopsy.stakesOutcomes;
  const hasContent = isNewFormat || autopsy.origin || autopsy.constraints || autopsy.assumptions;

  // Synthesis paragraph - the key insight
  if (hasContent) {
    addEmphasisBox(
      "The analysis reveals a consistent pattern: this process was designed for a different era. The original constraints have changed, but the assumptions and workflows haven't caught up. Meanwhile, workarounds have created new dependencies that resist change."
    );
  }

  if (isNewFormat) {
    // New 3-layer format
    if (autopsy.originsConstraints) {
      addSubheading("Origins & Constraints");
      addParagraph(autopsy.originsConstraints);
    }

    checkPageBreak(40);

    if (autopsy.assumptionsWorkarounds) {
      addSubheading("Assumptions & Workarounds");
      addParagraph(autopsy.assumptionsWorkarounds);
    }

    checkPageBreak(40);

    if (autopsy.stakesOutcomes) {
      addSubheading("Stakes & Outcomes");
      addNarrativeParagraph(autopsy.stakesOutcomes);
    }
  } else {
    // Legacy 6-layer format (backward compatibility)
    if (autopsy.origin) {
      addSubheading("How It Started");
      addParagraph(autopsy.origin);
    }

    checkPageBreak(40);

    if (autopsy.constraints) {
      addSubheading("Constraints That No Longer Apply");
      addParagraph(autopsy.constraints);
    }

    checkPageBreak(40);

    if (autopsy.assumptions) {
      addSubheading("Unquestioned Assumptions");
      addParagraph(autopsy.assumptions);
    }

    checkPageBreak(40);

    if (autopsy.workarounds) {
      addSubheading("The Shadow Process");
      addParagraph(autopsy.workarounds);
    }

    checkPageBreak(40);

    if (autopsy.stakeholders) {
      addSubheading("Hidden Dynamics");
      addParagraph(autopsy.stakeholders);
    }

    checkPageBreak(40);

    if (autopsy.outcomes) {
      addSubheading("What You Actually Need");
      addNarrativeParagraph(autopsy.outcomes);
    }
  }

  checkPageBreak(80);

  // === THE SOLUTION ===
  addSectionTitle("The Solution");

  addNarrativeParagraph(
    "Rather than automating the broken process, we've designed a new human-AI collaboration model focused on the outcomes that actually matter. This isn't about replacing humans — it's about letting each do what they do best."
  );

  const desuck = session.desuck || {};

  // Outcomes
  if (desuck.outcomes && desuck.outcomes.length > 0) {
    addSubheading("Target Outcomes");
    addParagraph(
      "The redesigned workflow focuses on delivering these specific outcomes:"
    );
    desuck.outcomes.forEach((outcome, i) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      setColor(colors.dark);
      doc.text(`${i + 1}. ${outcome}`, margin + 5, yPos);
      yPos += 7;
    });
    yPos += 8;
  }

  checkPageBreak(60);

  // Workflow design - single clean presentation
  if (desuck.workflow && desuck.workflow.length > 0) {
    addSubheading("Human-AI Collaboration Model");

    addParagraph(
      "For each outcome, we've determined the optimal collaboration mode based on what humans and AI each do best:"
    );

    yPos += 5;

    desuck.workflow.forEach((w, i) => {
      checkPageBreak(50);

      // Outcome header
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.rect(margin, yPos - 3, contentWidth, 10, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      setColor(colors.primary);
      doc.text(`${i + 1}. ${w.outcome}`, margin + 5, yPos + 4);

      // Mode badge
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      setColor(colors.dark);
      const modeText = w.mode.charAt(0).toUpperCase() + w.mode.slice(1) + " Mode";
      doc.text(modeText, pageWidth - margin - 30, yPos + 4);

      yPos += 14;

      // Two-column layout for AI/Human
      const colWidth = (contentWidth - 10) / 2;

      // AI column
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      setColor(colors.primary);
      doc.text("AI handles:", margin, yPos);
      doc.setFont("helvetica", "normal");
      setColor(colors.muted);
      const aiLines = doc.splitTextToSize(w.aiDoes || "", colWidth - 5);
      doc.text(aiLines, margin, yPos + 5);

      // Human column
      doc.setFont("helvetica", "bold");
      setColor(colors.primary);
      doc.text("Human handles:", margin + colWidth + 10, yPos);
      doc.setFont("helvetica", "normal");
      setColor(colors.muted);
      const humanLines = doc.splitTextToSize(w.humanDoes || "", colWidth - 5);
      doc.text(humanLines, margin + colWidth + 10, yPos + 5);

      const maxLines = Math.max(aiLines.length, humanLines.length);
      yPos += maxLines * 4 + 10;

      // Reasoning
      if (w.reasoning) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
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

  addNarrativeParagraph(
    "A good design is worthless without a clear path to implementation. This section outlines how to move from blueprint to reality."
  );

  // Learning system
  if (desuck.learning) {
    addSubheading("Continuous Improvement");
    addParagraph(desuck.learning);
  }

  checkPageBreak(40);

  // Transition
  if (desuck.transition) {
    if (desuck.transition.humanElement) {
      addSubheading("Change Management");
      addParagraph(desuck.transition.humanElement);
    }

    checkPageBreak(40);

    if (desuck.transition.pilotPlan) {
      addSubheading("Pilot Strategy");
      addParagraph(desuck.transition.pilotPlan);
    }
  }

  checkPageBreak(80);

  // Implementation roadmap
  addSubheading("Implementation Roadmap");

  // This week
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setColor(colors.dark);
  doc.text("This Week", margin, yPos);
  yPos += 6;

  const week1 = [
    "Share this blueprint with key stakeholders",
    "Identify the first outcome to pilot (lowest risk, clearest win)",
    "Document current process baseline for comparison",
  ];
  week1.forEach((item, i) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    setColor(colors.muted);
    doc.text(`${i + 1}. ${item}`, margin + 5, yPos);
    yPos += 6;
  });

  yPos += 6;
  checkPageBreak(40);

  // First 30 days
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setColor(colors.dark);
  doc.text("First 30 Days", margin, yPos);
  yPos += 6;

  const month1 = [
    "Run pilot with a small team or specific use case",
    "Track time saved, quality changes, and team feedback",
    "Document AI corrections — these improve future results",
    "Adjust collaboration modes based on what you learn",
  ];
  month1.forEach((item, i) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    setColor(colors.muted);
    doc.text(`${i + 1}. ${item}`, margin + 5, yPos);
    yPos += 6;
  });

  yPos += 8;
  checkPageBreak(50);

  // Success metrics
  addSubheading("Success Indicators");
  const metrics = [
    "Time: Process takes measurably less time than before",
    "Quality: Output meets or exceeds previous standards",
    "Consistency: Results are predictable across different people",
    "Satisfaction: People involved prefer the new way of working",
  ];
  metrics.forEach((m) => addBullet(m));

  checkPageBreak(60);

  // === CONCLUSION ===
  addSectionTitle("Conclusion");

  addNarrativeParagraph(
    "This blueprint represents a shift from fighting a broken process to designing a better one. The problem wasn't lack of effort or discipline — it was a workflow designed for constraints that no longer exist."
  );

  addNarrativeParagraph(
    "By pairing human judgment with AI capability in the right configuration, you can achieve better outcomes with less friction. The path forward starts with a focused pilot, learns from real usage, and scales based on evidence."
  );

  // CTA box
  checkPageBreak(60);
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(margin, yPos, contentWidth, 50, "F");

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  setColor(colors.dark);
  doc.text("Ready to implement?", margin + 10, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(colors.muted);
  doc.text(
    "This blueprint is your starting point. For hands-on help with implementation,",
    margin + 10,
    yPos
  );
  yPos += 5;
  doc.text("workflow design, or custom AI solutions:", margin + 10, yPos);

  yPos += 10;
  doc.setFont("helvetica", "bold");
  setColor(colors.primary);
  doc.text("Book a call: calendly.com/geoff-human-machines/30min", margin + 10, yPos);
  yPos += 6;
  setColor(colors.dark);
  doc.text("Email: hello@human-machines.com", margin + 10, yPos);

  // === FOOTER ON ALL PAGES ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
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
