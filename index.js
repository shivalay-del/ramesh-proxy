const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.get('/balance', async (req, res) => {
  const loginUrl = "https://ramesh247.com/login";
  const dataUrl = "https://ramesh247.com/balance-refresh/1550/3";

  const session = await fetch(loginUrl);
  const html = await session.text();

  const $ = cheerio.load(html);
  const csrfToken = $('input[name="_token"]').val();

  const cookies = session.headers.raw()['set-cookie'].map(c => c.split(';')[0]).join('; ');

  const login = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Cookie': cookies,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      _token: csrfToken,
      username: 'RD491',
      password: 'Shivalay0261@s'
    }),
    redirect: 'manual'
  });

  const allCookies = login.headers.raw()['set-cookie']
    ? cookies + '; ' + login.headers.raw()['set-cookie'].map(c => c.split(';')[0]).join('; ')
    : cookies;

  const data = await fetch(dataUrl, {
    method: 'GET',
    headers: {
      'Cookie': allCookies,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  const result = await data.json();
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
