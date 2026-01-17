import { Card, OutcomeWorkflow } from "@/lib/types";

interface WorkflowData {
  workflows?: OutcomeWorkflow[];
}

export default function WorkflowDesignCard({ title, data }: Card) {
  const workflowData = data as WorkflowData | undefined;
  const workflows = workflowData?.workflows || [];

  if (workflows.length === 0) return null;

  return (
    <div className="card p-6 shadow-sm overflow-x-auto">
      <h3 className="font-heading text-xl text-[var(--color-text)] mb-4">
        {title || "Workflow Design"}
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-primary)] text-white">
            <th className="px-3 py-2 text-left rounded-tl-lg">Outcome</th>
            <th className="px-3 py-2 text-left">Mode</th>
            <th className="px-3 py-2 text-left">AI Does</th>
            <th className="px-3 py-2 text-left rounded-tr-lg">Human Does</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((w, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-[var(--color-surface-alt)]" : "bg-[var(--color-surface)]"}
            >
              <td className="px-3 py-2 text-[var(--color-text)]">{w.outcome}</td>
              <td className="px-3 py-2 text-[var(--color-text)] capitalize">{w.mode}</td>
              <td className="px-3 py-2 text-[var(--color-text-muted)]">{w.aiDoes}</td>
              <td className="px-3 py-2 text-[var(--color-text-muted)]">{w.humanDoes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
