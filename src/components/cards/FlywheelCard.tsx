import { Card } from "@/lib/types";

interface FlywheelItem {
  title: string;
  description: string;
}

interface FlywheelData {
  items?: FlywheelItem[];
}

export default function FlywheelCard({ title, content, data }: Card) {
  const flywheelData = data as FlywheelData | undefined;
  const items = flywheelData?.items || [];

  // Position items in a circle (top, right, bottom, left)
  const positions = [
    { top: "0%", left: "50%", transform: "translate(-50%, 0)" },
    { top: "50%", right: "0%", transform: "translate(0, -50%)" },
    { bottom: "0%", left: "50%", transform: "translate(-50%, 0)" },
    { top: "50%", left: "0%", transform: "translate(0, -50%)" },
  ];

  return (
    <div className="card p-6 shadow-sm">
      <h3 className="font-heading text-xl text-[var(--color-text)] mb-2">
        {title || "Learning Flywheel"}
      </h3>
      {content && (
        <p className="text-[var(--color-text-muted)] mb-6">{content}</p>
      )}

      {/* Flywheel visualization */}
      <div className="relative w-full max-w-md mx-auto aspect-square">
        {/* Center circle with arrows */}
        <div className="absolute inset-[25%] rounded-full border-2 border-dashed border-[var(--color-primary)]/30">
          {/* Clockwise arrows */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
          >
            {/* Arrow path - clockwise circle */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 6 3, 0 6"
                  fill="var(--color-primary)"
                  opacity="0.6"
                />
              </marker>
            </defs>
            {/* Top to right */}
            <path
              d="M 50 15 Q 80 15 85 50"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeOpacity="0.4"
              markerEnd="url(#arrowhead)"
            />
            {/* Right to bottom */}
            <path
              d="M 85 50 Q 85 85 50 85"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeOpacity="0.4"
              markerEnd="url(#arrowhead)"
            />
            {/* Bottom to left */}
            <path
              d="M 50 85 Q 15 85 15 50"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeOpacity="0.4"
              markerEnd="url(#arrowhead)"
            />
            {/* Left to top */}
            <path
              d="M 15 50 Q 15 15 50 15"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeOpacity="0.4"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </div>

        {/* Four items positioned around the flywheel */}
        {items.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className="absolute w-[42%]"
            style={{
              ...getPosition(index),
            }}
          >
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-md flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[var(--color-text-muted)] text-xs mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPosition(index: number): React.CSSProperties {
  switch (index) {
    case 0: // Top
      return { top: "0%", left: "29%", transform: "translateY(0)" };
    case 1: // Right
      return { top: "29%", right: "0%", transform: "translateX(0)" };
    case 2: // Bottom
      return { bottom: "0%", left: "29%", transform: "translateY(0)" };
    case 3: // Left
      return { top: "29%", left: "0%", transform: "translateX(0)" };
    default:
      return {};
  }
}
