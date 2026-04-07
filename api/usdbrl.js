// Robust USD/BRL proxy with caching and 429 fallback
let cachedRate = null;
let lastFetch = 0;
const CACHE_DURATION = 60_000; // 60 seconds

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const now = Date.now();

  // Check if cache is valid
  if (cachedRate && now - lastFetch <= CACHE_DURATION) {
    return res.status(200).json({ rate: cachedRate, source: 'cache' });
  }

  try {
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
      headers: {
        'User-Agent': 'Mozilla/5.0' // optional but helps reduce trivial 429s
      }
    });

    if (!response.ok) {
      // If rate-limited (429) and we have cached data, return it
      if (response.status === 429 && cachedRate) {
        return res.status(200).json({ 
          rate: cachedRate, 
          warning: 'Rate limit hit, using cached value', 
          source: 'cache' 
        });
      }
      return res.status(response.status).json({ error: 'API error: ' + response.status });
    }

    const data = await response.json();
    cachedRate = parseFloat(data.USDBRL.bid);
    lastFetch = now;

    res.status(200).json({ rate: cachedRate, source: 'api' });

  } catch (e) {
    // If fetch fails but we have cached data, return it
    if (cachedRate) {
      return res.status(200).json({ 
        rate: cachedRate, 
        warning: 'Fetch failed, using cached value', 
        source: 'cache' 
      });
    }
    res.status(500).json({ error: e.message });
  }
};
