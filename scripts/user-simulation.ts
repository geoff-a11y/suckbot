/**
 * User Simulation Script
 * Simulates 100 users with different organization types going through Suckbot
 * Generates metrics, feedback, and sample PDFs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Organization types and their typical problems
const ORGANIZATION_TYPES = [
  { type: "Healthcare", size: "large", problems: [
    "Patient intake paperwork is still mostly manual despite having an EHR",
    "Scheduling coordination between departments requires 5+ phone calls",
    "Insurance verification takes 45 minutes per patient on average",
    "Medication reconciliation errors happen weekly",
    "Shift handoff communication gets lost constantly"
  ]},
  { type: "Financial Services", size: "large", problems: [
    "Compliance reporting takes a full week every quarter",
    "Client onboarding requires 12 different forms across 4 systems",
    "Risk assessment is done in spreadsheets that nobody trusts",
    "Audit preparation consumes 20% of senior staff time",
    "Expense approvals sit in queues for weeks"
  ]},
  { type: "Tech Startup", size: "small", problems: [
    "Customer support tickets get lost between Slack and email",
    "Sprint planning takes half a day every two weeks",
    "Documentation is scattered across 6 different tools",
    "Onboarding new engineers takes 3 weeks minimum",
    "Feature requests from sales never make it to the roadmap"
  ]},
  { type: "Manufacturing", size: "medium", problems: [
    "Inventory counts are always wrong by the time reports are run",
    "Quality control data sits in paper logs nobody reads",
    "Maintenance scheduling is reactive, never preventive",
    "Supplier communication happens through a maze of emails",
    "Production planning changes 3 times a day"
  ]},
  { type: "Education", size: "medium", problems: [
    "Student progress tracking requires checking 4 different systems",
    "Parent communication is inconsistent across teachers",
    "Curriculum updates take a full semester to propagate",
    "Substitute teacher coordination is chaos every morning",
    "Budget requests disappear into administrative black holes"
  ]},
  { type: "Legal", size: "small", problems: [
    "Document review is 80% paralegal time on low-value work",
    "Conflict checks require manual searches across multiple databases",
    "Billing entry happens weeks after the work is done",
    "Case research starts from scratch every time",
    "Client intake forms are still faxed (yes, faxed)"
  ]},
  { type: "Retail", size: "large", problems: [
    "Inventory transfers between stores take 5 days of paperwork",
    "Seasonal hiring onboarding is a nightmare every year",
    "Loss prevention data never reaches store managers in time",
    "Vendor negotiations happen without historical data",
    "Customer complaints get resolved but patterns never get addressed"
  ]},
  { type: "Nonprofit", size: "small", problems: [
    "Donor tracking is split between 3 spreadsheets and a CRM nobody uses",
    "Grant reporting takes weeks to compile from scattered data",
    "Volunteer scheduling conflicts happen every event",
    "Impact measurement is qualitative at best",
    "Board reporting is a manual scramble every quarter"
  ]},
  { type: "Government", size: "large", problems: [
    "Permit applications require 6 department approvals that don't talk to each other",
    "Constituent inquiries get routed to wrong departments constantly",
    "Budget reconciliation is 3 months behind at any given time",
    "Inter-agency data sharing requires formal MOUs for everything",
    "Public records requests create backlogs of months"
  ]},
  { type: "Consulting", size: "medium", problems: [
    "Proposal creation starts from scratch every time",
    "Knowledge from past projects never makes it to new teams",
    "Resource allocation conflicts between projects weekly",
    "Client deliverable reviews take 3 rounds minimum",
    "Utilization tracking is always disputed"
  ]}
];

// Autopsy insights by problem category
const AUTOPSY_TEMPLATES = {
  origins: [
    "This process was designed when {constraint} was a real limitation. The original team built what made sense at the time.",
    "Started as a quick fix during {event} and somehow became permanent policy.",
    "Emerged from a compliance requirement that has since been updated, but the process wasn't.",
    "Was built around a specific person's skills who left 3 years ago.",
    "Created by a vendor implementation that optimized for their product, not your workflow."
  ],
  assumptions: [
    "Everyone assumes this requires human judgment, but 80% is actually pattern matching.",
    "The belief that 'this is how it's always been done' has prevented anyone from questioning it.",
    "People assume the other department needs this format, but nobody has asked them in years.",
    "There's an unquestioned assumption that quality requires manual review at every step.",
    "The team believes leadership wants it this way, but leadership thinks the team prefers it."
  ],
  stakes: [
    "The person who manages this process has built their role around its complexity.",
    "Fixing this would reveal how much time has been wasted, which feels politically risky.",
    "Several workarounds have created informal power structures people want to protect.",
    "The real goal is {outcome}, but the process has become the focus instead.",
    "Multiple teams have optimized around the dysfunction - changing it affects everyone."
  ]
};

// Workflow mode recommendations by outcome type
const WORKFLOW_TEMPLATES = [
  { outcome: "Data gathering and initial analysis", mode: "delegating" as const, confidence: "high" as const,
    aiDoes: "Collects data from multiple sources, runs initial analysis, flags anomalies",
    humanDoes: "Validates findings, adds context AI can't access, makes final calls" },
  { outcome: "Communication and stakeholder updates", mode: "supervising" as const, confidence: "medium" as const,
    aiDoes: "Drafts communications, maintains consistency, handles routine updates",
    humanDoes: "Reviews for tone, handles sensitive messages, manages relationships" },
  { outcome: "Quality assurance and compliance", mode: "approving" as const, confidence: "high" as const,
    aiDoes: "Runs all standard checks, compares against requirements, documents findings",
    humanDoes: "Reviews exceptions, makes judgment calls, signs off on final output" },
  { outcome: "Process coordination and scheduling", mode: "delegating" as const, confidence: "high" as const,
    aiDoes: "Manages calendars, resolves conflicts, sends reminders, tracks completion",
    humanDoes: "Handles escalations, makes priority decisions, manages exceptions" },
  { outcome: "Documentation and knowledge capture", mode: "consulting" as const, confidence: "medium" as const,
    aiDoes: "Suggests templates, organizes information, maintains consistency",
    humanDoes: "Provides expertise, validates accuracy, decides what matters" },
  { outcome: "Decision support and recommendations", mode: "consulting" as const, confidence: "high" as const,
    aiDoes: "Gathers options, analyzes tradeoffs, presents structured choices",
    humanDoes: "Applies judgment, considers politics, makes final decisions" }
];

interface SimulatedUser {
  id: number;
  orgType: string;
  orgSize: string;
  problem: string;
  sessionData: SessionData;
  interactionCount: number;
  estimatedMinutes: number;
  feedback: {
    clarity: number;      // 1-5
    usefulness: number;   // 1-5
    actionability: number; // 1-5
    comments: string;
  };
}

interface SessionData {
  sessionId: string;
  startedAt: string;
  completedAt: string;
  phase: string;
  candidates: { text: string; addedAt: string }[];
  selectedCandidate: string;
  evaluationMode: string;
  audit: {
    consensusPassed: boolean;
    strategic: string;
    measurable: string;
    previousAttempts: string;
  };
  autopsy: {
    originsConstraints: string;
    assumptionsWorkarounds: string;
    stakesOutcomes: string;
  };
  desuck: {
    outcomes: string[];
    workflow: {
      outcome: string;
      mode: string;
      confidence: string;
      aiDoes: string;
      humanDoes: string;
      reasoning: string;
    }[];
    learning: string;
    transition: {
      humanElement: string;
      pilotPlan: string;
    };
  };
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSessionData(orgType: typeof ORGANIZATION_TYPES[0], problem: string): SessionData {
  const now = new Date();
  const startTime = new Date(now.getTime() - randomInt(15, 35) * 60000);

  // Generate autopsy data
  const constraint = randomChoice(["the technology", "staffing levels", "budget constraints", "regulatory requirements"]);
  const event = randomChoice(["a major incident", "a leadership change", "rapid growth", "a merger"]);
  const outcome = randomChoice(["faster delivery", "better quality", "lower costs", "happier customers", "reduced risk"]);

  const originsConstraints = randomChoice(AUTOPSY_TEMPLATES.origins)
    .replace("{constraint}", constraint)
    .replace("{event}", event)
    + " " + `The ${orgType.type.toLowerCase()} industry had different pressures then, and the process reflected that reality.`;

  const assumptionsWorkarounds = randomChoice(AUTOPSY_TEMPLATES.assumptions)
    + " Meanwhile, people have built workarounds: " + randomChoice([
      "shadow spreadsheets that actually run the process",
      "informal networks that bypass the official channels",
      "scripts that automate parts nobody talks about",
      "a 'special request' process that most work goes through"
    ]) + ".";

  const stakesOutcomes = randomChoice(AUTOPSY_TEMPLATES.stakes)
    .replace("{outcome}", outcome)
    + " The real goal is " + outcome + ", but the current process has become an end in itself.";

  // Generate outcomes (3-5 based on problem complexity)
  const outcomeCount = randomInt(3, 5);
  const outcomes = WORKFLOW_TEMPLATES.slice(0, outcomeCount).map(w => w.outcome);

  // Generate workflow with reasoning
  const workflow = WORKFLOW_TEMPLATES.slice(0, outcomeCount).map(w => ({
    ...w,
    reasoning: `${w.mode === 'delegating' ? 'AI excels at' : w.mode === 'consulting' ? 'Human judgment needed for' : w.mode === 'supervising' ? 'Routine enough for AI with' : 'Quality requires'} this type of work. ${randomChoice([
      "The volume makes automation essential.",
      "Human relationships matter here.",
      "Consistency is the key value-add.",
      "Judgment calls are frequent.",
      "Patterns are clear and repeatable."
    ])}`
  }));

  return {
    sessionId: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startedAt: startTime.toISOString(),
    completedAt: now.toISOString(),
    phase: "FINAL",
    candidates: [{ text: problem, addedAt: startTime.toISOString() }],
    selectedCandidate: problem,
    evaluationMode: "deep",
    audit: {
      consensusPassed: true,
      strategic: randomChoice(["critical", "important", "important"]), // weighted toward important
      measurable: randomChoice(["clear", "clear", "noticeable"]),
      previousAttempts: randomChoice(["multiple", "one", "multiple"])
    },
    autopsy: {
      originsConstraints,
      assumptionsWorkarounds,
      stakesOutcomes
    },
    desuck: {
      outcomes,
      workflow,
      learning: `Track ${randomChoice(["time saved", "error rates", "satisfaction scores", "throughput"])} weekly. Feed human corrections back to improve AI recommendations. Review collaboration modes monthly and adjust based on what's working.`,
      transition: {
        humanElement: `Start with the ${randomChoice(["team that feels the pain most", "most receptive department", "highest-volume use case", "lowest-risk application"])}. Get ${randomChoice(["IT", "leadership", "operations", "the affected team"])} aligned before expanding.`,
        pilotPlan: `Run a ${randomChoice(["2-week", "30-day", "one-month"])} pilot with ${randomChoice(["a single team", "one use case", "the morning shift", "new hires only"])}. Measure before and after, then scale based on results.`
      }
    }
  };
}

function simulateUser(id: number): SimulatedUser {
  const org = randomChoice(ORGANIZATION_TYPES);
  const problem = randomChoice(org.problems);
  const sessionData = generateSessionData(org, problem);

  // Calculate interaction count based on streamlined flow
  // Opening(1) + Gathering(1-2) + EvalMode(1) + Consensus(1) + QEval(1) +
  // AutopsyIntro(1) + L1-L3(3) + Report(1) + DesuckIntro(1) + M1-M5(5) + Summary(1) + Final(1)
  const baseInteractions = 18;
  const gatheringVariance = randomInt(0, 2); // Some users mention multiple problems
  const interactionCount = baseInteractions + gatheringVariance;

  // Time estimation (refined based on actual UX flow)
  // - Option-based responses: ~20-30 seconds (read + click)
  // - Freetext responses: ~60-90 seconds (read + think + type)
  // The streamlined flow has ~6 option interactions and ~13 freetext
  const optionInteractions = 6;
  const freetextInteractions = interactionCount - optionInteractions;
  const optionTime = optionInteractions * randomInt(20, 30);
  const freetextTime = freetextInteractions * randomInt(60, 90);
  const estimatedMinutes = Math.round((optionTime + freetextTime) / 60);

  // Generate feedback (simulated user satisfaction)
  const clarity = randomInt(3, 5);
  const usefulness = randomInt(3, 5);
  const actionability = randomInt(3, 5);

  const feedbackComments = [
    "Really helped me see the problem from a new angle.",
    "The autopsy section was eye-opening - never thought about why the process exists.",
    "Actionable blueprint, but implementation will be the real challenge.",
    "Liked the human-AI collaboration framing. Made it feel less threatening.",
    "Took longer than expected, but worth it for the insights.",
    "Would have liked more specific tool recommendations.",
    "The mode explanations (approving, consulting, etc.) were very clear.",
    "Surprised how much I learned about our own processes.",
    "Good structure, kept me focused instead of just venting.",
    "The PDF report is something I can actually share with leadership."
  ];

  return {
    id,
    orgType: org.type,
    orgSize: org.size,
    problem,
    sessionData,
    interactionCount,
    estimatedMinutes,
    feedback: {
      clarity,
      usefulness,
      actionability,
      comments: randomChoice(feedbackComments)
    }
  };
}

function runSimulation() {
  console.log("Starting simulation of 100 users...\n");

  const users: SimulatedUser[] = [];
  for (let i = 1; i <= 100; i++) {
    users.push(simulateUser(i));
    if (i % 20 === 0) {
      console.log(`Simulated ${i} users...`);
    }
  }

  // Aggregate metrics
  const avgInteractions = users.reduce((sum, u) => sum + u.interactionCount, 0) / users.length;
  const avgMinutes = users.reduce((sum, u) => sum + u.estimatedMinutes, 0) / users.length;
  const avgClarity = users.reduce((sum, u) => sum + u.feedback.clarity, 0) / users.length;
  const avgUsefulness = users.reduce((sum, u) => sum + u.feedback.usefulness, 0) / users.length;
  const avgActionability = users.reduce((sum, u) => sum + u.feedback.actionability, 0) / users.length;

  const minMinutes = Math.min(...users.map(u => u.estimatedMinutes));
  const maxMinutes = Math.max(...users.map(u => u.estimatedMinutes));

  // Organization type breakdown
  const orgBreakdown: Record<string, number> = {};
  users.forEach(u => {
    orgBreakdown[u.orgType] = (orgBreakdown[u.orgType] || 0) + 1;
  });

  // Select 5 random users for PDF generation
  const pdfUsers = users.sort(() => Math.random() - 0.5).slice(0, 5);

  // Generate report
  const report = {
    summary: {
      totalUsers: 100,
      timestamp: new Date().toISOString()
    },
    timeEstimates: {
      averageMinutes: Math.round(avgMinutes),
      minimumMinutes: minMinutes,
      maximumMinutes: maxMinutes,
      averageInteractions: Math.round(avgInteractions * 10) / 10,
      breakdown: {
        quickPath: "15-20 minutes (single problem, quick responses)",
        typicalPath: "25-30 minutes (thoughtful responses, some exploration)",
        deepPath: "35-45 minutes (multiple problems considered, detailed answers)"
      }
    },
    feedback: {
      averageClarity: Math.round(avgClarity * 10) / 10,
      averageUsefulness: Math.round(avgUsefulness * 10) / 10,
      averageActionability: Math.round(avgActionability * 10) / 10,
      overallSatisfaction: Math.round((avgClarity + avgUsefulness + avgActionability) / 3 * 10) / 10,
      sampleComments: users.slice(0, 10).map(u => ({
        orgType: u.orgType,
        comment: u.feedback.comments
      }))
    },
    organizationBreakdown: orgBreakdown,
    pdfSamples: pdfUsers.map(u => ({
      id: u.id,
      orgType: u.orgType,
      orgSize: u.orgSize,
      problem: u.problem,
      filename: `sample-${u.id}-${u.orgType.toLowerCase().replace(/\s+/g, '-')}.json`
    })),
    allUsers: users.map(u => ({
      id: u.id,
      orgType: u.orgType,
      problem: u.problem.substring(0, 60) + "...",
      interactions: u.interactionCount,
      minutes: u.estimatedMinutes,
      satisfaction: Math.round((u.feedback.clarity + u.feedback.usefulness + u.feedback.actionability) / 3 * 10) / 10
    }))
  };

  // Create output directory
  const outputDir = join(process.cwd(), "simulation-output");
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }

  // Write main report
  writeFileSync(
    join(outputDir, "simulation-report.json"),
    JSON.stringify(report, null, 2)
  );

  // Write 5 sample session files for PDF generation
  pdfUsers.forEach(user => {
    const filename = `sample-${user.id}-${user.orgType.toLowerCase().replace(/\s+/g, '-')}.json`;
    writeFileSync(
      join(outputDir, filename),
      JSON.stringify(user.sessionData, null, 2)
    );
  });

  // Print summary to console
  console.log("\n" + "=".repeat(60));
  console.log("SIMULATION COMPLETE");
  console.log("=".repeat(60));

  console.log("\nTIME ESTIMATES:");
  console.log(`  Average completion time: ${Math.round(avgMinutes)} minutes`);
  console.log(`  Range: ${minMinutes} - ${maxMinutes} minutes`);
  console.log(`  Average interactions: ${Math.round(avgInteractions * 10) / 10}`);
  console.log("\n  Typical paths:");
  console.log("    Quick (focused user):     15-20 minutes");
  console.log("    Typical (thoughtful):     25-30 minutes");
  console.log("    Deep (exploratory):       35-45 minutes");

  console.log("\nFEEDBACK SCORES (1-5 scale):");
  console.log(`  Clarity:        ${Math.round(avgClarity * 10) / 10}`);
  console.log(`  Usefulness:     ${Math.round(avgUsefulness * 10) / 10}`);
  console.log(`  Actionability:  ${Math.round(avgActionability * 10) / 10}`);
  console.log(`  Overall:        ${Math.round((avgClarity + avgUsefulness + avgActionability) / 3 * 10) / 10}`);

  console.log("\nORGANIZATION BREAKDOWN:");
  Object.entries(orgBreakdown)
    .sort((a, b) => b[1] - a[1])
    .forEach(([org, count]) => {
      console.log(`  ${org}: ${count} users`);
    });

  console.log("\n5 SAMPLE SESSIONS FOR PDF REVIEW:");
  pdfUsers.forEach((user, i) => {
    console.log(`  ${i + 1}. [${user.orgType}] ${user.problem.substring(0, 50)}...`);
  });

  console.log(`\nOutput saved to: ${outputDir}/`);
  console.log("  - simulation-report.json (full metrics)");
  console.log("  - sample-*.json (5 session files for PDF generation)");

  return { report, pdfUsers };
}

// Run if called directly
runSimulation();
