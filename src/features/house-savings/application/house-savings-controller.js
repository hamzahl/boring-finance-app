import { HOUSE_SAVINGS_FIELDS, toAmount } from '../domain/savings-calculator.js';
export function createHouseSavingsController({ repository, view }) {
  const currentValues = () => Object.fromEntries(HOUSE_SAVINGS_FIELDS.map((field) => [field, toAmount(view.read(field))]));
  return {
    async start() { view.apply(await repository.load()); view.render(); },
    preview() { view.render(); view.setStatus('Preview updated. Save to update your data store.', { announce: false }); },
    async save() { await repository.save(currentValues()); view.setStatus(`Saved to your data store at ${new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(new Date())}.`); },
  };
}
