import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jsPDF from "jspdf";
import { SessionData } from "@/lib/types";
import {
  getYoungSerifRegular,
  getOpenSansRegular,
  getOpenSansBold,
  getOpenSansItalic,
} from "@/fonts";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  return new Resend(apiKey);
}

function generateNarrativePDF(session: Partial<SessionData>): Buffer {
  const doc = new jsPDF();

  // Register custom fonts
  const youngSerifBase64 = getYoungSerifRegular();
  doc.addFileToVFS("YoungSerif-Regular.ttf", youngSerifBase64);
  doc.addFont("YoungSerif-Regular.ttf", "YoungSerif", "normal");
  doc.addFont("YoungSerif-Regular.ttf", "YoungSerif", "bold"); // Use regular for bold too
  doc.addFont("YoungSerif-Regular.ttf", "YoungSerif", "italic"); // Use regular for italic too

  doc.addFileToVFS("OpenSans-Regular.ttf", getOpenSansRegular());
  doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");

  doc.addFileToVFS("OpenSans-Bold.ttf", getOpenSansBold());
  doc.addFont("OpenSans-Bold.ttf", "OpenSans", "bold");

  doc.addFileToVFS("OpenSans-Italic.ttf", getOpenSansItalic());
  doc.addFont("OpenSans-Italic.ttf", "OpenSans", "italic");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Color palette with #7877df as primary
  const colors = {
    primary: [120, 119, 223] as [number, number, number], // #7877df
    dark: [32, 32, 48] as [number, number, number],
    text: [55, 55, 75] as [number, number, number],
    muted: [120, 120, 140] as [number, number, number],
    light: [245, 245, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    accent: [100, 99, 200] as [number, number, number],
  };

  const setColor = (color: [number, number, number]) => {
    doc.setTextColor(color[0], color[1], color[2]);
  };

  // Smart page break that keeps content together
  const ensureSpace = (neededSpace: number): boolean => {
    if (yPos + neededSpace > pageHeight - 25) {
      doc.addPage();
      yPos = margin + 10;
      return true;
    }
    return false;
  };

  // Calculate text height before rendering
  const getTextHeight = (text: string, fontSize: number, width: number, lineHeight: number = 1.4): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, width);
    return lines.length * fontSize * 0.352778 * lineHeight;
  };

  // Section headers with elegant underline (dynamic width)
  const addSectionHeader = (text: string) => {
    ensureSpace(28);
    yPos += 6;
    doc.setFontSize(16);
    doc.setFont("YoungSerif", "bold");
    setColor(colors.primary);
    doc.text(text, margin, yPos);
    const textWidth = doc.getTextWidth(text);
    yPos += 3;
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, yPos, margin + Math.min(textWidth, 50), yPos);
    yPos += 6;
  };

  // Subheadings
  const addSubheading = (text: string) => {
    ensureSpace(20);
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont("YoungSerif", "bold");
    setColor(colors.dark);
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  // Body text (clean sans-serif)
  const addBody = (text: string, indent: number = 0) => {
    const textHeight = getTextHeight(text, 10, contentWidth - indent);
    ensureSpace(textHeight + 5);
    doc.setFontSize(10);
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 4.5 + 3;
  };

  // Narrative paragraph with normal spacing
  const addNarrative = (text: string) => {
    const textHeight = getTextHeight(text, 10, contentWidth);
    ensureSpace(textHeight + 4);
    doc.setFontSize(10);
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 4.5 + 4;
  };

  // Lead paragraph (slightly larger, opening text)
  const addLead = (text: string) => {
    const textHeight = getTextHeight(text, 11, contentWidth);
    ensureSpace(textHeight + 6);
    doc.setFontSize(11);
    doc.setFont("OpenSans", "normal");
    setColor(colors.dark);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 6;
  };

  // Callout box with left border
  const addCallout = (text: string) => {
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(text, contentWidth - 20);
    const lineHeight = 4;
    const textBlockHeight = lines.length * lineHeight;
    const paddingTop = 6;
    const paddingBottom = 6;
    const boxHeight = textBlockHeight + paddingTop + paddingBottom;
    ensureSpace(boxHeight + 3);

    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, "F");
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(2.5);
    doc.line(margin + 1, yPos + 2, margin + 1, yPos + boxHeight - 2);

    doc.setFont("OpenSans", "italic");
    setColor(colors.text);
    // Position text: paddingTop + baseline offset (approx 3mm for 9.5pt)
    doc.text(lines, margin + 12, yPos + paddingTop + 3, { lineHeightFactor: 1.3 });
    yPos += boxHeight + 4;
  };

  // Quote block for the suck statement
  const addQuoteBlock = (text: string) => {
    // Ensure text ends with a period
    const finalText = text.endsWith('.') ? text : text + '.';
    const textHeight = getTextHeight(finalText, 11, contentWidth - 24);
    const boxHeight = textHeight + 16;
    ensureSpace(boxHeight + 8);

    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, "F");

    // Quote mark
    doc.setFontSize(36);
    doc.setFont("YoungSerif", "bold");
    setColor(colors.primary);
    doc.text("\u201C", margin + 6, yPos + 12);

    doc.setFontSize(11);
    doc.setFont("YoungSerif", "italic");
    setColor(colors.dark);
    const lines = doc.splitTextToSize(finalText, contentWidth - 28);
    doc.text(lines, margin + 18, yPos + 10);
    yPos += boxHeight + 6;
  };

  // Bullet point
  const addBullet = (text: string, indent: number = 0) => {
    const textHeight = getTextHeight(text, 9.5, contentWidth - 12 - indent);
    ensureSpace(textHeight + 4);
    doc.setFontSize(9.5);
    doc.setFont("OpenSans", "normal");
    setColor(colors.primary);
    doc.text("\u2022", margin + indent + 2, yPos);
    setColor(colors.text);
    const lines = doc.splitTextToSize(text, contentWidth - 12 - indent);
    doc.text(lines, margin + indent + 8, yPos);
    yPos += lines.length * 4.2 + 3;
  };

  // Numbered item
  const addNumbered = (num: number, text: string) => {
    const textHeight = getTextHeight(text, 9.5, contentWidth - 14);
    ensureSpace(textHeight + 3);
    doc.setFontSize(9.5);
    doc.setFont("OpenSans", "bold");
    setColor(colors.primary);
    doc.text(`${num}.`, margin + 1, yPos);
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    const lines = doc.splitTextToSize(text, contentWidth - 14);
    doc.text(lines, margin + 10, yPos);
    yPos += lines.length * 4.2 + 2;
  };

  // Outcome card with number badge
  const addOutcomeCard = (num: number, text: string) => {
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(text, contentWidth - 24);
    const cardHeight = Math.max(lines.length * 4 + 12, 20);
    ensureSpace(cardHeight + 3);

    // Card background
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(230, 230, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 4, 4, "FD");

    // Number badge
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.circle(margin + 10, yPos + cardHeight / 2, 5, "F");
    doc.setFontSize(9);
    doc.setFont("OpenSans", "bold");
    setColor(colors.white);
    const numStr = String(num);
    doc.text(numStr, margin + 10 - doc.getTextWidth(numStr) / 2, yPos + cardHeight / 2 + 3);

    // Outcome text
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    doc.text(lines, margin + 20, yPos + (cardHeight - lines.length * 4) / 2 + 4);

    yPos += cardHeight + 3;
  };

  // Mode explanation card
  const addModeCard = (name: string, description: string, example: string) => {
    const descHeight = getTextHeight(description, 9, contentWidth - 16);
    const exHeight = getTextHeight(example, 8.5, contentWidth - 20);
    const cardHeight = descHeight + exHeight + 22;
    ensureSpace(cardHeight + 4);

    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(220, 220, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 2, 2, "FD");

    doc.setFontSize(10);
    doc.setFont("YoungSerif", "bold");
    setColor(colors.primary);
    doc.text(name, margin + 6, yPos + 8);

    doc.setFontSize(9);
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    const descLines = doc.splitTextToSize(description, contentWidth - 16);
    doc.text(descLines, margin + 6, yPos + 14);

    const exY = yPos + 14 + descLines.length * 4 + 2;
    doc.setFontSize(8.5);
    doc.setFont("OpenSans", "italic");
    setColor(colors.muted);
    const exLines = doc.splitTextToSize(`Example: ${example}`, contentWidth - 20);
    doc.text(exLines, margin + 8, exY);

    yPos += cardHeight + 4;
  };

  // Workflow card
  const addWorkflowCard = (num: number, title: string, mode: string, aiDoes: string, humanDoes: string, reasoning: string) => {
    const colWidth = (contentWidth - 16) / 2;
    const aiHeight = getTextHeight(aiDoes, 8.5, colWidth - 4);
    const humanHeight = getTextHeight(humanDoes, 8.5, colWidth - 4);
    const reasonHeight = getTextHeight(`Why: ${reasoning}`, 8, contentWidth - 14);
    const cardHeight = Math.max(aiHeight, humanHeight) + reasonHeight + 32;

    ensureSpace(cardHeight + 5);

    // Card background
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(220, 220, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 2, 2, "FD");

    // Header bar
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(margin + 0.5, yPos + 0.5, contentWidth - 1, 12, "F");

    doc.setFontSize(10);
    doc.setFont("YoungSerif", "bold");
    setColor(colors.dark);
    doc.text(`${num}. ${title}`, margin + 6, yPos + 8);

    doc.setFontSize(8);
    doc.setFont("OpenSans", "normal");
    setColor(colors.primary);
    const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1) + " Mode";
    doc.text(modeLabel, pageWidth - margin - doc.getTextWidth(modeLabel) - 6, yPos + 8);

    const colY = yPos + 18;

    // AI column
    doc.setFontSize(8);
    doc.setFont("OpenSans", "bold");
    setColor(colors.primary);
    doc.text("AI handles", margin + 6, colY);
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    doc.setFontSize(8.5);
    const aiLines = doc.splitTextToSize(aiDoes, colWidth - 4);
    doc.text(aiLines, margin + 6, colY + 5);

    // Human column
    doc.setFontSize(8);
    doc.setFont("OpenSans", "bold");
    setColor(colors.primary);
    doc.text("Human handles", margin + colWidth + 10, colY);
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    doc.setFontSize(8.5);
    const humanLines = doc.splitTextToSize(humanDoes, colWidth - 4);
    doc.text(humanLines, margin + colWidth + 10, colY + 5);

    const reasonY = colY + Math.max(aiLines.length, humanLines.length) * 3.8 + 8;
    doc.setFontSize(8);
    doc.setFont("OpenSans", "italic");
    setColor(colors.muted);
    const reasonLines = doc.splitTextToSize(`Why: ${reasoning}`, contentWidth - 14);
    doc.text(reasonLines, margin + 6, reasonY);

    yPos += cardHeight + 5;
  };

  // Stage card for implementation
  const addStageCard = (stageNum: number, title: string, duration: string, objectives: string[], activities: string[], outcomes: string[]) => {
    const maxItems = Math.max(objectives.length, activities.length, outcomes.length);
    const cardHeight = 32 + maxItems * 10;
    ensureSpace(cardHeight + 6);

    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 3, 3, "FD");

    // Stage number circle - properly centered
    const circleX = margin + 14;
    const circleY = yPos + 12;
    const circleR = 7;
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.circle(circleX, circleY, circleR, "F");
    doc.setFontSize(11);
    doc.setFont("OpenSans", "bold");
    setColor(colors.white);
    const numStr = String(stageNum);
    const numWidth = doc.getTextWidth(numStr);
    doc.text(numStr, circleX - numWidth / 2, circleY + 4);

    // Title and duration
    doc.setFontSize(12);
    doc.setFont("YoungSerif", "bold");
    setColor(colors.dark);
    doc.text(title, margin + 28, yPos + 15);

    doc.setFontSize(8);
    doc.setFont("OpenSans", "normal");
    setColor(colors.muted);
    doc.text(duration, pageWidth - margin - doc.getTextWidth(duration) - 8, yPos + 15);

    const colY = yPos + 24;
    const colWidth = (contentWidth - 16) / 3;
    const col1X = margin + 8;
    const col2X = margin + colWidth + 8;
    const col3X = margin + colWidth * 2 + 8;

    // Objectives column
    let objY = colY;
    doc.setFontSize(8);
    doc.setFont("OpenSans", "bold");
    setColor(colors.primary);
    doc.text("Objectives", col1X, objY);
    objY += 5;
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    doc.setFontSize(7.5);
    objectives.forEach(obj => {
      const objLines = doc.splitTextToSize(obj, colWidth - 12);
      doc.text("\u2022", col1X, objY);
      doc.text(objLines, col1X + 4, objY);
      objY += objLines.length * 3.5 + 2.5;
    });

    // Activities column
    let actY = colY;
    doc.setFontSize(8);
    doc.setFont("OpenSans", "bold");
    setColor(colors.primary);
    doc.text("Key Activities", col2X, actY);
    actY += 5;
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    doc.setFontSize(7.5);
    activities.forEach(act => {
      const actLines = doc.splitTextToSize(act, colWidth - 12);
      doc.text("\u2022", col2X, actY);
      doc.text(actLines, col2X + 4, actY);
      actY += actLines.length * 3.5 + 2.5;
    });

    // Outcomes column
    let outY = colY;
    doc.setFontSize(8);
    doc.setFont("OpenSans", "bold");
    setColor(colors.primary);
    doc.text("Success Criteria", col3X, outY);
    outY += 5;
    doc.setFont("OpenSans", "normal");
    setColor(colors.text);
    doc.setFontSize(7.5);
    outcomes.forEach(out => {
      const outLines = doc.splitTextToSize(out, colWidth - 12);
      doc.text("\u2022", col3X, outY);
      doc.text(outLines, col3X + 4, outY);
      outY += outLines.length * 3.5 + 2.5;
    });

    yPos += cardHeight + 4;
  };

  // Extract data
  const autopsy = session.autopsy || {};
  const audit = session.audit || {};
  const desuck = session.desuck || {};
  const workflow = desuck.workflow || [];
  const problemStatement = session.selectedCandidate || "A broken organizational process";

  // === COVER / HEADER ===
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFontSize(24);
  doc.setFont("YoungSerif", "bold");
  setColor(colors.white);
  doc.text("Human-AI Workflow Blueprint", margin, 28);

  doc.setFontSize(9);
  doc.setFont("OpenSans", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Human Machines  \u2022  ${dateStr}`, margin, 40);

  yPos = 68;

  // === EXECUTIVE SUMMARY ===
  addSectionHeader("Executive Summary");

  addLead(
    `This blueprint addresses a critical organizational challenge: ${problemStatement.toLowerCase()}. Through systematic analysis of how this problem originated, why it persists despite universal agreement that it needs to change, and what outcomes actually matter, we've designed a human-AI collaboration model that transforms frustration into competitive advantage.`
  );

  addNarrative(
    `The investigation reveals that ${autopsy.origin ? autopsy.origin.split('.')[0].toLowerCase() + '.' : 'the current process emerged from constraints that no longer exist.'} What began as a reasonable response to limitations has calcified into organizational friction. ${autopsy.constraints ? 'Critically, ' + autopsy.constraints.split('.')[0].toLowerCase() + ' — yet the workflow hasn\'t evolved to reflect this.' : ''}`
  );

  addNarrative(
    `${autopsy.workarounds ? 'People have developed workarounds: ' + autopsy.workarounds.split('.')[0].toLowerCase() + '.' : ''} These shadow processes signal both the pain of the current system and the ingenuity of the people working within it. The goal isn't to automate what's broken — it's to design something better.`
  );

  addSubheading("Key Findings");
  addBullet(`Universal consensus: ${audit.consensusPassed ? 'Everyone agrees this needs to change — this isn\'t one person\'s frustration' : 'Broad agreement exists that the current approach is suboptimal'}`);
  addBullet(`Strategic importance: This problem is ${audit.strategic || 'significant'} to core organizational objectives and how value gets delivered`);
  addBullet(`Root cause: ${autopsy.assumptions ? autopsy.assumptions.split('.')[0] : 'Embedded assumptions from an earlier era continue to constrain the workflow'}`);
  addBullet(`Previous attempts: ${audit.previousAttempts || 'Multiple'} fix efforts have addressed symptoms rather than the underlying cause`);
  yPos += 4;

  if (workflow.length > 0) {
    addSubheading("Recommended Approach");
    addNarrative(
      `We propose a ${workflow.length}-part human-AI collaboration model where each outcome is assigned an optimal collaboration mode. ${autopsy.outcomes ? 'The true goal — ' + autopsy.outcomes.split('.')[0].toLowerCase() + ' — ' : 'The actual outcomes that matter'} can be achieved through intelligent division of labor: AI handles volume, consistency, and tireless execution while humans provide judgment, relationships, and accountability.`
    );
  }

  // === THE PROBLEM ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("The Problem");

  addLead(
    "Before designing solutions, we need to be precise about what we're solving. Clear problem definition prevents the common failure mode of solving the wrong thing brilliantly. This section establishes the validated target for transformation."
  );

  addQuoteBlock(problemStatement);

  addNarrative(
    "This problem passed rigorous validation through what we call the Suck Audit — a systematic process for distinguishing genuine organizational dysfunction from personal grievances or symptoms of deeper issues. The audit confirmed three critical criteria."
  );

  addSubheading("Validation Criteria");

  addNarrative(
    `First, consensus: ${audit.consensusPassed ? 'ask ten different people in the organization and they\'ll all agree this needs to change. This isn\'t one person\'s complaint — it\'s a shared pain point that crosses team boundaries and affects multiple workflows.' : 'there is broad agreement that the current approach is problematic.'}`
  );

  addNarrative(
    `Second, strategic connection: this problem is ${audit.strategic || 'significant'} to the organization's core objectives. It's not just annoying — it directly impacts how value gets delivered to customers, how talent experiences their work, and how the organization competes.`
  );

  addNarrative(
    `Third, persistence despite effort: there have been ${audit.previousAttempts || 'multiple'} attempts to fix this. Each addressed symptoms rather than root causes, which is why the problem keeps returning. This persistence signals that the underlying dynamics haven't been understood or addressed.`
  );

  // === WHY IT PERSISTS ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("Why It Persists");

  addLead(
    "Understanding what's broken is only the beginning. To fix it sustainably, we need to understand why it persists — what keeps a clearly broken process in place despite everyone agreeing it's broken. This is the Suck Autopsy: a systematic excavation of the forces that maintain dysfunction."
  );

  addCallout(
    "The analysis reveals a consistent pattern: this process was designed for a different era. The original constraints have changed, but the assumptions and workflows haven't caught up. Meanwhile, workarounds have created new dependencies that resist change."
  );

  if (autopsy.origin) {
    addSubheading("Origin Story");
    addNarrative(
      `Every broken process started as a reasonable solution. ${autopsy.origin} Understanding this history isn't about assigning blame — it's about recognizing that the people who built this system were solving real problems with the tools and constraints they had.`
    );
  }

  if (autopsy.constraints) {
    addSubheading("Ghost Constraints");
    addNarrative(
      `${autopsy.constraints} These ghost constraints — limitations that shaped the original design but no longer exist — continue to haunt the workflow. The organization is optimizing for restrictions that have been lifted.`
    );
  }

  if (autopsy.assumptions) {
    addSubheading("Embedded Assumptions");
    addNarrative(
      `${autopsy.assumptions} These assumptions have become invisible — they feel like facts about reality rather than choices that could be revisited. Surfacing them is the first step toward questioning them.`
    );
  }

  if (autopsy.workarounds) {
    addSubheading("The Shadow Process");
    addNarrative(
      `${autopsy.workarounds} These workarounds represent both the pain of the current system and the ingenuity of the people navigating it. They also create new dependencies: people have built skills, relationships, and even identity around managing the dysfunction.`
    );
  }

  if (autopsy.stakeholders) {
    addSubheading("Hidden Dynamics");
    addNarrative(
      `${autopsy.stakeholders} This isn't about malice — it's organizational physics. When a dysfunction persists despite universal agreement that it should change, there are usually structural reasons. Understanding these dynamics is essential for navigating the change.`
    );
  }

  if (autopsy.outcomes) {
    addSubheading("True Outcomes");
    addCallout(autopsy.outcomes);
    addNarrative(
      "This reframing is crucial. The goal isn't to automate or optimize the current process — it's to achieve these outcomes through whatever means works best. This opens the design space for fundamentally different approaches."
    );
  }

  // === THE METHODOLOGY ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("The Human-AI Workflow Design Process");

  addLead(
    "The solution isn't to automate what's broken — it's to design a new workflow from first principles, starting with outcomes and working backward to the optimal human-AI collaboration for each. This section explains the methodology behind the recommendations."
  );

  addNarrative(
    "Traditional automation asks: 'What parts of this process can a machine do?' This approach often fails because it preserves the broken process structure while shifting work between humans and machines. Our approach is different: we start by identifying the outcomes that actually matter, then determine the optimal way to achieve each one."
  );

  addSubheading("The Design Process");
  addNumbered(1, "Outcome Decomposition: Break the workflow into discrete outcomes, independent of how they're currently achieved. What results actually matter?");
  addNumbered(2, "Capability Mapping: For each outcome, identify what capabilities are required. Which are human strengths (judgment, empathy, relationships) versus AI strengths (volume, consistency, tirelessness)?");
  addNumbered(3, "Mode Assignment: Choose the optimal collaboration mode for each outcome based on capability requirements, risk tolerance, and organizational readiness.");
  addNumbered(4, "Flywheel Design: Build in mechanisms for continuous improvement — how human corrections train better AI performance over time.");
  yPos += 8;

  addSubheading("The Four Human-AI Collaboration Modes");
  addNarrative(
    "Not all human-AI collaboration is the same. The optimal mode depends on the nature of the outcome, the risk of errors, and the organization's comfort level. We use four distinct modes, each representing a different balance of AI autonomy and human control."
  );

  addModeCard(
    "Delegating Mode",
    "AI owns the outcome end-to-end within defined parameters. Human sets guardrails upfront and reviews exceptions. Best for high-volume, well-defined tasks where consistency matters more than creativity.",
    "AI formats all presentation slides according to brand templates. Human defines templates once, reviews only flagged issues."
  );

  addModeCard(
    "Supervising Mode",
    "AI handles routine execution while human monitors and handles exceptions. Human stays informed but doesn't review every output. Best for tasks with clear success criteria but occasional edge cases.",
    "AI drafts all routine content. Human reviews weekly samples and handles any flagged exceptions."
  );

  addModeCard(
    "Consulting Mode",
    "Human leads the work, AI assists when asked. AI provides options, research, and recommendations but human drives decisions. Best for strategic work requiring judgment and context.",
    "Human develops presentation strategy. AI suggests frameworks, identifies objections, proposes messaging options."
  );

  addModeCard(
    "Approving Mode",
    "AI prepares everything, human reviews and approves each output before release. Maximum human control with AI doing preparation work. Best for high-stakes outputs requiring accountability.",
    "AI creates complete presentation draft. Human reviews every slide before any external sharing."
  );

  // === THE SOLUTION ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("The Recommended Workflow");

  addLead(
    `Based on the analysis above, we've designed a ${workflow.length}-part human-AI collaboration model. Each outcome is assigned the collaboration mode that best balances capability requirements, risk tolerance, and organizational readiness.`
  );

  if (desuck.outcomes && desuck.outcomes.length > 0) {
    addSubheading("Target Outcomes");
    addNarrative("The redesigned workflow focuses on delivering these specific outcomes — not process steps, but results that matter:");
    yPos += 4;
    desuck.outcomes.forEach((outcome, i) => {
      addOutcomeCard(i + 1, outcome);
    });
    yPos += 4;
  }

  if (workflow.length > 0) {
    addSubheading("Collaboration Model");
    addNarrative(
      "For each outcome, we've determined the optimal human-AI collaboration mode based on the capability requirements, error consequences, and organizational factors. The goal is maximum leverage — AI handling what it does best while humans focus on judgment, relationships, and accountability."
    );
    yPos += 4;

    workflow.forEach((w, i) => {
      addWorkflowCard(
        i + 1,
        w.outcome,
        w.mode,
        w.aiDoes || "",
        w.humanDoes || "",
        w.reasoning || ""
      );
    });
  }

  // === FUTURE EXPERIENCE ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("The Future Experience");

  addLead(
    "What does it actually feel like to work in the new system? This section brings the workflow to life — not as abstract process boxes, but as a day-in-the-life narrative of how work gets done."
  );

  // Generate contextual narrative based on the workflow
  const firstOutcome = workflow[0]?.outcome || "the first task";
  const lastOutcome = workflow[workflow.length - 1]?.outcome || "final review";

  addSubheading("A Day in the New Workflow");

  addNarrative(
    `Imagine starting your day with ${firstOutcome.toLowerCase()}. Instead of the old approach — ${autopsy.workarounds ? autopsy.workarounds.split('.')[0].toLowerCase() : 'manual, repetitive work that consumed hours'} — you now begin with AI-prepared options waiting in your queue. The system has already analyzed context, gathered relevant information, and generated multiple approaches for your consideration.`
  );

  addNarrative(
    `Your role shifts from doing to deciding. You review the AI's work with fresh eyes, applying the judgment and organizational context that only you possess. Where the AI has made assumptions, you correct them. Where it's missed nuance, you add it. These corrections aren't wasted effort — they're training data that makes tomorrow's AI output better.`
  );

  addNarrative(
    `As you move through the workflow, each stage has its appropriate level of AI involvement. ${workflow.find(w => w.mode === 'consulting') ? 'For strategic decisions, the AI serves as a thinking partner — surfacing options you might not have considered, identifying potential objections, suggesting frameworks. But you make the calls.' : ''} ${workflow.find(w => w.mode === 'delegating') ? 'For routine execution, the AI handles the volume work autonomously within your defined parameters, freeing you from mechanical tasks.' : ''}`
  );

  addNarrative(
    `By the time you reach ${lastOutcome.toLowerCase()}, you're reviewing polished work rather than creating it from scratch. The quality is higher because you've focused your attention where it matters most. The consistency is better because AI doesn't have off days. And you've accomplished in hours what used to take days.`
  );

  addSubheading("The Learning Flywheel");

  addNarrative(
    "The system gets smarter over time through a continuous learning flywheel. Every human correction becomes training data. Every exception you handle teaches the AI about edge cases. Every time you override a recommendation, the system learns your preferences."
  );

  addCallout(
    desuck.learning || "Track presentation effectiveness through audience feedback, measure time saved versus the old process, and feed human corrections back to improve AI recommendations over time."
  );

  addNarrative(
    "This flywheel has four components: First, signal tracking — measuring what's working through time savings, quality metrics, and user satisfaction. Second, human corrections — every edit, override, and adjustment you make becomes input for improvement. Third, AI learning — patterns emerge from corrections, recommendations sharpen, edge cases get handled. Fourth, calibration — regular review of collaboration modes to adjust as the system matures and trust develops."
  );

  addNarrative(
    "The result is a system that improves with use. Early skepticism gives way to trust as the AI demonstrates competence. Collaboration modes that start conservative (Approving) can evolve toward more autonomy (Supervising, eventually Delegating) as confidence builds. The goal is a dynamic partnership that adapts to demonstrated capability."
  );

  // === MVP SOLUTION ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("MVP Solution Definition");

  addLead(
    "A successful transformation starts with a focused minimum viable product — not the full vision, but the smallest implementation that delivers real value and generates learning. This section defines what that MVP looks like and the tooling to enable it."
  );

  addSubheading("MVP Scope");

  addNarrative(
    `The MVP focuses on the highest-leverage outcome: ${workflow[0]?.outcome || 'the first workflow stage'}. This choice is deliberate. ${workflow[0]?.reasoning || 'This outcome offers the best combination of impact and feasibility for initial implementation.'} By constraining scope, we can move quickly, learn from real usage, and build confidence before expanding.`
  );

  addNarrative(
    `The initial implementation uses ${workflow[0]?.mode || 'Approving'} mode — the most conservative collaboration approach. This means AI prepares outputs but humans review everything before release. This conservative start builds trust, surfaces edge cases, and generates the correction data needed for the learning flywheel. As confidence develops, the collaboration mode can evolve toward greater AI autonomy.`
  );

  addSubheading("Core Capabilities Required");
  addBullet("Content generation: AI system capable of producing draft outputs in the required format (text, structured data, or formatted documents)");
  addBullet("Context integration: Ability to incorporate organizational context, brand guidelines, historical examples, and user preferences");
  addBullet("Review interface: Human-friendly workflow for reviewing, editing, and approving AI outputs with tracked changes");
  addBullet("Feedback capture: System for capturing human corrections and feeding them back into AI improvement");
  addBullet("Quality metrics: Dashboard tracking time saved, revision rates, output quality, and user satisfaction");
  yPos += 4;

  addSubheading("Recommended Tooling Approach");

  addNarrative(
    "The MVP can be built on current frontier models (Claude, GPT-4o, Gemini) with lightweight orchestration. The key is not building custom AI — it's building the workflow and feedback infrastructure around capable AI. Three tooling tiers offer different tradeoffs:"
  );

  addBullet("Lightweight (fastest to deploy): Use existing AI tools (ChatGPT, Claude, Notion AI) with manual workflow management. Capture feedback in spreadsheets. Best for validating the concept before investing in infrastructure.", 5);
  addBullet("Integrated (balanced approach): Connect AI APIs to existing workflow tools via integration platforms (Zapier, Make, n8n). Build simple review queues and feedback forms. Provides automation without custom development.", 5);
  addBullet("Custom (maximum control): Build dedicated application with custom prompts, fine-tuned models, and integrated feedback loops. Requires development investment but offers full control over the experience.", 5);
  yPos += 4;

  addNarrative(
    "We recommend starting with the Lightweight tier to validate assumptions, then evolving to Integrated as usage patterns stabilize. Custom development should wait until the workflow is proven and scale demands justify the investment."
  );

  addSubheading("Success Metrics for MVP");
  addBullet("Time: 50%+ reduction in time spent on the target outcome within 30 days");
  addBullet("Quality: Output quality meets or exceeds previous standards (measured by stakeholder feedback)");
  addBullet("Adoption: 80%+ of target users actively using the new workflow by end of pilot");
  addBullet("Learning: At least 100 human corrections captured to train improvement");

  // === TRAINING AND ONBOARDING ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("Training and Onboarding");

  addLead(
    "Technology is the easy part. The harder challenge is helping people develop new mental models, skills, and habits for human-AI collaboration. This section outlines the training and onboarding approach."
  );

  addSubheading("Mindset Shifts Required");

  addNarrative(
    "Effective human-AI collaboration requires several mental model shifts. First, from doing to directing: your value shifts from executing tasks to guiding AI execution — setting parameters, reviewing outputs, handling exceptions. This is a fundamentally different skill than doing the work yourself."
  );

  addNarrative(
    "Second, from perfection to iteration: AI outputs won't be perfect initially. The goal isn't perfect first drafts — it's good-enough drafts that are faster to refine than to create from scratch. Expecting perfection leads to disappointment; expecting iteration leads to improvement."
  );

  addNarrative(
    "Third, from hoarding to teaching: every correction you make is an opportunity to improve the system. The instinct to 'just fix it myself' must evolve into 'fix it in a way that teaches the AI.' This requires making implicit knowledge explicit."
  );

  addSubheading("Training Components");

  addNumbered(1, "Conceptual foundation (2 hours): Understanding the four collaboration modes, the learning flywheel, and the 'why' behind the new workflow. Interactive discussion of concerns and expectations.");

  addNumbered(2, "Hands-on practice (4 hours): Working through real examples in a sandbox environment. Practicing prompt crafting, output review, and correction capture. Building muscle memory for the new workflow.");

  addNumbered(3, "Supervised production (1-2 weeks): Using the new workflow on real work with coaching support available. Daily check-ins to address issues and celebrate wins. Gradually reducing support as confidence builds.");

  addNumbered(4, "Peer learning (ongoing): Regular sessions for users to share tips, discuss edge cases, and learn from each other's corrections. Building internal expertise and community.");
  yPos += 6;

  addSubheading("Onboarding Sequence");

  addNarrative(
    `${desuck.transition?.humanElement || 'Start with the team that feels the current pain most acutely — they have the motivation to push through the learning curve and become internal champions.'} Early adopters should be chosen for enthusiasm and influence, not just capability. Their success stories become the foundation for broader rollout.`
  );

  addBullet("Week 1: Conceptual training and sandbox practice with the pilot team");
  addBullet("Weeks 2-3: Supervised production use with daily coaching support");
  addBullet("Week 4: Independent use with weekly check-ins; begin documenting lessons learned");
  addBullet("Weeks 5-6: Pilot team becomes trainers for second cohort; process refinement based on learnings");

  // === IMPLEMENTATION STAGES ===
  doc.addPage();
  yPos = margin + 10;
  addSectionHeader("Implementation Roadmap");

  addLead(
    "Transformation happens in stages, not all at once. This roadmap replaces calendar-based timelines with milestone-based stages — you advance when you've achieved the criteria, not when arbitrary time has passed."
  );

  addNarrative(
    `${desuck.transition?.pilotPlan || 'The implementation begins with a focused pilot, expands based on demonstrated success, and scales only after the model is proven.'} Each stage has clear entry criteria, key activities, and success measures. Progression is based on evidence, not optimism.`
  );

  yPos += 6;

  addStageCard(
    1,
    "Foundation",
    "Typically 1-2 weeks",
    [
      "Secure stakeholder buy-in",
      "Select and prepare pilot team",
      "Set up tooling and access"
    ],
    [
      "Stakeholder alignment sessions",
      "Pilot team selection and briefing",
      "Tooling setup and testing",
      "Baseline metrics documentation"
    ],
    [
      "Executive sponsor confirmed",
      "Pilot team of 3-5 committed",
      "Tools operational in sandbox",
      "Current process baselined"
    ]
  );

  addStageCard(
    2,
    "Pilot",
    "Typically 2-4 weeks",
    [
      "Validate workflow in production",
      "Build user confidence",
      "Capture learning data"
    ],
    [
      "Training for pilot team",
      "Supervised production use",
      "Daily standups and coaching",
      "Systematic feedback capture"
    ],
    [
      "80%+ pilot adoption rate",
      "50%+ time reduction observed",
      "100+ corrections captured",
      "Quality maintained or improved"
    ]
  );

  addStageCard(
    3,
    "Analysis & Refinement",
    "Typically 1-2 weeks",
    [
      "Assess pilot outcomes",
      "Refine based on learnings",
      "Prepare for expansion"
    ],
    [
      "Quantitative metrics analysis",
      "User feedback synthesis",
      "Process and prompt refinement",
      "Expansion planning"
    ],
    [
      "Clear ROI demonstrated",
      "Major issues resolved",
      "Refined playbook documented",
      "Expansion cohort identified"
    ]
  );

  addStageCard(
    4,
    "Scale",
    "Ongoing",
    [
      "Extend to broader organization",
      "Evolve collaboration modes",
      "Build self-sustaining capability"
    ],
    [
      "Cohort-based rollout",
      "Train-the-trainer programs",
      "Mode evolution based on trust",
      "Continuous improvement cycles"
    ],
    [
      "Organization-wide adoption",
      "Internal expertise established",
      "Sustained improvement metrics",
      "Model for future workflows"
    ]
  );

  addSubheading("Stage Advancement Criteria");

  addNarrative(
    "Progression between stages is milestone-based, not calendar-based. You advance when you've demonstrated readiness, not when time has passed. This prevents the common failure of scaling before the model is proven."
  );

  addNarrative(
    "Between each stage, conduct a formal review: What worked? What didn't? What would we do differently? This learning capture is as important as the implementation itself. The goal isn't just to deploy this workflow — it's to build organizational capability for future human-AI transformations."
  );

  // === CONCLUSION / CTA ===
  ensureSpace(90);
  yPos += 10;
  addSectionHeader("Next Steps");

  addNarrative(
    `This blueprint represents a shift from fighting a broken process to designing something fundamentally better. ${autopsy.origin ? 'The problem began when ' + autopsy.origin.split('.')[0].toLowerCase() + ', but circumstances have changed.' : 'The original constraints no longer apply.'} ${autopsy.outcomes ? 'The true goal — ' + autopsy.outcomes.split('.')[0].toLowerCase() + ' — ' : 'What actually matters'} can now be achieved through intelligent human-AI collaboration.`
  );

  addNarrative(
    "The path forward starts with a single step: Stage 1 Foundation. Secure your executive sponsor, select your pilot team, and set up the basic tooling. Everything else follows from there. Don't try to solve everything at once — start small, learn fast, and scale based on evidence."
  );

  // CTA Box
  ensureSpace(65);
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 55, 4, 4, "F");

  yPos += 12;
  doc.setFontSize(14);
  doc.setFont("YoungSerif", "bold");
  setColor(colors.dark);
  doc.text("Ready to begin?", margin + 15, yPos);

  yPos += 10;
  doc.setFontSize(10.5);
  doc.setFont("OpenSans", "normal");
  setColor(colors.text);
  doc.text("For hands-on help with implementation, workflow design, or custom AI solutions:", margin + 15, yPos);

  yPos += 12;
  doc.setFont("OpenSans", "bold");
  setColor(colors.primary);
  const linkText = "Book a call with Geoff Gibbins, Founder of Human Machines";
  doc.textWithLink(linkText, margin + 15, yPos, { url: "https://calendly.com/geoff-human-machines/30min" });

  yPos += 7;
  setColor(colors.text);
  doc.setFont("OpenSans", "normal");
  doc.text("Email: ", margin + 15, yPos);
  const emailX = margin + 15 + doc.getTextWidth("Email: ");
  setColor(colors.primary);
  doc.textWithLink("hello@human-machines.com", emailX, yPos, { url: "mailto:hello@human-machines.com" });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("OpenSans", "normal");
    doc.setTextColor(160, 160, 175);
    doc.text("\u00A9 Human Machines Group LLC - www.human-machines.com", pageWidth / 2, pageHeight - 12, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email") || "geoff@human-machines.com";

    // Sample session data with realistic content
    const session: Partial<SessionData> = {
      selectedCandidate:
        "Creating presentations from AI-generated content is a tedious copy-paste nightmare that wastes hours while producing mediocre results",
      audit: {
        consensusPassed: true,
        strategic: "critical",
        measurable: "clear",
        previousAttempts: "multiple",
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
            mode: "consulting",
            confidence: "high",
            aiDoes: "Suggests audience analysis frameworks, proposes key message options, identifies potential objections",
            humanDoes: "Makes final decisions on strategy, applies organizational context AI does not have",
            reasoning: "Strategy requires human judgment about politics, relationships, and unstated goals",
          },
          {
            outcome: "Content generation",
            mode: "supervising",
            confidence: "high",
            aiDoes: "Drafts all content sections, creates multiple options, handles research and data gathering",
            humanDoes: "Reviews for accuracy, adds proprietary insights, catches hallucinations",
            reasoning: "AI excels at volume and variety; humans catch errors and add unique value",
          },
          {
            outcome: "Design and formatting",
            mode: "delegating",
            confidence: "medium",
            aiDoes: "Applies templates, handles all formatting, creates consistent visual hierarchy",
            humanDoes: "Sets brand parameters upfront, reviews final output",
            reasoning: "Formatting is mechanical and AI can match templates precisely",
          },
          {
            outcome: "Quality assurance",
            mode: "approving",
            confidence: "high",
            aiDoes: "Runs consistency checks, flags potential issues, compares against standards",
            humanDoes: "Final review and sign-off on every presentation",
            reasoning: "Human accountability required for external-facing content",
          },
        ],
        learning: "Track presentation effectiveness through audience feedback, measure time saved vs old process, and feed human corrections back to improve AI recommendations over time.",
        transition: {
          humanElement: "Start with the internal presentations team who already feels the pain most acutely. Get buy-in from marketing on template integration before scaling.",
          pilotPlan: "Pilot with internal team meetings for 2 weeks, then expand to client-facing decks with extra review layer.",
        },
      },
    };

    // Generate narrative PDF
    const pdfBuffer = generateNarrativePDF(session);

    // Send email
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: "Suckbot <suckbot@human-machines.com>",
      to: email,
      subject: "Your Suckbot Report  — The thing that sucked is about to suck less",
      html: `
        <div style="font-family: 'Open Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-family: Georgia, serif; color: #1A1A2E; font-size: 28px; margin-bottom: 20px;">
            Your Suckbot Report
          </h1>
          <p style="color: #6B6B80; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Attached is your complete Suckbot report  — including your Suck Audit, Suck Autopsy, and De-Suckification blueprint.
          </p>
          <p style="color: #6B6B80; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            <strong style="color: #1A1A2E;">The thing that sucked? It's about to suck a lot less.</strong>
          </p>
          <hr style="border: none; border-top: 1px solid #E5E5EF; margin: 30px 0;">
          <p style="color: #6B6B80; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Want help making it happen?
          </p>
          <a href="https://calendly.com/geoff-human-machines/30min"
             style="display: inline-block; background: #7C3AED; color: white; padding: 14px 28px;
                    border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Book a call with Geoff Gibbins
          </a>
          <p style="color: #6B6B80; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Or reach out anytime at <a href="mailto:hello@human-machines.com" style="color: #7C3AED;">hello@human-machines.com</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E5E5EF; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px;">
            Human Machines | <a href="https://human-machines.com" style="color: #9CA3AF;">human-machines.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "Suckbot-Report.pdf",
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentTo: email });
  } catch (error) {
    console.error("Test PDF error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate/send PDF" },
      { status: 500 }
    );
  }
}
