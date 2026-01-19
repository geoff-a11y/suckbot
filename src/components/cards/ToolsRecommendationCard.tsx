import { Card } from "@/lib/types";

interface Tool {
  name: string;
  fit: string;
  why: string;
}

interface ToolsData {
  tools?: Tool[];
}

export default function ToolsRecommendationCard({ title, content, data }: Card) {
  const toolsData = data as ToolsData | undefined;
  const tools = toolsData?.tools || [];

  return (
    <div className="card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="font-heading text-xl text-[var(--color-text)]">
          {title || "Recommended Tools"}
        </h3>
      </div>
      {content && (
        <p className="text-[var(--color-text-muted)] mb-5">{content}</p>
      )}

      <div className="space-y-3">
        {tools.map((tool, index) => (
          <div
            key={index}
            className="p-4 bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)]"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-[var(--color-text)]">
                {tool.name}
              </p>
              <span className="flex-shrink-0 text-xs px-2 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full font-medium">
                {tool.fit}
              </span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              {tool.why}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
