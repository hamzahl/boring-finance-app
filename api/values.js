import { createHouseSavingsValuesService } from './features/house-savings/application/house-savings-values-service.js';
import { createUpstashJsonStore } from './infrastructure/upstash-json-store.js';

const valuesService = createHouseSavingsValuesService({ store: createUpstashJsonStore() });

function isAuthorised(request) {
  const accessKey = request.headers['x-dashboard-access-key'];
  return Boolean(process.env.DASHBOARD_ACCESS_KEY) && accessKey === process.env.DASHBOARD_ACCESS_KEY;
}

export default async function handler(request, response) {
  if (!isAuthorised(request)) return response.status(401).json({ error: 'Enter the dashboard access key to continue.' });
  try {
    if (request.method === 'GET') {
      return response.status(200).json({ values: await valuesService.load() });
    }
    if (request.method === 'PUT') {
      const values = await valuesService.save(request.body?.values);
      if (!values) return response.status(400).json({ error: 'Provide a non-negative number for every savings value.' });
      return response.status(200).json({ values });
    }
    response.setHeader('Allow', 'GET, PUT');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Unable to access the savings datastore.', error);
    return response.status(500).json({ error: 'Unable to access the savings datastore.' });
  }
}
