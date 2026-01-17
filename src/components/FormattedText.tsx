"use client";

import { ReactElement } from "react";

interface Props {
  text: string;
  className?: string;
}

export default function FormattedText({ text, className = "" }: Props) {
  // Parse markdown-style formatting into React elements
  const parseInlineFormatting = (input: string) => {
    const parts: (string | ReactElement)[] = [];
    let keyIndex = 0;

    // Pattern for **bold** text
    const boldPattern = /\*\*(.+?)\*\*/g;

    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(input)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(input.slice(lastIndex, match.index));
      }

      // Add the bold text
      parts.push(
        <strong key={keyIndex++} className="font-semibold text-[var(--color-text)]">
          {match[1]}
        </strong>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < input.length) {
      parts.push(input.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [input];
  };

  // Split by newlines and process each line
  const lines = text.split('\n');

  // Check if we have a bullet list (lines starting with • or - or *)
  const bulletLines = lines.filter(line => /^[•\-\*]\s/.test(line.trim()));
  const hasBulletList = bulletLines.length >= 2;

  if (hasBulletList) {
    // Separate intro text from bullet items
    const introLines: string[] = [];
    const bulletItems: string[] = [];
    let inBulletList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[•\-\*]\s/.test(trimmed)) {
        inBulletList = true;
        // Remove bullet and parse the content
        const content = trimmed.replace(/^[•\-\*]\s+/, '');
        bulletItems.push(content);
      } else if (!inBulletList && trimmed) {
        introLines.push(line);
      }
    }

    return (
      <div className={className}>
        {/* Intro text */}
        {introLines.length > 0 && (
          <div className="mb-4">
            {introLines.map((line, i) => (
              <span key={i}>
                {parseInlineFormatting(line)}
                {i < introLines.length - 1 && <br />}
              </span>
            ))}
          </div>
        )}

        {/* Numbered cards for bullet items */}
        <div className="space-y-3">
          {bulletItems.map((item, index) => {
            // Split by em dash or colon to get title and description
            const dashMatch = item.match(/^(.+?)\s*[—–]\s*(.+)$/);
            const colonMatch = item.match(/^(.+?):\s*(.+)$/);
            const match = dashMatch || colonMatch;

            return (
              <div
                key={index}
                className="flex gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--color-primary)] text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  {match ? (
                    <>
                      <p className="font-semibold text-[var(--color-text)]">
                        {parseInlineFormatting(match[1])}
                      </p>
                      <p className="text-[var(--color-text-muted)] text-sm mt-1">
                        {parseInlineFormatting(match[2])}
                      </p>
                    </>
                  ) : (
                    <p className="text-[var(--color-text)]">
                      {parseInlineFormatting(item)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Regular text without bullet list
  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {parseInlineFormatting(line)}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
