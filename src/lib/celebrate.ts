import confetti from "canvas-confetti";

const COLORS = ["#f97316", "#fdba74", "#173663", "#10b981", "#facc15"];

/** Konfety, když se něco povede. Respektuje „omezit pohyb“ v systému. */
export function celebrate(size: "small" | "big" = "big") {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  if (size === "small") {
    confetti({ particleCount: 70, spread: 70, startVelocity: 35, origin: { y: 0.7 }, colors: COLORS });
    return;
  }
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: COLORS });
  const end = Date.now() + 1000;
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors: COLORS });
    confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
