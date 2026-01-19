"use client";

import { Phase } from "@/lib/types";
import { getActInfo } from "@/lib/progress";

interface HeaderProps {
  phase?: Phase;
  onStartOver?: () => void;
}

const STAGES = [
  { num: 1, label: "Audit" },
  { num: 2, label: "Autopsy" },
  { num: 3, label: "Blueprint" },
];

export default function Header({ phase, onStartOver }: HeaderProps) {
  const actInfo = phase ? getActInfo(phase) : null;
  const showProgress = phase && actInfo && actInfo.actNumber > 0;

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-[var(--color-primary)] flex items-center justify-center">
              <span className="text-[var(--color-primary)] font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-heading text-lg text-[var(--color-text)]">Suckbot</h1>
              <p className="text-xs text-[var(--color-text-muted)]">by Human Machines</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Start over button */}
            {onStartOver && phase && phase !== "WELCOME" && phase !== "PRIVACY" && (
              <button
                onClick={onStartOver}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors px-3 py-2 min-h-[44px] rounded hover:bg-[var(--color-primary-light)] flex items-center"
                aria-label="Start a new session"
              >
                Start over
              </button>
            )}
          </div>
        </div>

        {/* 3-stage progress indicator */}
        {showProgress && actInfo && (
          <div className="mt-3 flex items-center gap-2">
            {STAGES.map((stage, index) => {
              const isComplete = actInfo.actNumber > stage.num;
              const isCurrent = actInfo.actNumber === stage.num;
              const isPending = actInfo.actNumber < stage.num;

              return (
                <div key={stage.num} className="flex items-center flex-1">
                  {/* Stage pill */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isComplete
                        ? "bg-[var(--color-success)] text-white"
                        : isCurrent
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{stage.num}</span>
                    )}
                    <span className="text-[10px] sm:text-xs">{stage.label}</span>
                  </div>

                  {/* Connector line */}
                  {index < STAGES.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isComplete ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
