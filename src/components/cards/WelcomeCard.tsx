import { Card } from "@/lib/types";

export default function WelcomeCard({ title, content }: Card) {
  return (
    <div className="card p-8 text-center shadow-md">
      <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
        <span className="text-white font-bold text-3xl">S</span>
      </div>
      <h1 className="font-heading text-3xl text-[var(--color-text)] mb-3">
        {title || "Welcome to Suckbot."}
      </h1>
      <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
        {content ||
          "I help organizations find what sucks most and make it great. This is a safe space to be honest about what's broken."}
      </p>
    </div>
  );
}
