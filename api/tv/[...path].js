export default async function handler(req, res) {
  // Extract path from req.query.path
  const pathParam = req.query.path;
  const subPath = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '');
  const targetUrl = `https://scanner.tradingview.com/${subPath}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.tradingview.com',
        'Origin': 'https://www.tradingview.com',
      },
    };

    if (req.method === 'POST') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(targetUrl, fetchOptions);
    const data = await upstreamRes.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=5');

    return res.status(upstreamRes.status).json(data);
  } catch (error) {
    console.error('TradingView proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal proxy error' });
  }
}
