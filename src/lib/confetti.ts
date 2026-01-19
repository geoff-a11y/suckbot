import confetti from "canvas-confetti";

interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  shapes?: ("square" | "circle")[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

// Brand colors
const BRAND_PRIMARY = "#7877df";
const BRAND_SUCCESS = "#10B981";

export function triggerCelebration() {
  // Fire confetti from both sides - final celebration
  const count = 200;
  const defaults: ConfettiOptions = {
    origin: { y: 0.7 },
    colors: [BRAND_PRIMARY, BRAND_SUCCESS, "#F59E0B", "#3B82F6", "#EC4899"],
  };

  function fire(particleRatio: number, opts: ConfettiOptions) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function triggerSuccessSparkle() {
  // Smaller celebration for passing gates
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6, x: 0.5 },
    colors: [BRAND_SUCCESS, "#34D399", "#6EE7B7"],
    scalar: 0.8,
  });
}

export function triggerStageComplete() {
  // Mid-tier celebration for completing a major stage
  const count = 100;
  const defaults: ConfettiOptions = {
    origin: { y: 0.6 },
    colors: [BRAND_PRIMARY, BRAND_SUCCESS, "#34D399"],
    disableForReducedMotion: true,
  };

  // Fire from left
  confetti({
    ...defaults,
    particleCount: count / 2,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
  });

  // Fire from right
  confetti({
    ...defaults,
    particleCount: count / 2,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
  });
}
