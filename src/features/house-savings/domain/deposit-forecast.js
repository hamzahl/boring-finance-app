import { ACCOUNT_FIELDS, toAmount } from './savings-calculator.js';

const DAY = 86400000, LISA_LIMIT = 4000, BONUS_DELAY = 42, HTB_LIMIT = 200, HTB_CAP = 3000;
const date = (value) => value && !Number.isNaN(new Date(`${value}T12:00:00`).valueOf()) ? new Date(`${value}T12:00:00`) : null;
const iso = (value) => value.toISOString().slice(0, 10);
const addDays = (value, days) => new Date(value.valueOf() + days * DAY);
const addMonths = (value, months) => { const next = new Date(value); next.setMonth(next.getMonth() + months); return next; };
const taxYear = (value) => `${value.getFullYear() - (value.getMonth() < 3 || value.getMonth() === 3 && value.getDate() < 6 ? 1 : 0)}`;
const month = (value) => `${value.getFullYear()}-${value.getMonth()}`;
const step = { weekly: 7, fortnightly: 14, 'four-weekly': 28 };
export function isLondonPostcode(value) { return /^(E|EC|N|NW|SE|SW|W|WC)\d/i.test(String(value || '').trim()); }
const nextDate = (value, cadence) => cadence === 'monthly' ? addMonths(value, 1) : addDays(value, step[cadence] || 30);
const targetFor = (values, forecast) => toAmount(forecast.propertyPrice) && toAmount(forecast.depositPercentage) ? toAmount(forecast.propertyPrice) * toAmount(forecast.depositPercentage) / 100 : toAmount(values.goal);

export function calculateDepositForecast(values, forecast = {}, today = new Date()) {
  const target = targetFor(values, forecast);
  if (!target) return { status: 'needs-input', warnings: ['Add a property price and deposit percentage to estimate a date.'] };
  const price = toAmount(forecast.propertyPrice), hasLISA = toAmount(values.lisa) > 0 || Boolean(forecast.lisaFirstPaymentDate) || toAmount(forecast.schedules?.lisa?.amount) > 0;
  const lisaCharge = hasLISA && price > 450000, lisaFactor = lisaCharge ? .8 : 1;
  const base = Object.fromEntries(ACCOUNT_FIELDS.map((name) => [name, toAmount(values[name])]));
  let total = base.starling + base.savings + base.htb + base.lisa * lisaFactor, contributions = 0, lisaBonus = 0, htbPersonal = toAmount(forecast.htbPersonalContributions);
  const lisaPaid = { [taxYear(today)]: toAmount(forecast.lisaContributedThisTaxYear) }, htbPaid = {};
  const accessDate = date(forecast.lisaFirstPaymentDate) ? addMonths(date(forecast.lisaFirstPaymentDate), 12) : null;
  const london = isLondonPostcode(forecast.postcode), htbPriceLimit = london ? 450000 : 250000;
  const warnings = [hasLISA ? 'Your LISA is the selected bonus route, so Help to Buy savings count as cash but its government bonus is not included.' : '', lisaCharge ? 'This property is above the £450,000 LISA limit. The forecast applies a 20% withdrawal charge to LISA funds.' : ''].filter(Boolean);
  const events = ACCOUNT_FIELDS.map((account) => { const s = forecast.schedules?.[account] || {}, when = date(s.nextDate), annualLisaPlan = account === 'lisa' && s.cadence === 'annual-4000', amount = annualLisaPlan ? 4000 / 12 : toAmount(s.amount); return when && amount ? { type: 'payment', account, amount, cadence: annualLisaPlan ? 'monthly' : (s.cadence || 'monthly'), when } : null; }).filter(Boolean);
  const outcome = (when) => {
    const htbBonus = !hasLISA && price && price <= htbPriceLimit && htbPersonal >= 1600 ? Math.min(HTB_CAP, htbPersonal * .25) : 0;
    if (total + htbBonus < target) return null;
    const ready = hasLISA && accessDate && when < accessDate ? accessDate : when;
    return { status: 'ready', target, date: iso(ready), monthsRemaining: Math.max(0, Math.ceil((ready - today) / (30.44 * DAY))), total: total + htbBonus, baseSavings: base.starling + base.savings + base.htb + base.lisa, projectedContributions: contributions, lisaBonus, htbBonus, governmentBonus: lisaBonus + htbBonus, withdrawalCharge: lisaCharge ? (base.lisa * .2) : 0, warnings };
  };
  if (outcome(today)) return outcome(today);
  const end = addMonths(today, 240);
  while (events.length) {
    events.sort((a, b) => a.when - b.when); const event = events.shift(); if (event.when > end) break;
    if (event.type === 'bonus') { total += event.amount * lisaFactor; lisaBonus += event.amount * lisaFactor; }
    else { total += event.amount * (event.account === 'lisa' ? lisaFactor : 1); contributions += event.amount;
      if (event.account === 'lisa') { const year = taxYear(event.when), eligible = Math.min(event.amount, Math.max(0, LISA_LIMIT - (lisaPaid[year] || 0))); lisaPaid[year] = (lisaPaid[year] || 0) + eligible; if (eligible) events.push({ type: 'bonus', amount: eligible * .25, when: addDays(event.when, BONUS_DELAY) }); }
      if (event.account === 'htb') { const key = month(event.when), eligible = Math.min(event.amount, Math.max(0, HTB_LIMIT - (htbPaid[key] || 0))); htbPaid[key] = (htbPaid[key] || 0) + eligible; htbPersonal += eligible; }
      events.push({ ...event, when: nextDate(event.when, event.cadence) }); }
    const found = outcome(event.when); if (found) return found;
  }
  return { status: 'unreachable', target, baseSavings: base.starling + base.savings + base.htb + base.lisa, projectedContributions: contributions, lisaBonus, warnings: [...warnings, 'The target is not reached within the next 20 years using the saved schedule.'] };
}
