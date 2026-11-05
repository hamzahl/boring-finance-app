const LOCAL_STORAGE_KEY = 'keys-to-home-v1';
const ACCESS_KEY_STORAGE = 'keys-to-home-access-key-v1';
const VALUES_ENDPOINT = '/api/values';
function readLocal() { try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}'); } catch { return {}; } }
function writeLocal(values) { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values)); }
function getAccessKey() {
  const saved = localStorage.getItem(ACCESS_KEY_STORAGE); if (saved) return saved;
  const entered = window.prompt('Enter your dashboard access key to load your savings.'); if (!entered) return null;
  const key = entered.trim(); localStorage.setItem(ACCESS_KEY_STORAGE, key); return key;
}
async function request(method, values) {
  const key = getAccessKey(); if (!key) throw new Error('An access key is required.');
  const response = await fetch(VALUES_ENDPOINT, { method, headers: { 'Content-Type': 'application/json', 'X-Dashboard-Access-Key': key }, body: values ? JSON.stringify({ values }) : undefined });
  const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || 'The datastore could not be reached.'); return payload;
}
export function createHouseSavingsRepository() {
  return {
    async load() { const fallback = readLocal(); try { const { values } = await request('GET'); if (values) writeLocal(values); return { values: values || fallback, status: values ? 'Loaded from your data store.' : 'No saved values yet — add your figures and save.' }; } catch (error) { return { values: fallback, status: `${error.message} Using this device’s last saved values.` }; } },
    async save(values) { writeLocal(values); try { await request('PUT', values); } catch (error) { throw new Error(`${error.message} A local backup was saved on this device.`); } },
  };
}
