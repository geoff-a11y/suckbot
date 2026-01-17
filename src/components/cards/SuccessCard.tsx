import { Card } from "@/lib/types";

export default function SuccessCard({ title, content }: Card) {
  return (
    <div className="bg-green-50 border-l-4 border-[var(--color-success)] rounded-xl p-5" role="status">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-[var(--color-success)] mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-[var(--color-success)] font-semibold mb-1">{title || "Success"}</p>
          {content && <p className="text-[var(--color-text-muted)] text-sm">{content}</p>}
        </div>
      </div>
    </div>
  );
}
