const crypto = require('crypto');

function isValidToken(receivedToken, expectedToken) {
  if (typeof receivedToken !== 'string' || typeof expectedToken !== 'string') return false;
  const received = Buffer.from(receivedToken);
  const expected = Buffer.from(expectedToken);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function parseBody(body) {
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  if (typeof body === 'string') return JSON.parse(body);
  return body;
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  // Browser dan sebagian alat validasi URL mengakses endpoint dengan GET.
  // Ini hanya status publik; event pembayaran tetap wajib POST + token rahasia.
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, service: 'Miqatara Trakteer webhook' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const webhookToken = process.env.TRAKTEER_WEBHOOK_TOKEN;
  const receivedToken = req.headers['x-webhook-token'];

  if (!webhookToken) {
    // Konfigurasi salah tidak boleh dianggap sukses karena Trakteer akan
    // menonaktifkan webhook setelah beberapa kali pengiriman gagal.
    console.error('TRAKTEER_WEBHOOK_TOKEN belum diatur di Vercel.');
    res.status(500).json({ error: 'Webhook belum dikonfigurasi' });
    return;
  }

  if (!isValidToken(receivedToken, webhookToken)) {
    res.status(401).json({ error: 'Token webhook tidak valid' });
    return;
  }

  let event;
  try {
    event = parseBody(req.body);
  } catch {
    res.status(400).json({ error: 'Payload JSON tidak valid' });
    return;
  }

  if (!event || event.type !== 'tip' || !event.transaction_id) {
    res.status(400).json({ error: 'Event Trakteer tidak dikenali' });
    return;
  }

  // Jangan mencatat nama, avatar, atau pesan pendukung di log publik.
  // Vercel log hanya menyimpan ID transaksi untuk keperluan penelusuran.
  console.log(`Tip Trakteer diterima: ${event.transaction_id}`);

  res.status(200).json({
    received: true,
    prayer: 'Jazakallahu khairan. Semoga Allah melancarkan dan memberkahi rezeki Anda. Aamiin.'
  });
};
