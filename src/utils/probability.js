/**
 * Clamp probability value to valid range [0, 1]
 * Handles null, undefined, NaN, and extremely small values
 * @param {number|null|undefined} v - The probability value to clamp
 * @returns {number} - Clamped value between 0 and 1
 */
export function clampProbability(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return 0;
  const n = Number(v);
  if (!isFinite(n)) return 0;
  if (Math.abs(n) < 1e-6) return 0; // valores extremamente pequenos tratados como 0
  return Math.max(0, Math.min(1, n));
}

/**
 * Format probability value as percentage string
 * @param {number|null|undefined} v - The probability value to format
 * @param {number} digits - Number of decimal places (default: 0)
 * @returns {string} - Formatted percentage string (e.g., "74%")
 */
export function formatProbabilityPct(v, digits = 0) {
  const pct = Math.round(clampProbability(v) * 100);
  return `${pct.toFixed(digits)}%`;
}
