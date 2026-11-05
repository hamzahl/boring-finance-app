import { normaliseValues } from '../domain/values-schema.js';

const STORE_KEY = 'dashboards:primary:values';

export function createHouseSavingsValuesService({ store }) {
  return {
    load() { return store.read(STORE_KEY); },
    async save(input) {
      const values = normaliseValues(input);
      if (!values) return null;
      await store.write(STORE_KEY, values);
      return values;
    },
  };
}
