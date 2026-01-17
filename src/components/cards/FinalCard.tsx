import { Card } from "@/lib/types";

export default function FinalCard({ title, content }: Card) {
  return (
    <div className="bg-[var(--color-primary)] rounded-2xl p-8 text-center">
      <p className="text-white text-xl font-heading mb-4">
        {title || "The thing that sucked? It's about to suck a lot less."}
      </p>
      {content && (
        <p className="text-white/80 mb-6">{content}</p>
      )}
      <div className="space-y-3">
        <a
          href="https://calendly.com/geoff-human-machines/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-[var(--color-primary)] px-6 py-3 rounded-full font-semibold
                     hover:bg-white/90 transition-colors"
        >
          Book a call with Geoff Gibbins
        </a>
        <p className="text-white/70 text-sm">
          Or reach out at{" "}
          <a
            href="mailto:hello@human-machines.com"
            className="text-white underline"
          >
            hello@human-machines.com
          </a>
        </p>
      </div>
    </div>
  );
}
