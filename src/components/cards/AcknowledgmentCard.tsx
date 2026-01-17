import { Card } from "@/lib/types";

export default function AcknowledgmentCard({ content, subcontent }: Card) {
  return (
    <div className="bg-[var(--color-primary-light)] rounded-xl p-5 border-l-4 border-[var(--color-primary)]">
      <p className="text-[var(--color-text)] leading-relaxed">
        {content}
      </p>
      {subcontent && (
        <p className="text-[var(--color-text-muted)] text-sm mt-2 italic">
          {subcontent}
        </p>
      )}
    </div>
  );
}
