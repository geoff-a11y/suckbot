export type Phase =
  | "WELCOME"
  | "PRIVACY"
  | "OPENING"
  | "GATHERING"
  | "EVALUATION_MODE"
  | "QUICK_COMPARE"
  | "COMPARE_SUMMARY"
  | "CANDIDATE_SELECT"
  | "CONSENSUS_TEST"
  | "CONSENSUS_PASS"
  | "CONSENSUS_FAIL"
  | "Q_STRATEGIC"
  | "Q_STRATEGIC_SOFT_FAIL"
  | "Q_MEASURABLE"
  | "Q_PREVIOUS"
  | "AUDIT_COMPLETE"
  | "AUTOPSY_INTRO"
  | "L1_ORIGIN"
  | "L2_CONSTRAINTS"
  | "L3_ASSUMPTIONS"
  | "L4_WORKAROUNDS"
  | "L5_STAKEHOLDERS"
  | "L6_OUTCOMES"
  | "AUTOPSY_REPORT"
  | "DESUCK_INTRO"
  | "M1_OUTCOMES"
  | "M2_CAPABILITIES"
  | "M3_WORKFLOW"
  | "M4_LEARNING"
  | "M5_TRANSITION"
  | "DESUCK_SUMMARY"
  | "FINAL_SUMMARY"
  | "GENERATE_REPORT"
  | "FINAL";

export type CardType =
  | "welcome"
  | "privacy"
  | "question"
  | "acknowledgment"
  | "section-header"
  | "success"
  | "redirect"
  | "suck-statement"
  | "comparison-table"
  | "autopsy-report"
  | "workflow-design"
  | "modes-explainer"
  | "flywheel"
  | "conclusion"
  | "final";

export type InputType = "freetext" | "options" | "none";

export type EvaluationMode = "deep" | "compare";

export type CollaborationMode = "approving" | "consulting" | "supervising" | "delegating";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Candidate {
  text: string;
  addedAt: string;
  quickEval?: {
    consensus: "yes" | "probably" | "debatable";
    strategic: "critical" | "important" | "nice";
    previousAttempts: "multiple" | "one" | "none";
  };
}

export interface AuditData {
  consensusPassed?: boolean;
  strategic?: "critical" | "important" | "nice";
  measurable?: "clear" | "noticeable" | "subjective";
  previousAttempts?: "multiple" | "one" | "none";
  completedAt?: string;
}

export interface AutopsyData {
  origin?: string;
  constraints?: string;
  assumptions?: string;
  workarounds?: string;
  stakeholders?: string;
  outcomes?: string;
  completedAt?: string;
}

export interface OutcomeWorkflow {
  outcome: string;
  mode: CollaborationMode;
  confidence: ConfidenceLevel;
  aiDoes: string;
  humanDoes: string;
  reasoning: string;
}

export interface DesuckData {
  outcomes?: string[];
  capabilities?: Record<string, { human: string[]; ai: string[] }>;
  workflow?: OutcomeWorkflow[];
  learning?: string;
  transition?: {
    humanElement: string;
    pilotPlan: string;
  };
  completedAt?: string;
}

export interface SessionData {
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  phase: Phase;
  candidates: Candidate[];
  selectedCandidate: string | null;
  evaluationMode: EvaluationMode | null;
  audit: AuditData;
  autopsy: AutopsyData;
  desuck: DesuckData;
}

export interface Option {
  label: string;
  value: string;
}

export interface Card {
  type: CardType;
  title?: string;
  content?: string;
  subcontent?: string;
  data?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  cards?: Card[];
  options?: Option[];
  inputType?: InputType;
}

export interface ChatState {
  messages: Message[];
  session: SessionData;
  isLoading: boolean;
  error: string | null;
}

export interface ClaudeResponse {
  message: string;
  phase: Phase;
  cards?: Card[];
  options?: Option[];
  inputType: InputType;
  dataCapture?: {
    field: string;
    action: "set" | "append";
    value: unknown;
  };
}
