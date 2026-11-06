import { HOUSE_SAVINGS_FIELDS, toAmount } from '../domain/savings-calculator.js';
export function createHouseSavingsController({ repository, view }) {
  const currentValues = () => {
    const raw = view.readAll();
    return { ...Object.fromEntries(HOUSE_SAVINGS_FIELDS.map((field) => [field, toAmount(raw[field])])), forecast: raw.forecast };
  };
  return {
    async start() { view.apply(await repository.load()); view.render(); },
    preview() { view.render(); view.setStatus('Preview updated. Save to keep these figures.', { announce: false }); },
    async save() { await repository.save(currentValues()); },
  };
}
