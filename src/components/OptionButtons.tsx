"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, FormEvent } from "react";

interface Props {
  options: { label: string; value: string }[];
  onSelect: (value: string, label: string) => void;
}

export default function OptionButtons({ options, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const buttons = container.querySelectorAll<HTMLButtonElement>("button:not(.custom-submit)");
      const currentIndex = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement);

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        buttons[nextIndex]?.focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        buttons[prevIndex]?.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [options]);

  // Focus input when showing custom input
  useEffect(() => {
    if (showCustomInput) {
      inputRef.current?.focus();
    }
  }, [showCustomInput]);

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (customValue.trim()) {
      onSelect(customValue.trim(), customValue.trim());
      setCustomValue("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="flex flex-col sm:flex-row sm:flex-wrap gap-3"
        role="group"
        aria-label="Choose an option"
      >
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(option.value, option.label)}
            className="btn-option sm:flex-1 sm:min-w-[calc(50%-0.375rem)] break-words"
            tabIndex={0}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Custom input toggle and field */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: options.length * 0.08 }}
      >
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors min-h-[44px] py-2"
          >
            Or type your own response...
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl
                         text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
                         focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <button
              type="submit"
              disabled={!customValue.trim()}
              className="custom-submit btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
