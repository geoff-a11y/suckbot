import { Phase } from "./types";

export interface ActInfo {
  actNumber: number;
  actName: string;
  totalActs: number;
  progress: number; // 0-100
  stageName: string; // For display: "Audit", "Autopsy", "Blueprint"
  stageStep: number; // Current step within stage
  stageTotalSteps: number; // Total steps in current stage
  estimatedMinutesRemaining: number; // Estimated time left
}

// Map phases to stages with step info
// step: current step in stage, total: total steps in stage
const PHASE_TO_ACT: Record<Phase, { act: number; name: string; stage: string; step: number; total: number }> = {
  // Stage 0: Welcome & Setup (not counted in main stages)
  WELCOME: { act: 0, name: "Getting Started", stage: "", step: 0, total: 0 },
  PRIVACY: { act: 0, name: "Getting Started", stage: "", step: 0, total: 0 },
  OPENING: { act: 0, name: "Getting Started", stage: "", step: 0, total: 0 },

  // Stage 1: Suck Audit - 5 main steps
  GATHERING: { act: 1, name: "Suck Audit", stage: "Audit", step: 1, total: 5 },
  EVALUATION_MODE: { act: 1, name: "Suck Audit", stage: "Audit", step: 2, total: 5 },
  QUICK_COMPARE: { act: 1, name: "Suck Audit", stage: "Audit", step: 2, total: 5 },
  COMPARE_SUMMARY: { act: 1, name: "Suck Audit", stage: "Audit", step: 2, total: 5 },
  CANDIDATE_SELECT: { act: 1, name: "Suck Audit", stage: "Audit", step: 3, total: 5 },
  CONSENSUS_TEST: { act: 1, name: "Suck Audit", stage: "Audit", step: 3, total: 5 },
  CONSENSUS_PASS: { act: 1, name: "Suck Audit", stage: "Audit", step: 4, total: 5 },
  CONSENSUS_FAIL: { act: 1, name: "Suck Audit", stage: "Audit", step: 3, total: 5 },
  Q_EVALUATION: { act: 1, name: "Suck Audit", stage: "Audit", step: 4, total: 5 },
  AUDIT_COMPLETE: { act: 1, name: "Suck Audit", stage: "Audit", step: 5, total: 5 },

  // Stage 2: Suck Autopsy - 4 steps (intro + 3 layers) or 2 steps (quick mode)
  AUTOPSY_INTRO: { act: 2, name: "Suck Autopsy", stage: "Autopsy", step: 1, total: 4 },
  AUTOPSY_QUICK: { act: 2, name: "Suck Autopsy", stage: "Autopsy", step: 2, total: 2 },
  L1_ORIGINS: { act: 2, name: "Suck Autopsy", stage: "Autopsy", step: 2, total: 4 },
  L2_ASSUMPTIONS: { act: 2, name: "Suck Autopsy", stage: "Autopsy", step: 3, total: 4 },
  L3_STAKES: { act: 2, name: "Suck Autopsy", stage: "Autopsy", step: 4, total: 4 },
  AUTOPSY_REPORT: { act: 2, name: "Suck Autopsy", stage: "Autopsy", step: 4, total: 4 },

  // Stage 3: De-Suckification - 3 steps (streamlined)
  DESUCK_INTRO: { act: 3, name: "De-Suckification", stage: "Blueprint", step: 1, total: 3 },
  DESUCK_BLUEPRINT: { act: 3, name: "De-Suckification", stage: "Blueprint", step: 2, total: 3 },
  DESUCK_ADJUST: { act: 3, name: "De-Suckification", stage: "Blueprint", step: 2, total: 3 },
  DESUCK_SUMMARY: { act: 3, name: "De-Suckification", stage: "Blueprint", step: 3, total: 3 },
  GENERATE_REPORT: { act: 3, name: "De-Suckification", stage: "Blueprint", step: 3, total: 3 },
  FINAL: { act: 3, name: "Complete", stage: "", step: 3, total: 3 },
};

// Average minutes per stage (based on simulation data)
const STAGE_MINUTES: Record<number, number> = {
  1: 6,  // Audit
  2: 5,  // Autopsy (or 2 min if quick mode)
  3: 3,  // Blueprint (streamlined from 8 min)
};

// Phase order for progress calculation (streamlined flow)
const PHASE_ORDER: Phase[] = [
  "WELCOME", "PRIVACY", "OPENING",
  "GATHERING", "EVALUATION_MODE", "QUICK_COMPARE", "COMPARE_SUMMARY", "CANDIDATE_SELECT",
  "CONSENSUS_TEST", "CONSENSUS_PASS", "CONSENSUS_FAIL", "Q_EVALUATION", "AUDIT_COMPLETE",
  "AUTOPSY_INTRO", "AUTOPSY_QUICK", "L1_ORIGINS", "L2_ASSUMPTIONS", "L3_STAKES", "AUTOPSY_REPORT",
  "DESUCK_INTRO", "DESUCK_BLUEPRINT", "DESUCK_ADJUST", "DESUCK_SUMMARY", "GENERATE_REPORT", "FINAL"
];

export function getActInfo(phase: Phase): ActInfo {
  const actData = PHASE_TO_ACT[phase] || { act: 0, name: "Getting Started", stage: "", step: 0, total: 0 };
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const progress = Math.round((phaseIndex / (PHASE_ORDER.length - 1)) * 100);

  // Calculate estimated time remaining
  let estimatedMinutesRemaining = 0;
  const currentAct = actData.act;

  if (currentAct > 0 && currentAct <= 3) {
    // Time remaining in current stage
    const stageProgress = actData.total > 0 ? actData.step / actData.total : 0;
    const currentStageRemaining = STAGE_MINUTES[currentAct] * (1 - stageProgress);

    // Add full time for remaining stages
    for (let i = currentAct + 1; i <= 3; i++) {
      estimatedMinutesRemaining += STAGE_MINUTES[i];
    }
    estimatedMinutesRemaining += currentStageRemaining;
  }

  return {
    actNumber: actData.act,
    actName: actData.name,
    totalActs: 3,
    progress,
    stageName: actData.stage,
    stageStep: actData.step,
    stageTotalSteps: actData.total,
    estimatedMinutesRemaining: Math.round(estimatedMinutesRemaining),
  };
}

// Get encouragement message for key phases
export function getEncouragementMessage(phase: Phase): string | null {
  const messages: Partial<Record<Phase, string>> = {
    L2_ASSUMPTIONS: "Great progress! You're uncovering the hidden patterns.",
    L3_STAKES: "Final layer! You're about to see the full picture.",
    DESUCK_BLUEPRINT: "Designing your human-AI collaboration blueprint...",
  };
  return messages[phase] || null;
}
