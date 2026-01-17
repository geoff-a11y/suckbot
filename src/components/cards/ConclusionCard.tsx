import { Card } from "@/lib/types";

export default function ConclusionCard({ title, content, subcontent }: Card) {
  return (
    <div className="card p-6 border-2 border-[var(--color-success)] shadow-lg">
      <p className="text-[var(--color-success)] text-xs font-semibold uppercase tracking-wide mb-2">
        {title || "Insight"}
      </p>
      <p className="text-[var(--color-text)] font-heading text-lg leading-relaxed">
        {content}
      </p>
      {subcontent && (
        <p className="text-[var(--color-text-muted)] text-sm mt-3">
          {subcontent}
        </p>
      )}
    </div>
  );
}
