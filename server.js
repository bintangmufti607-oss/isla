const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function resolvePublicPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  const requestedPath = decodedPath === '/'
    ? '/index.html'
    : decodedPath === '/donasi'
      ? '/donasi.html'
      : decodedPath;
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) {
    return null;
  }

  return filePath;
}

function isAssetRequest(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  return Boolean(path.extname(pathname));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload terlalu besar'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Payload JSON tidak valid'));
      }
    });
    req.on('error', reject);
  });
}

function hasValidWebhookToken(receivedToken, expectedToken) {
  if (typeof receivedToken !== 'string' || typeof expectedToken !== 'string') return false;
  const received = Buffer.from(receivedToken);
  const expected = Buffer.from(expectedToken);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function handleTrakteerWebhook(req, res) {
  if (req.method === 'GET') {
    send(res, 200, JSON.stringify({ ok: true, service: 'Miqatara Trakteer webhook' }), 'application/json; charset=utf-8');
    return;
  }

  if (req.method !== 'POST') {
    send(res, 405, 'Method Not Allowed');
    return;
  }

  const webhookToken = process.env.TRAKTEER_WEBHOOK_TOKEN;
  if (!webhookToken) {
    console.error('TRAKTEER_WEBHOOK_TOKEN belum diatur di Vercel.');
    send(res, 500, 'Webhook belum dikonfigurasi');
    return;
  }

  if (!hasValidWebhookToken(req.headers['x-webhook-token'], webhookToken)) {
    send(res, 401, 'Token webhook tidak valid');
    return;
  }

  try {
    const event = await readJsonBody(req);
    if (!event || event.type !== 'tip' || !event.transaction_id) {
      send(res, 400, 'Event Trakteer tidak dikenali');
      return;
    }

    // Simpan informasi sensitif pendukung di luar log. ID transaksi cukup
    // untuk menelusuri pengiriman webhook bila diperlukan.
    console.log(`Tip Trakteer diterima: ${event.transaction_id}`);
    send(res, 200, JSON.stringify({
      received: true,
      prayer: 'Jazakallahu khairan. Semoga Allah melancarkan dan memberkahi rezeki Anda. Aamiin.'
    }), 'application/json; charset=utf-8');
  } catch (error) {
    console.error('Webhook Trakteer gagal diproses:', error.message);
    send(res, 400, 'Payload JSON tidak valid');
  }
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).pathname;
  if (pathname === '/api/trakteer-webhook') {
    handleTrakteerWebhook(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed');
    return;
  }

  if (req.url === '/health') {
    send(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8');
    return;
  }

  const filePath = resolvePublicPath(req.url || '/');
  if (!filePath) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    // Jangan mengirim index.html untuk aset yang hilang. Respons HTML pada
    // permintaan .js menyebabkan browser berhenti dengan SyntaxError yang sulit dilacak.
    if (statError && isAssetRequest(req.url || '/')) {
      send(res, 404, 'Not Found');
      return;
    }

    const fallbackToIndex = statError || !stats.isFile();
    const finalPath = fallbackToIndex ? path.join(ROOT, 'index.html') : filePath;
    const ext = path.extname(finalPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(finalPath, (readError, data) => {
      if (readError) {
        send(res, 500, 'Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Backend ready: http://localhost:${PORT}`);
  console.log(`TryCloudflare: cloudflared tunnel --url http://localhost:${PORT}`);
});
