import { Card } from "@/lib/types";

export default function SectionHeader({ title, subcontent }: Card) {
  return (
    <div className="bg-[var(--color-primary)] rounded-2xl p-6 text-center">
      <h2 className="font-heading text-2xl text-white mb-2">{title}</h2>
      {subcontent && (
        <p className="text-white/70 text-sm">{subcontent}</p>
      )}
    </div>
  );
}
