import { Card, Candidate } from "@/lib/types";

interface ComparisonData {
  candidates?: Candidate[];
  recommendation?: string;
}

export default function ComparisonTable({ title, data }: Card) {
  const comparisonData = data as ComparisonData | undefined;
  const candidates = comparisonData?.candidates || [];

  if (candidates.length === 0) return null;

  return (
    <div className="card p-6 shadow-sm overflow-x-auto">
      <h3 className="font-heading text-xl text-[var(--color-text)] mb-4">
        {title || "Candidate Comparison"}
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-primary)] text-white">
            <th className="px-3 py-2 text-left rounded-tl-lg">Candidate</th>
            <th className="px-3 py-2 text-left">Consensus</th>
            <th className="px-3 py-2 text-left">Strategic</th>
            <th className="px-3 py-2 text-left rounded-tr-lg">Previous Attempts</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-[var(--color-surface-alt)]" : "bg-[var(--color-surface)]"}
            >
              <td className="px-3 py-2 text-[var(--color-text)]">
                {candidate.text
                  ? (candidate.text.length > 40
                      ? candidate.text.substring(0, 40) + "..."
                      : candidate.text)
                  : "-"}
              </td>
              <td className="px-3 py-2 text-[var(--color-text-muted)] capitalize">
                {candidate.quickEval?.consensus || "-"}
              </td>
              <td className="px-3 py-2 text-[var(--color-text-muted)] capitalize">
                {candidate.quickEval?.strategic || "-"}
              </td>
              <td className="px-3 py-2 text-[var(--color-text-muted)] capitalize">
                {candidate.quickEval?.previousAttempts || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {comparisonData?.recommendation && (
        <p className="mt-4 text-[var(--color-text-muted)] text-sm">
          <strong className="text-[var(--color-primary)]">Recommendation:</strong>{" "}
          {comparisonData.recommendation}
        </p>
      )}
    </div>
  );
}
