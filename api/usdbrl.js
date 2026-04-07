// Proxy USD/BRL — avoids TLS issues on old devices
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const url = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });

    // Treat 304 (Not Modified) as valid — no body to parse
    if (response.status === 304) {
      return res.status(200).json({ message: 'Data not modified, use cached value' });
    }

    if (!response.ok) {
      return res.status(502).json({ error: 'exchange API error: ' + response.status });
    }

    const data = await response.json();

    res.status(200).json({
      rate: parseFloat(data.USDBRL.bid) // current USD → BRL
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
