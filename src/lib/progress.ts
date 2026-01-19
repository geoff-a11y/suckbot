import { Phase } from "./types";

export interface ActInfo {
  actNumber: number;
  actName: string;
  totalActs: number;
  progress: number; // 0-100
  stageName: string; // For display: "Audit", "Autopsy", "Blueprint"
}

// Map phases to the 3 main stages
const PHASE_TO_ACT: Record<Phase, { act: number; name: string; stage: string }> = {
  // Stage 0: Welcome & Setup (not counted in main stages)
  WELCOME: { act: 0, name: "Getting Started", stage: "" },
  PRIVACY: { act: 0, name: "Getting Started", stage: "" },
  OPENING: { act: 0, name: "Getting Started", stage: "" },

  // Stage 1: Suck Audit (discovery + validation)
  GATHERING: { act: 1, name: "Suck Audit", stage: "Audit" },
  EVALUATION_MODE: { act: 1, name: "Suck Audit", stage: "Audit" },
  QUICK_COMPARE: { act: 1, name: "Suck Audit", stage: "Audit" },
  COMPARE_SUMMARY: { act: 1, name: "Suck Audit", stage: "Audit" },
  CANDIDATE_SELECT: { act: 1, name: "Suck Audit", stage: "Audit" },
  CONSENSUS_TEST: { act: 1, name: "Suck Audit", stage: "Audit" },
  CONSENSUS_PASS: { act: 1, name: "Suck Audit", stage: "Audit" },
  CONSENSUS_FAIL: { act: 1, name: "Suck Audit", stage: "Audit" },
  Q_EVALUATION: { act: 1, name: "Suck Audit", stage: "Audit" },
  AUDIT_COMPLETE: { act: 1, name: "Suck Audit", stage: "Audit" },

  // Stage 2: Suck Autopsy (3-layer deep dive)
  AUTOPSY_INTRO: { act: 2, name: "Suck Autopsy", stage: "Autopsy" },
  L1_ORIGINS: { act: 2, name: "Suck Autopsy", stage: "Autopsy" },
  L2_ASSUMPTIONS: { act: 2, name: "Suck Autopsy", stage: "Autopsy" },
  L3_STAKES: { act: 2, name: "Suck Autopsy", stage: "Autopsy" },
  AUTOPSY_REPORT: { act: 2, name: "Suck Autopsy", stage: "Autopsy" },

  // Stage 3: De-Suckification
  DESUCK_INTRO: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  M1_OUTCOMES: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  M2_CAPABILITIES: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  M3_WORKFLOW: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  M4_LEARNING: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  M5_TRANSITION: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  DESUCK_SUMMARY: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  GENERATE_REPORT: { act: 3, name: "De-Suckification", stage: "Blueprint" },
  FINAL: { act: 3, name: "Complete", stage: "" },
};

// Phase order for progress calculation (streamlined flow)
const PHASE_ORDER: Phase[] = [
  "WELCOME", "PRIVACY", "OPENING",
  "GATHERING", "EVALUATION_MODE", "QUICK_COMPARE", "COMPARE_SUMMARY", "CANDIDATE_SELECT",
  "CONSENSUS_TEST", "CONSENSUS_PASS", "CONSENSUS_FAIL", "Q_EVALUATION", "AUDIT_COMPLETE",
  "AUTOPSY_INTRO", "L1_ORIGINS", "L2_ASSUMPTIONS", "L3_STAKES", "AUTOPSY_REPORT",
  "DESUCK_INTRO", "M1_OUTCOMES", "M2_CAPABILITIES", "M3_WORKFLOW", "M4_LEARNING", "M5_TRANSITION", "DESUCK_SUMMARY", "GENERATE_REPORT", "FINAL"
];

export function getActInfo(phase: Phase): ActInfo {
  const actData = PHASE_TO_ACT[phase] || { act: 0, name: "Getting Started", stage: "" };
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const progress = Math.round((phaseIndex / (PHASE_ORDER.length - 1)) * 100);

  return {
    actNumber: actData.act,
    actName: actData.name,
    totalActs: 3,
    progress,
    stageName: actData.stage,
  };
}

// Get encouragement message for key phases
export function getEncouragementMessage(phase: Phase): string | null {
  const messages: Partial<Record<Phase, string>> = {
    L2_ASSUMPTIONS: "Great progress! You're uncovering the hidden patterns.",
    L3_STAKES: "Final layer! You're about to see the full picture.",
    M3_WORKFLOW: "Designing your new human-AI collaboration workflow...",
    M5_TRANSITION: "Nearly there! Let's make sure this transition works for your team.",
  };
  return messages[phase] || null;
}
