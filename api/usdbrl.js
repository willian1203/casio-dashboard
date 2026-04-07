module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // AwesomeAPI endpoint for latest USD → BRL
  const url = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'exchange API error: ' + response.status });
    }

    const data = await response.json();

    // AwesomeAPI returns USD_BRL object with "bid" as the current rate
    res.status(200).json({
      rate: parseFloat(data.USDBRL.bid) // convert string to number
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
