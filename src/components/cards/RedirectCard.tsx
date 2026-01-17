import { Card } from "@/lib/types";

export default function RedirectCard({ title, content }: Card) {
  return (
    <div className="bg-amber-50 border-l-4 border-[var(--color-warning)] rounded-xl p-5" role="alert">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-[var(--color-warning)] mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-[var(--color-warning)] font-semibold mb-1">
            {title || "Let's try a different direction"}
          </p>
          {content && (
            <p className="text-[var(--color-text-muted)] text-sm">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
