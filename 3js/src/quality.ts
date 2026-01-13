export type Quality = "low" | "medium" | "high";

let current: Quality = "high";
const listeners = new Set<(q: Quality) => void>();

export function getQuality(): Quality {
  return current;
}

export function setQuality(q: Quality) {
  if (current === q) return;
  current = q;
  listeners.forEach((cb) => {
    try {
      cb(current);
    } catch (e) {
      // ignore
    }
  });
}

export function onQualityChange(cb: (q: Quality) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Multiplier applied to thresholds to bias selection.
 * Lower multiplier makes it easier to pick higher-detail (high quality).
 * high -> 0.5 (more likely to pick high LOD)
 * medium -> 1.0
 * low -> 2.0 (harder to pick high LOD)
 */
export function qualityThresholdMultiplier(): number {
  switch (current) {
    case "high":
      return 0.5;
    case "medium":
      return 1.0;
    case "low":
      return 2.0;
    default:
      return 1.0;
  }
}
