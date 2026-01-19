"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

export default function EmailModal({ isOpen, onClose, onSubmit, isLoading = false }: Props) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    await onSubmit(email.trim());
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--color-text)]/70 flex items-center justify-center z-50 p-5"
          onClick={!isLoading ? onClose : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--color-surface)] rounded-2xl p-5 sm:p-8 max-w-md w-full shadow-xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" className="font-heading text-2xl text-[var(--color-text)] mb-3">
              Get Your Complete Report
            </h2>

            <p className="text-[var(--color-text-muted)] mb-6">
              Your report includes your Suck Audit, full Autopsy findings, and
              De-Suckification blueprint with workflow design.
            </p>

            <div className="bg-[var(--color-primary-light)] rounded-xl p-4 mb-6">
              <p className="text-sm text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text)]">How we protect your privacy</strong>
                <br />
                <br />
                Your report is created on your device, not our servers. We send
                it to your email, then your responses and your email go to
                separate places that can never be connected.
                <br />
                <br />
                Even we can&apos;t tell which responses came from which email address.
                That&apos;s the point.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="email-input" className="sr-only">
                  Email address
                </label>
                <input
                  ref={inputRef}
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                  className={`w-full px-4 py-3 border rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${emailError
                               ? "border-red-400 focus:border-red-400"
                               : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
                             }`}
                />
                {emailError && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  "Send My Report"
                )}
              </button>
            </form>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full mt-3 py-3 min-h-[44px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
