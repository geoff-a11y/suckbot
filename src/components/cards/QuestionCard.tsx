import { Card } from "@/lib/types";

export default function QuestionCard({ title, content, subcontent }: Card) {
  return (
    <div className="card p-6 shadow-sm">
      {title && (
        <h3 className="font-heading text-xl text-[var(--color-text)] mb-3">{title}</h3>
      )}
      {content && (
        <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">{content}</p>
      )}
      {subcontent && (
        <p className="text-[var(--color-text)] italic leading-relaxed">{subcontent}</p>
      )}
    </div>
  );
}
