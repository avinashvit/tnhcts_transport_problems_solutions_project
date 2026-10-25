export default async function handler(req, res) {
  // Set CORS headers for cloud deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader =
      req.headers['authorization'] ||
      req.headers['Authorization'] ||
      'THyxfi7im8e8RvU77rD0CJJmcYvQBKzw9EVybJvIJxyRzsLFzK3XbFKStVwphPITQChS5OgzJzsQPjQo';

    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        bodyData = Object.fromEntries(new URLSearchParams(bodyData));
      }
    }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData || {}),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Vercel API error in /api/fast2sms:', error);
    return res.status(500).json({ error: error.message || 'Internal Fast2SMS proxy error' });
  }
}
