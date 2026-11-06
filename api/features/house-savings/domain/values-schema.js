export const VALUE_FIELDS = ['goal', 'starling', 'savings', 'htb', 'lisa'];
const cleanSchedule = (value) => ({ amount: Math.max(0, Number(value?.amount) || 0), cadence: ['weekly','fortnightly','four-weekly','monthly','annual-4000'].includes(value?.cadence) ? value.cadence : 'monthly', nextDate: /^\d{4}-\d{2}-\d{2}$/.test(value?.nextDate || '') ? value.nextDate : '' });
function cleanForecast(value) { if (!value || typeof value !== 'object') return undefined; return { propertyPrice: Math.max(0, Number(value.propertyPrice) || 0), depositPercentage: Math.min(100, Math.max(0, Number(value.depositPercentage) || 0)), postcode: typeof value.postcode === 'string' ? value.postcode.slice(0, 12) : '', lisaFirstPaymentDate: /^\d{4}-\d{2}-\d{2}$/.test(value.lisaFirstPaymentDate || '') ? value.lisaFirstPaymentDate : '', lisaContributedThisTaxYear: Math.max(0, Number(value.lisaContributedThisTaxYear) || 0), htbPersonalContributions: Math.max(0, Number(value.htbPersonalContributions) || 0), schedules: Object.fromEntries(['starling','savings','htb','lisa'].map((name) => [name, cleanSchedule(value.schedules?.[name])])) }; }

export function normaliseValues(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const values = {};
  for (const field of VALUE_FIELDS) {
    const value = Number(input[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100000000) return null;
    values[field] = value;
  }
  const forecast = cleanForecast(input.forecast); if (forecast) values.forecast = forecast;
  return values;
}
