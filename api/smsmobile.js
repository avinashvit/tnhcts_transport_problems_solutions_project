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
    let apikey = '';
    let recipients = '';
    let message = '';
    let sendwa = '1';

    // Handle parsed JSON or URL-encoded form body
    if (typeof req.body === 'object' && req.body !== null) {
      apikey = req.body.apikey;
      recipients = req.body.recipients;
      message = req.body.message;
      sendwa = req.body.sendwa !== undefined ? String(req.body.sendwa) : '1';
    } else if (typeof req.body === 'string') {
      const parsed = new URLSearchParams(req.body);
      apikey = parsed.get('apikey') || '';
      recipients = parsed.get('recipients') || '';
      message = parsed.get('message') || '';
      sendwa = parsed.get('sendwa') || '1';
    }

    if (!apikey) {
      apikey = 'a77a44e7ef42e9b6d65b29691c9bd9b8f90e11b128a3aded';
    }

    const forwardParams = new URLSearchParams({
      apikey,
      recipients: recipients || '',
      message: message || '',
      sendwa,
    });

    const response = await fetch('https://api.smsmobileapi.com/sendsms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: forwardParams.toString(),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Vercel API error in /api/smsmobile:', error);
    return res.status(500).json({ error: error.message || 'Internal SMS proxy error' });
  }
}
