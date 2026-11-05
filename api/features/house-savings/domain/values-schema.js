export const VALUE_FIELDS = ['goal', 'starling', 'savings', 'htb', 'lisa'];

export function normaliseValues(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const values = {};
  for (const field of VALUE_FIELDS) {
    const value = Number(input[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100000000) return null;
    values[field] = value;
  }
  return values;
}
