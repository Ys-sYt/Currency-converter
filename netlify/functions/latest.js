const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const appId = process.env.OPENEXCHANGE_API_KEY; // Netlifyの環境変数
  const url = `https://openexchangerates.org/api/latest.json?app_id=${appId}`;
  const response = await fetch(url);
  const data = await response.text();
  return {
    statusCode: response.status,
    body: data,
    headers: {
      'Content-Type': 'application/json'
    }
  };
};