const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.get('/balance', async (req, res) => {
  const loginUrl = "https://ramesh247.com/login";
  const dataUrl = "https://ramesh247.com/balance-refresh/1550/3";
  const dashboardUrl = "https://ramesh247.com/home";

  const session = await fetch(loginUrl);
  const html = await session.text();

  const $ = cheerio.load(html);
  const csrfToken = $('input[name="_token"]').val();

  const initCookies = session.headers.raw()['set-cookie']
    .map(c => c.split(';')[0]).join('; ');

  const login = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Cookie': initCookies,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      _token: csrfToken,
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    }),
    redirect: 'manual'
  });

  const loginCookies = login.headers.raw()['set-cookie']
    ? login.headers.raw()['set-cookie'].map(c => c.split(';')[0]).join('; ')
    : "";

  const allCookies = [initCookies, loginCookies].filter(Boolean).join('; ');

  const dashboard = await fetch(dashboardUrl, {
    method: 'GET',
    headers: {
      'Cookie': allCookies
    }
  });

  const dashCookies = dashboard.headers.raw()['set-cookie']
    ? dashboard.headers.raw()['set-cookie'].map(c => c.split(';')[0]).join('; ')
    : "";

  const finalCookies = [allCookies, dashCookies].filter(Boolean).join('; ');

  const data = await fetch(dataUrl, {
    method: 'GET',
    headers: {
      'Cookie': finalCookies,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  const result = await data.text();
  res.send(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
