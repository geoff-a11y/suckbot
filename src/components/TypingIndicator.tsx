export default function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-5 py-4 bg-[var(--color-surface-alt)] rounded-2xl w-fit">
      <span
        className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce"
        style={{ animationDelay: "0s", animationDuration: "0.6s" }}
      />
      <span
        className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce"
        style={{ animationDelay: "0.15s", animationDuration: "0.6s" }}
      />
      <span
        className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce"
        style={{ animationDelay: "0.3s", animationDuration: "0.6s" }}
      />
    </div>
  );
}
