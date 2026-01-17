import { Card } from "@/lib/types";
import FormattedText from "../FormattedText";

interface AutopsyData {
  origin?: string;
  constraints?: string;
  assumptions?: string;
  workarounds?: string;
  stakeholders?: string;
  outcomes?: string;
}

export default function AutopsyReportCard({ title, content, subcontent, data }: Card) {
  const autopsy = data as AutopsyData | undefined;

  const sections = [
    { label: "Origin Story", value: autopsy?.origin },
    { label: "Ghost Constraints", value: autopsy?.constraints },
    { label: "Unquestioned Assumptions", value: autopsy?.assumptions },
    { label: "Workarounds & Hacks", value: autopsy?.workarounds },
    { label: "System Dynamics", value: autopsy?.stakeholders },
    { label: "True Outcomes", value: autopsy?.outcomes },
  ];

  const hasStructuredData = sections.some((s) => s.value);

  return (
    <div className="card p-6 shadow-sm">
      <h3 className="font-heading text-xl text-[var(--color-text)] mb-4">
        {title || "Why This Process Sucks So Much"}
      </h3>

      {hasStructuredData ? (
        <div className="space-y-4">
          {sections.map(
            (section) =>
              section.value && (
                <div
                  key={section.label}
                  className="bg-[var(--color-surface-alt)] rounded-lg p-4"
                >
                  <p className="text-[var(--color-primary)] text-xs font-semibold uppercase tracking-wide mb-1">
                    {section.label}
                  </p>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    {section.value}
                  </p>
                </div>
              )
          )}
        </div>
      ) : content ? (
        <FormattedText
          text={content}
          className="text-[var(--color-text-muted)] text-sm leading-relaxed"
        />
      ) : (
        <p className="text-[var(--color-text-muted)] text-sm italic">
          Autopsy findings will appear here...
        </p>
      )}

      {subcontent && (
        <p className="mt-4 text-[var(--color-text-muted)] text-sm">
          {subcontent}
        </p>
      )}
    </div>
  );
}
