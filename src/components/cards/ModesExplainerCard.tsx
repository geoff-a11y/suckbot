import { Card } from "@/lib/types";

interface Mode {
  name: string;
  icon?: string;
  emoji?: string; // Legacy support
  description: string;
}

interface ModesData {
  modes?: Mode[];
}

function ModeIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "check":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "eye":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "auto":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    default:
      return <span className="text-sm font-bold">{icon.charAt(0).toUpperCase()}</span>;
  }
}

export default function ModesExplainerCard({ title, content, data }: Card) {
  const modesData = data as ModesData | undefined;
  const modes = modesData?.modes || [];

  return (
    <div className="card p-6 shadow-sm">
      <h3 className="font-heading text-xl text-[var(--color-text)] mb-2">
        {title || "The Four Collaboration Modes"}
      </h3>
      {content && (
        <p className="text-[var(--color-text-muted)] mb-5">{content}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map((mode, index) => (
          <div
            key={index}
            className="flex gap-3 p-4 bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)]"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-primary)] text-white rounded-lg flex items-center justify-center">
              {mode.icon ? <ModeIcon icon={mode.icon} /> : mode.emoji || mode.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--color-text)] text-sm">
                {mode.name}
              </p>
              <p className="text-[var(--color-text-muted)] text-xs mt-0.5 leading-relaxed">
                {mode.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
