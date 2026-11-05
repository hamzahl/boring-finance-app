import { byId } from '../../../core/browser/by-id.js';
import { formatCurrency } from '../../../core/format/currency.js';
import { HOUSE_SAVINGS_FIELDS, calculateSavings } from '../domain/savings-calculator.js';
export function createHouseSavingsView() {
  document.querySelector('.privacy-badge').textContent = '✦ saved to your data store';
  document.querySelector('.form-heading small').textContent = 'Preview updates live; save to sync them.';
  const input = Object.fromEntries(HOUSE_SAVINGS_FIELDS.map((field) => [field, byId(field)]));
  const output = { goal: byId('goalDisplay'), total: byId('totalDisplay'), fill: byId('progressFill'), bar: byId('progressBar'), percent: byId('percent'), remaining: byId('remaining'), encouragement: byId('encouragement'), setup: byId('setupPrompt'), status: byId('saveState'), form: byId('savingsForm') };
  const values = () => Object.fromEntries(HOUSE_SAVINGS_FIELDS.map((field) => [field, input[field].value]));
  return {
    read(field) { return input[field].value; },
    apply({ values: savedValues, status }) { HOUSE_SAVINGS_FIELDS.forEach((field) => { input[field].value = savedValues[field] ?? ''; }); this.setStatus(status); },
    render() { const { goal, total, progress, remaining } = calculateSavings(values()); const reached = goal > 0 && total >= goal; const rounded = Math.round(progress); output.goal.textContent = formatCurrency(goal); output.total.textContent = formatCurrency(total); output.fill.style.width = `${progress}%`; output.bar.setAttribute('aria-valuenow', rounded); output.bar.setAttribute('aria-valuetext', `${rounded}% towards your savings goal`); output.percent.textContent = `${rounded}% there`; output.remaining.textContent = reached ? 'Goal smashed! 🎉' : `${formatCurrency(remaining)} to go`; output.encouragement.textContent = reached ? 'You did it — time to celebrate that key moment.' : 'Every little bit is a brick in your future home.'; output.setup.hidden = goal > 0 || total > 0; },
    setStatus(message, { announce = true } = {}) { output.status.setAttribute('aria-live', announce ? 'polite' : 'off'); output.status.textContent = message; },
    onInput(handler) { HOUSE_SAVINGS_FIELDS.forEach((field) => input[field].addEventListener('input', handler)); },
    onSave(handler) { output.form.addEventListener('submit', handler); },
  };
}
