export default async function handler(req, res) {
  const pathParam = req.query.path;
  const subPath = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '');
  const queryIdx = req.url.indexOf('?');
  const queryString = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
  const targetUrl = `https://query1.finance.yahoo.com/${subPath}${queryString}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    const data = await upstreamRes.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');

    return res.status(upstreamRes.status).json(data);
  } catch (error) {
    console.error('Yahoo proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal proxy error' });
  }
}
