import confetti from "canvas-confetti";

export function fireSaleConfetti() {
  if (typeof window === "undefined") return;

  // Multi-directional burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6"],
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#10B981", "#F59E0B", "#FBBF24"],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#10B981", "#F59E0B", "#FBBF24"],
    });
  }, 200);
}
