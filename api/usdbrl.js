// Proxy USD/BRL — avoids TLS issues on old devices (same idea as weather.js)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  var url = 'https://api.frankfurter.app/latest?from=USD&to=BRL';

  try {
    var response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'exchange API error: ' + response.status });
    }

    var data = await response.json();

    res.status(200).json({
      rate: data.rates.BRL
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
