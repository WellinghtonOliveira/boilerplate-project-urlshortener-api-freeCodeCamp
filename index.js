require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

/** ---- URL Shortener ---- **/

// armazenamento simples em memória
let urlDatabase = {};
let counter = 1;

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // validar URL usando regex + dns
  const urlRegex = /^https?:\/\/(www\.)?.+/i;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // validar domínio real com dns.lookup
  const hostname = urlParser.parse(originalUrl).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // salvar no "banco"
      const shortUrl = counter;
      urlDatabase[shortUrl] = originalUrl;
      counter++;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    }
  });
});

// GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
