/**
 * Grading scheme: q1, q2 and q3 are each marked out of 20 (total out of 60).
 * Percentage is computed against the 60-mark total.
 *
 * Grade letter is computed from a set of "bands" (grade + minimum
 * percentage), which are normally loaded from the database (see
 * src/utils/lookups.ts -> getDefaultGradingBands). FALLBACK_BANDS is used
 * only if no grading scheme has been configured yet, so the app still
 * works out of the box before an admin sets one up.
 */
const MAX_TOTAL = 60;

export interface GradingBand {
  grade: string;
  min_percentage: number;
}

export const FALLBACK_BANDS: GradingBand[] = [
  { grade: 'O', min_percentage: 90 },
  { grade: 'A+', min_percentage: 80 },
  { grade: 'A', min_percentage: 70 },
  { grade: 'B+', min_percentage: 60 },
  { grade: 'B', min_percentage: 50 },
  { grade: 'C', min_percentage: 40 },
  { grade: 'F', min_percentage: 0 },
];

export function computeTotal(q1: number, q2: number, q3: number): number {
  return Number((q1 + q2 + q3).toFixed(2));
}

export function computeGrade(total: number, bands: GradingBand[] = FALLBACK_BANDS): string {
  const percentage = (total / MAX_TOTAL) * 100;
  const sorted = [...bands].sort((a, b) => b.min_percentage - a.min_percentage);
  for (const band of sorted) {
    if (percentage >= band.min_percentage) return band.grade;
  }
  return sorted[sorted.length - 1]?.grade ?? 'F';
}
