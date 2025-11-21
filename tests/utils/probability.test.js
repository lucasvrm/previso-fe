import { clampProbability, formatProbabilityPct } from '../../src/utils/probability';

describe('clampProbability', () => {
  test('should return 0 for null', () => {
    expect(clampProbability(null)).toBe(0);
  });

  test('should return 0 for undefined', () => {
    expect(clampProbability(undefined)).toBe(0);
  });

  test('should return 0 for NaN', () => {
    expect(clampProbability(NaN)).toBe(0);
  });

  test('should return 0 for values less than 1e-6', () => {
    expect(clampProbability(1e-15)).toBe(0);
    expect(clampProbability(0.0000001)).toBe(0);
    expect(clampProbability(-1e-15)).toBe(0);
  });

  test('should clamp value to 0 for negative numbers below threshold', () => {
    expect(clampProbability(-0.5)).toBe(0);
    expect(clampProbability(-1)).toBe(0);
  });

  test('should clamp value to 1 for values greater than 1', () => {
    expect(clampProbability(1.2)).toBe(1);
    expect(clampProbability(5)).toBe(1);
  });

  test('should preserve valid probability values', () => {
    expect(clampProbability(0.739698277)).toBeCloseTo(0.739698277);
    expect(clampProbability(0.5)).toBe(0.5);
    expect(clampProbability(0)).toBe(0);
    expect(clampProbability(1)).toBe(1);
  });

  test('should return 0 for Infinity', () => {
    expect(clampProbability(Infinity)).toBe(0);
    expect(clampProbability(-Infinity)).toBe(0);
  });
});

describe('formatProbabilityPct', () => {
  test('should format 0.739698277 as "74%"', () => {
    expect(formatProbabilityPct(0.739698277)).toBe('74%');
  });

  test('should format 0.5 as "50%"', () => {
    expect(formatProbabilityPct(0.5)).toBe('50%');
  });

  test('should format 1 as "100%"', () => {
    expect(formatProbabilityPct(1)).toBe('100%');
  });

  test('should format 0 as "0%"', () => {
    expect(formatProbabilityPct(0)).toBe('0%');
  });

  test('should format values > 1 as "100%"', () => {
    expect(formatProbabilityPct(1.2)).toBe('100%');
  });

  test('should format tiny values as "0%"', () => {
    expect(formatProbabilityPct(1e-15)).toBe('0%');
  });

  test('should format null/undefined as "0%"', () => {
    expect(formatProbabilityPct(null)).toBe('0%');
    expect(formatProbabilityPct(undefined)).toBe('0%');
  });

  test('should respect custom digits parameter', () => {
    expect(formatProbabilityPct(0.7397, 0)).toBe('74%');
    expect(formatProbabilityPct(0.7397, 1)).toBe('74.0%');
    expect(formatProbabilityPct(0.7397, 2)).toBe('74.00%');
  });
});
