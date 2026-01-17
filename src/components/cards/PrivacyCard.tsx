import { Card } from "@/lib/types";

export default function PrivacyCard({ content }: Card) {
  return (
    <div className="bg-[var(--color-primary-light)] border-l-4 border-[var(--color-primary)] rounded-xl p-5">
      <p className="text-[var(--color-primary)] font-semibold text-sm mb-2">Privacy First</p>
      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
        {content ||
          "Your responses are completely anonymous. We never ask for your company name or any identifying information. Anonymized quotes may appear in research reports but will never be tied to you or your organization."}
      </p>
    </div>
  );
}
