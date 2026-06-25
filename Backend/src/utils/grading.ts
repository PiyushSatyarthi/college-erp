/**
 * Grading scheme: q1, q2 and q3 are each marked out of 20 (total out of 60).
 * Percentage is computed against the 60-mark total and mapped to a letter
 * grade using a standard Indian college grading scale.
 */
const MAX_TOTAL = 60;

export function computeTotal(q1: number, q2: number, q3: number): number {
  return Number((q1 + q2 + q3).toFixed(2));
}

export function computeGrade(total: number): string {
  const percentage = (total / MAX_TOTAL) * 100;

  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  return 'F';
}
