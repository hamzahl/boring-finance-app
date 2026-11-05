export const HOUSE_SAVINGS_FIELDS = ['goal', 'starling', 'savings', 'htb', 'lisa'];
const ACCOUNT_FIELDS = HOUSE_SAVINGS_FIELDS.slice(1);
export function toAmount(value) { return Math.max(0, Number.parseFloat(value) || 0); }
export function calculateSavings(values) {
  const goal = toAmount(values.goal);
  const total = ACCOUNT_FIELDS.reduce((sum, field) => sum + toAmount(values[field]), 0);
  const progress = goal === 0 ? 0 : Math.min((total / goal) * 100, 100);
  return { goal, total, progress, remaining: Math.max(goal - total, 0) };
}
