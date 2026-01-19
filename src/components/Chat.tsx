"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Header from "./Header";
import MessageList from "./MessageList";
import InputBar from "./InputBar";
import OptionButtons from "./OptionButtons";
import EmailModal from "./EmailModal";
import TypingIndicator from "./TypingIndicator";
import WelcomeCard from "./cards/WelcomeCard";
import PrivacyCard from "./cards/PrivacyCard";
import { generatePDF } from "@/lib/generatePDF";
import { triggerCelebration, triggerSuccessSparkle } from "@/lib/confetti";
import { getEncouragementMessage } from "@/lib/progress";
import {
  ChatState,
  Message,
  SessionData,
  ClaudeResponse,
  Phase,
} from "@/lib/types";

const initialSession: SessionData = {
  sessionId: "",
  startedAt: "",
  phase: "WELCOME",
  candidates: [],
  selectedCandidate: null,
  evaluationMode: null,
  audit: {},
  autopsy: {},
  desuck: {},
};

type OnboardingStep = "welcome" | "privacy" | "ready";

// Phases that trigger success animations
const SUCCESS_PHASES: Phase[] = ["CONSENSUS_PASS", "AUDIT_COMPLETE", "AUTOPSY_REPORT", "DESUCK_SUMMARY"];

export default function Chat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    session: initialSession,
    isLoading: false,
    error: null,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [inputType, setInputType] = useState<"freetext" | "options" | "none">(
    "none"
  );
  const [currentOptions, setCurrentOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("welcome");
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const previousPhaseRef = useRef<Phase>("WELCOME");

  // Generate session ID on mount and run onboarding
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const sessionId = crypto.randomUUID();
      setState((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          sessionId,
          startedAt: new Date().toISOString(),
        },
      }));

      // Onboarding sequence
      setTimeout(() => {
        setOnboardingStep("privacy");
      }, 2000);

      setTimeout(() => {
        setOnboardingStep("ready");
        startConversation();
      }, 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle phase changes for celebrations and encouragement
  useEffect(() => {
    const currentPhase = state.session.phase;
    const previousPhase = previousPhaseRef.current;

    if (currentPhase !== previousPhase) {
      // Trigger success animation for milestone phases
      if (SUCCESS_PHASES.includes(currentPhase)) {
        triggerSuccessSparkle();
      }

      // Trigger big celebration when report is ready
      if (currentPhase === "GENERATE_REPORT") {
        setTimeout(() => {
          triggerCelebration();
        }, 500);
      }

      // Show encouragement messages during long phases
      const encouragement = getEncouragementMessage(currentPhase);
      if (encouragement) {
        toast(encouragement, {
          duration: 4000,
        });
      }

      previousPhaseRef.current = currentPhase;
    }
  }, [state.session.phase]);

  // Auto-scroll to bottom - with multiple delays to account for staggered animations
  useEffect(() => {
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    };

    const timer1 = setTimeout(scrollToBottom, 100);
    const timer2 = setTimeout(scrollToBottom, 700);
    const timer3 = setTimeout(scrollToBottom, 1500);
    const timer4 = setTimeout(scrollToBottom, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [state.messages, currentOptions, inputType]);

  // Save to localStorage on state change
  useEffect(() => {
    if (state.session.sessionId) {
      localStorage.setItem("suckbot_session", JSON.stringify(state.session));
    }
  }, [state.session]);

  const startConversation = async () => {
    await sendMessage("", true);
  };

  const sendMessage = useCallback(async (content: string, isStart = false) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setLastFailedMessage(null);

    try {
      let newMessages = [...state.messages];
      if (!isStart && content) {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };
        newMessages = [...newMessages, userMessage];
        setState((prev) => ({
          ...prev,
          messages: newMessages,
        }));
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isStart
            ? [{ role: "user", content: "[START_CONVERSATION]" }]
            : newMessages.map((m) => ({ role: m.role, content: m.content })),
          session: state.session,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? "Too many requests. Please wait a moment and try again."
            : response.status >= 500
            ? "Our servers are having trouble. Please try again in a moment."
            : "Failed to get response. Please try again."
        );
      }

      const data: ClaudeResponse = await response.json();

      // Filter out welcome/privacy cards - frontend already shows these statically
      const filteredCards = data.cards?.filter(
        (card) => card.type !== "welcome" && card.type !== "privacy"
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        cards: filteredCards,
        options: data.options,
        inputType: data.inputType,
      };

      let updatedSession = { ...state.session };
      if (data.phase) {
        updatedSession.phase = data.phase;
      }
      if (data.dataCapture) {
        updatedSession = applyDataCapture(updatedSession, data.dataCapture);
      }

      if (data.phase === "GENERATE_REPORT") {
        setShowEmailModal(true);
      }

      setState((prev) => ({
        ...prev,
        messages: [...newMessages, assistantMessage],
        session: updatedSession,
        isLoading: false,
      }));

      setInputType(data.inputType || "freetext");
      setCurrentOptions(data.options || []);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setLastFailedMessage(content);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [state.messages, state.session]);

  const applyDataCapture = (
    session: SessionData,
    capture: { field: string; action: string; value: unknown }
  ): SessionData => {
    const { field, action, value } = capture;
    const newSession = { ...session };

    const parts = field.split(".");
    let target: Record<string, unknown> = newSession as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof target[parts[i]] !== 'object' || target[parts[i]] === null) {
        target[parts[i]] = {};
      }
      target = target[parts[i]] as Record<string, unknown>;
    }

    const finalKey = parts[parts.length - 1];

    if (action === "set") {
      target[finalKey] = value;
    } else if (action === "append") {
      if (!Array.isArray(target[finalKey])) {
        target[finalKey] = [];
      }
      (target[finalKey] as unknown[]).push(value);
    }

    return newSession;
  };

  const handleOptionSelect = (value: string, label: string) => {
    sendMessage(`[Selected: ${label}]`);
  };

  const handleRetry = () => {
    if (lastFailedMessage !== null) {
      sendMessage(lastFailedMessage, lastFailedMessage === "");
    }
  };

  const handleStartOver = () => {
    if (confirm("Start a new session? Your current progress will be lost.")) {
      localStorage.removeItem("suckbot_session");
      window.location.reload();
    }
  };

  const handleEmailSubmit = async (email: string) => {
    setIsPdfGenerating(true);
    try {
      toast.loading("Generating your blueprint...", { id: "pdf-generating" });

      // Generate PDF client-side
      const pdfBase64 = generatePDF(state.session);

      toast.loading("Sending to your email...", { id: "pdf-generating" });

      // Send report via API
      const formData = new FormData();
      formData.append("email", email);
      formData.append("pdf", pdfBase64);

      const reportResponse = await fetch("/api/send-report", {
        method: "POST",
        body: formData,
      });

      if (!reportResponse.ok) throw new Error("Failed to send report");

      // Store session anonymously (no email)
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state.session,
          completedAt: new Date().toISOString(),
        }),
      });

      // Store email separately (no session data)
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      toast.success("Blueprint sent! Check your email.", { id: "pdf-generating" });
      setShowEmailModal(false);

      // Clear localStorage
      localStorage.removeItem("suckbot_session");

      // Continue to final phase
      sendMessage("[EMAIL_SUBMITTED]");
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to send blueprint. Please try again.", { id: "pdf-generating" });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header phase={state.session.phase} onStartOver={handleStartOver} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-60 sm:pb-52" role="main">
        <div className="space-y-4">
          {/* Welcome card - always visible once loaded */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <WelcomeCard type="welcome" />
          </motion.div>

          {/* Privacy card - appears after welcome, stays visible */}
          <AnimatePresence>
            {(onboardingStep === "privacy" || onboardingStep === "ready") && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <PrivacyCard type="privacy" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main conversation - appears after onboarding */}
          {onboardingStep === "ready" && (
            <>
              <MessageList messages={state.messages} />

              <AnimatePresence>
                {state.isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    aria-label="Suckbot is thinking"
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Error with retry */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-4 flex items-center justify-between gap-4"
            role="alert"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{state.error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium text-sm flex-shrink-0"
              aria-label="Retry sending message"
            >
              Retry
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {inputType === "options" && currentOptions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-4 pb-safe">
          <div className="max-w-3xl mx-auto">
            <OptionButtons
              options={currentOptions}
              onSelect={handleOptionSelect}
            />
          </div>
        </div>
      )}

      {inputType === "freetext" && (
        <InputBar
          onSubmit={sendMessage}
          disabled={state.isLoading}
          placeholder="Type your response..."
        />
      )}

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        isLoading={isPdfGenerating}
      />
    </div>
  );
}
