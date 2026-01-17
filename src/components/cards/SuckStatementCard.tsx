import { Card } from "@/lib/types";

export default function SuckStatementCard({ title, content, subcontent }: Card) {
  return (
    <div className="card p-6 border-2 border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/10">
      <p className="text-[var(--color-primary)] text-xs font-semibold uppercase tracking-wide mb-3">
        {title || "Your Suck Target"}
      </p>
      <p className="font-heading text-xl text-[var(--color-text)] mb-3 leading-relaxed">
        &quot;{content}&quot;
      </p>
      {subcontent && (
        <p className="text-[var(--color-text-muted)] text-sm">{subcontent}</p>
      )}
    </div>
  );
}
