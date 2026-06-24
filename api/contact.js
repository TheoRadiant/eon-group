const nodemailer = require('nodemailer');

const DEFAULT_TO_EMAIL = 'eongroupgr@gmail.com';
const DEFAULT_ALLOWED_ORIGINS = [
  'https://eon-group.vercel.app',
  'http://localhost:4200',
  'http://127.0.0.1:4200'
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAllowedOrigins() {
  const configuredOrigins = process.env.CONTACT_ALLOWED_ORIGINS;

  if (!configuredOrigins) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function applyCors(req, res) {
  const origin = req.headers.origin;

  if (origin && getAllowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJsonBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  let rawBody = '';

  for await (const chunk of req) {
    rawBody += chunk;
  }

  return rawBody ? JSON.parse(rawBody) : {};
}

function cleanText(value, maxLength) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanList(value, maxItems, maxLength) {
  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

module.exports = async function contactHandler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const honeypot = cleanText(body.company, 120);

    if (honeypot) {
      return res.status(200).json({ ok: true });
    }

    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 180);
    const phone = cleanText(body.phone, 80);
    const services = cleanList(body.services, 6, 80);
    const serviceSummary = services.length > 0 ? services.join(', ') : 'Not specified';
    const message = String(body.message ?? '').trim().slice(0, 5000);

    if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Invalid contact form payload' });
    }

    const smtpHost = requireEnv('SMTP_HOST');
    const smtpPort = Number(requireEnv('SMTP_PORT'));
    const smtpUser = requireEnv('SMTP_USER');
    const smtpPass = requireEnv('SMTP_PASS');
    const smtpSecure = String(process.env.SMTP_SECURE ?? smtpPort === 465).toLowerCase() === 'true';
    const toEmail = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
    const fromName = process.env.SMTP_FROM_NAME || 'EON Group Website';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const subject = `New website lead from ${name}`;
    const text = [
      'New contact form submission from eon-group.vercel.app',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Services: ${serviceSummary}`,
      '',
      'Message:',
      message
    ].join('\n');
    const html = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
      <p><strong>Services:</strong> ${escapeHtml(serviceSummary)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Unable to send contact email' });
  }
};
