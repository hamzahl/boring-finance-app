export function createUpstashJsonStore() {
  async function command(command) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error('The Upstash datastore is not configured.');
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) });
    if (!response.ok) throw new Error(`Datastore request failed with ${response.status}.`);
    return response.json();
  }
  return {
    async read(key) { const result = await command(['GET', key]); return result.result ? JSON.parse(result.result) : null; },
    async write(key, value) { await command(['SET', key, JSON.stringify(value)]); return value; },
  };
}
