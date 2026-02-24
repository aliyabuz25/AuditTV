import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import multer from 'multer';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const PORT = Number(process.env.PORT || 3001);
const DB_PATH = process.env.SQLITE_PATH || path.resolve(process.cwd(), 'data', 'site.db');
const SITEMAP_PATH = process.env.SITEMAP_FILE || path.resolve(process.cwd(), 'current-sitemap.json');
const DB_DIR = path.dirname(DB_PATH);
const SITEMAP_DIR = path.dirname(SITEMAP_PATH);
const SITEMAP_MIRROR_PATH =
  path.basename(SITEMAP_PATH) === 'sitemap-current.json'
    ? path.join(SITEMAP_DIR, 'current-sitemap.json')
    : path.join(SITEMAP_DIR, 'sitemap-current.json');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');

fs.mkdirSync(DB_DIR, { recursive: true });
fs.mkdirSync(SITEMAP_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    content_key TEXT PRIMARY KEY,
    content_value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS course_requests (
    email TEXT NOT NULL,
    full_name TEXT,
    password TEXT,
    course_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    timestamp TEXT NOT NULL,
    PRIMARY KEY (email, course_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    course_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    timestamp TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

try {
  db.prepare('ALTER TABLE course_requests ADD COLUMN created_at TEXT').run();
} catch {}

db.prepare("UPDATE course_requests SET created_at = ? WHERE created_at IS NULL OR TRIM(created_at) = ''").run(
  new Date().toISOString(),
);

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES admin_users(id)
  )
`);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, original] = String(storedHash || '').split(':');
  if (!salt || !original) return false;
  const next = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(original, 'hex'), Buffer.from(next, 'hex'));
}

function getSessionToken(req) {
  const auth = String(req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return String(req.headers['x-admin-token'] || '');
}

function getAdminFromToken(token) {
  if (!token) return null;
  return db
    .prepare(
      `SELECT u.id, u.username, u.display_name as displayName, u.role, u.is_active as isActive
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token);
}

function requireAdmin(req, res, next) {
  const token = getSessionToken(req);
  const user = getAdminFromToken(token);
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.adminUser = user;
  req.adminToken = token;
  next();
}

const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
if (!adminCount?.count) {
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO admin_users (username, password_hash, display_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run('admin', hashPassword('admin123'), 'Super Admin', 'super_admin', 1, now);
}

function readSitemapFromFile() {
  const candidates = [SITEMAP_PATH, SITEMAP_MIRROR_PATH];
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return fileContent.trim() ? JSON.parse(fileContent) : {};
    } catch {
      // Try next candidate
    }
  }
  return {};
}

function normalizeSitemap(raw) {
  const sitemap = raw && typeof raw === 'object' ? raw : {};
  const settings = sitemap.settings && typeof sitemap.settings === 'object' ? sitemap.settings : {};
  const footer = settings.footer && typeof settings.footer === 'object' ? settings.footer : {};
  const home = sitemap.home && typeof sitemap.home === 'object' ? sitemap.home : {};
  const benefit = home.benefit && typeof home.benefit === 'object' ? home.benefit : {};
  const clients = Array.isArray(sitemap.clients) ? sitemap.clients : [];

  return {
    ...sitemap,
    clients: clients.map((client, index) => {
      const row = client && typeof client === 'object' ? client : {};
      return {
        id: String(row.id || index + 1),
        name: String(row.name || ''),
        logoUrl: String(row.logoUrl || ''),
      };
    }),
    home: {
      ...home,
      benefit: {
        ...benefit,
        fileUrl: String(benefit.fileUrl || ''),
      },
    },
    settings: {
      ...settings,
      footer: {
        aboutText: 'Maliyyə savadlılığı və peşəkar inkişaf üçün onlayn media və tədris platforması.',
        platformTitle: 'Platforma',
        resourcesTitle: 'Resurslar',
        contactTitle: 'Əlaqə',
        address: 'Bakı şəhəri, Nizami küç. 14',
        phone: '+994 50 123 45 67',
        email: 'info@audit.tv',
        platformLinks: [
          { label: 'Haqqımızda', path: '/haqqimizda' },
          { label: 'Əlaqə', path: '/elaqe' },
        ],
        resourceLinks: [
          { label: 'Tədris Mərkəzi', path: '/tedris' },
          { label: 'Podcast', path: '/podcast' },
          { label: 'Blog', path: '/blog' },
        ],
        socialLinks: {
          linkedin: '#',
          facebook: '#',
          twitter: '#',
          email: 'mailto:info@audit.tv',
          ...(footer.socialLinks || {}),
        },
        copyrightText: 'audit.tv. All rights reserved.',
        privacyLabel: 'Məxfilik Siyasəti',
        privacyUrl: '/mexfilik-siyaseti',
        termsLabel: 'İstifadə Şərtləri',
        termsUrl: '/istifade-sertleri',
        ...footer,
      },
    },
  };
}

function writeSitemapFile(sitemap) {
  const targets = [SITEMAP_PATH, SITEMAP_MIRROR_PATH];
  for (const targetPath of targets) {
    const tmpPath = `${targetPath}.tmp`;
    fs.writeFileSync(tmpPath, `${JSON.stringify(sitemap, null, 2)}\n`, 'utf8');
    fs.renameSync(tmpPath, targetPath);
  }
}

function getStoredSitemap() {
  const row = db
    .prepare('SELECT content_value, updated_at FROM site_content WHERE content_key = ?')
    .get('current_sitemap');

  if (!row) {
    const initial = normalizeSitemap(readSitemapFromFile());
    const timestamp = new Date().toISOString();

    db.prepare(
      'INSERT OR REPLACE INTO site_content (content_key, content_value, updated_at) VALUES (?, ?, ?)',
    ).run('current_sitemap', JSON.stringify(initial), timestamp);

    writeSitemapFile(initial);
    return { sitemap: initial, updatedAt: timestamp };
  }

  try {
    return { sitemap: normalizeSitemap(JSON.parse(row.content_value)), updatedAt: row.updated_at };
  } catch {
    return { sitemap: normalizeSitemap({}), updatedAt: row.updated_at };
  }
}

function saveSitemap(sitemap) {
  const timestamp = new Date().toISOString();
  db.prepare(
    'INSERT OR REPLACE INTO site_content (content_key, content_value, updated_at) VALUES (?, ?, ?)',
  ).run('current_sitemap', JSON.stringify(sitemap), timestamp);

  writeSitemapFile(sitemap);
  return timestamp;
}

function asText(value) {
  return String(value || '').trim();
}

function buildAbsoluteUrl(req, relativeUrl) {
  if (PUBLIC_BASE_URL) {
    return `${PUBLIC_BASE_URL}${relativeUrl}`;
  }
  const host = req.get('host') || 'localhost';
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  const protocol = forwardedProto || req.protocol || 'http';
  return `${protocol}://${host}${relativeUrl}`;
}

function formatSubmissionType(type) {
  if (type === 'course') return 'Kurs müraciəti';
  if (type === 'contact') return 'Əlaqə formu';
  if (type === 'newsletter') return 'Newsletter abunəliyi';
  return 'Müraciət';
}

function getSubmissionRecipient(sitemap) {
  const settings = sitemap?.settings || {};
  const smtp = settings.smtp || {};
  return asText(smtp.notifyEmail || settings.footer?.email || sitemap?.contact?.email);
}

function getSmtpSettings(sitemap) {
  const smtp = sitemap?.settings?.smtp || {};
  return {
    host: asText(smtp.host),
    port: Number(smtp.port || 0),
    username: asText(smtp.username),
    password: asText(smtp.password),
    secure: Boolean(smtp.secure),
    fromEmail: asText(smtp.fromEmail),
    fromName: asText(smtp.fromName),
  };
}

function createMailHtml(submission, title) {
  const fields = [
    ['Növ', title],
    ['Ad', submission.fullName],
    ['Email', submission.email],
    ['Telefon', submission.phone],
    ['Mövzu', submission.subject],
    ['Kurs ID', submission.courseId],
    ['Status', submission.status],
    ['Tarix', submission.timestamp],
    ['Mesaj', submission.message],
  ].filter(([, value]) => asText(value));

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px 0">${title}</h2>
      <table cellpadding="6" cellspacing="0" border="0">
        ${fields
          .map(
            ([label, value]) =>
              `<tr><td style="font-weight:700;color:#475569;vertical-align:top">${label}:</td><td>${String(
                value,
              ).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td></tr>`,
          )
          .join('')}
      </table>
    </div>
  `;
}

async function sendSubmissionEmail(submission) {
  const { sitemap } = getStoredSitemap();
  const smtp = getSmtpSettings(sitemap);
  const to = getSubmissionRecipient(sitemap);
  if (!smtp.host || !smtp.port || !smtp.username || !smtp.password || !smtp.fromEmail || !to) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  const title = formatSubmissionType(submission.type);
  await transporter.sendMail({
    from: smtp.fromName ? `"${smtp.fromName}" <${smtp.fromEmail}>` : smtp.fromEmail,
    to,
    replyTo: asText(submission.email) || undefined,
    subject: `[audit.tv] ${title}`,
    text: [
      `Növ: ${title}`,
      submission.fullName ? `Ad: ${submission.fullName}` : '',
      submission.email ? `Email: ${submission.email}` : '',
      submission.phone ? `Telefon: ${submission.phone}` : '',
      submission.subject ? `Mövzu: ${submission.subject}` : '',
      submission.courseId ? `Kurs ID: ${submission.courseId}` : '',
      submission.status ? `Status: ${submission.status}` : '',
      submission.timestamp ? `Tarix: ${submission.timestamp}` : '',
      submission.message ? `Mesaj: ${submission.message}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    html: createMailHtml(submission, title),
  });

  return { sent: true };
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.png';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

const uploadAny = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    if (file.mimetype.startsWith('image/') || allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type'));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const user = db
    .prepare(
      'SELECT id, username, password_hash as passwordHash, display_name as displayName, role, is_active as isActive FROM admin_users WHERE username = ?',
    )
    .get(String(username).trim());

  if (!user || !user.isActive || !verifyPassword(String(password), user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = crypto.randomUUID();
  db.prepare('INSERT INTO admin_sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(
    token,
    user.id,
    new Date().toISOString(),
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(req.adminToken);
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ user: req.adminUser });
});

app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const users = db
    .prepare(
      'SELECT id, username, display_name as displayName, role, is_active as isActive, created_at as createdAt FROM admin_users ORDER BY id DESC',
    )
    .all();
  res.json({ users });
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { username, password, displayName, role } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  try {
    db.prepare(
      'INSERT INTO admin_users (username, password_hash, display_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(
      String(username).trim(),
      hashPassword(String(password)),
      displayName || '',
      role || 'admin',
      1,
      new Date().toISOString(),
    );
    res.status(201).json({ ok: true });
  } catch {
    res.status(409).json({ error: 'Username already exists' });
  }
});

app.patch('/api/admin/users/:id', requireAdmin, (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const current = db
    .prepare('SELECT id FROM admin_users WHERE id = ?')
    .get(userId);
  if (!current) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { displayName, role, isActive, password } = req.body || {};
  if (displayName !== undefined) {
    db.prepare('UPDATE admin_users SET display_name = ? WHERE id = ?').run(String(displayName), userId);
  }
  if (role !== undefined) {
    db.prepare('UPDATE admin_users SET role = ? WHERE id = ?').run(String(role), userId);
  }
  if (isActive !== undefined) {
    db.prepare('UPDATE admin_users SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, userId);
    if (!isActive) {
      db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').run(userId);
    }
  }
  if (password !== undefined && String(password).trim()) {
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hashPassword(String(password)), userId);
  }

  res.json({ ok: true });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }
  if (req.adminUser.id === userId) {
    res.status(400).json({ error: 'You cannot delete your own account' });
    return;
  }

  db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(userId);
  res.json({ ok: true });
});

app.get('/api/sitemap', (_req, res) => {
  const { sitemap, updatedAt } = getStoredSitemap();
  res.json({ sitemap, updatedAt });
});

app.put('/api/sitemap', (req, res) => {
  const payload = req.body?.sitemap;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    res.status(400).json({ error: 'Invalid sitemap payload' });
    return;
  }

  const updatedAt = saveSitemap(normalizeSitemap(payload));
  res.json({ ok: true, updatedAt });
});

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Image is required' });
    return;
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  const absoluteUrl = buildAbsoluteUrl(req, relativeUrl);
  res.json({ url: relativeUrl, absoluteUrl, filename: req.file.filename });
});

app.post('/api/upload', uploadAny.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'File is required' });
    return;
  }

  const relativeUrl = `/uploads/${req.file.filename}`;
  const absoluteUrl = buildAbsoluteUrl(req, relativeUrl);
  res.json({
    url: relativeUrl,
    absoluteUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

app.get('/api/uploads/pdfs', requireAdmin, (req, res) => {
  try {
    const files = fs
      .readdirSync(UPLOADS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.pdf')
      .map((entry) => {
        const absolutePath = path.join(UPLOADS_DIR, entry.name);
        const stat = fs.statSync(absolutePath);
        const relativeUrl = `/uploads/${entry.name}`;
        return {
          name: entry.name,
          url: relativeUrl,
          absoluteUrl: buildAbsoluteUrl(req, relativeUrl),
          size: stat.size,
          uploadedAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));

    res.json({ files });
  } catch {
    res.status(500).json({ error: 'PDF listəsi oxunmadı' });
  }
});

app.get('/api/course-requests', (_req, res) => {
  const rows = db
    .prepare(
      'SELECT email, full_name as fullName, password, course_id as courseId, status, timestamp, created_at as createdAt FROM course_requests ORDER BY created_at DESC',
    )
    .all();
  res.json({ requests: rows });
});

app.get('/api/course-requests/check', (req, res) => {
  const email = String(req.query.email || '');
  const courseId = String(req.query.courseId || '');
  if (!email || !courseId) {
    res.status(400).json({ error: 'email and courseId are required' });
    return;
  }

  const row = db
    .prepare(
      'SELECT email, full_name as fullName, password, course_id as courseId, status, timestamp, created_at as createdAt FROM course_requests WHERE email = ? AND course_id = ?',
    )
    .get(email, courseId);
  res.json({ request: row || null });
});

app.post('/api/course-requests', async (req, res) => {
  const { email, fullName, password, courseId, status } = req.body || {};
  if (!email || !password || !courseId) {
    res.status(400).json({ error: 'email, password and courseId are required' });
    return;
  }

  const timestamp = new Date().toLocaleString('az-AZ');
  const createdAt = new Date().toISOString();
  try {
    db.prepare(
      'INSERT INTO course_requests (email, full_name, password, course_id, status, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(email, fullName || '', password, courseId, status || 'pending', timestamp, createdAt);

    const submission = {
      type: 'course',
      fullName: fullName || '',
      email,
      phone: '',
      subject: 'Kurs giriş müraciəti',
      message: '',
      courseId,
      status: status || 'pending',
      timestamp,
    };

    let mailSent = false;
    let mailReason = '';
    try {
      const mail = await sendSubmissionEmail(submission);
      mailSent = mail.sent;
      mailReason = mail.reason || '';
    } catch (err) {
      mailReason = err instanceof Error ? err.message : 'mail_failed';
    }

    res.status(201).json({ ok: true, mailSent, mailReason });
  } catch {
    const existing = db
      .prepare(
        'SELECT email, full_name as fullName, password, course_id as courseId, status, timestamp, created_at as createdAt FROM course_requests WHERE email = ? AND course_id = ?',
      )
      .get(email, courseId);
    res.status(409).json({ error: 'Request already exists', request: existing });
  }
});

app.patch('/api/course-requests', (req, res) => {
  const { email, courseId, status } = req.body || {};
  if (!email || !courseId || !status) {
    res.status(400).json({ error: 'email, courseId and status are required' });
    return;
  }
  db.prepare('UPDATE course_requests SET status = ? WHERE email = ? AND course_id = ?').run(status, email, courseId);
  res.json({ ok: true });
});

app.delete('/api/course-requests', (req, res) => {
  const { email, courseId } = req.body || {};
  if (!email || !courseId) {
    res.status(400).json({ error: 'email and courseId are required' });
    return;
  }
  db.prepare('DELETE FROM course_requests WHERE email = ? AND course_id = ?').run(email, courseId);
  res.json({ ok: true });
});

app.post('/api/submissions', async (req, res) => {
  const { type, fullName, email, phone, subject, message, courseId } = req.body || {};
  const normalizedType = asText(type);
  if (!['contact', 'newsletter'].includes(normalizedType)) {
    res.status(400).json({ error: 'type must be contact or newsletter' });
    return;
  }

  if (normalizedType === 'newsletter' && !asText(email)) {
    res.status(400).json({ error: 'email is required for newsletter' });
    return;
  }

  if (normalizedType === 'contact' && !asText(fullName) && !asText(email) && !asText(message)) {
    res.status(400).json({ error: 'at least one of fullName, email or message is required for contact' });
    return;
  }

  const timestamp = new Date().toLocaleString('az-AZ');
  const createdAt = new Date().toISOString();
  const normalizedStatus = 'pending';

  const info = db
    .prepare(
      `INSERT INTO form_submissions (type, full_name, email, phone, subject, message, course_id, status, timestamp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      normalizedType,
      asText(fullName),
      asText(email),
      asText(phone),
      asText(subject),
      asText(message),
      asText(courseId),
      normalizedStatus,
      timestamp,
      createdAt,
    );

  const submission = {
    type: normalizedType,
    fullName: asText(fullName),
    email: asText(email),
    phone: asText(phone),
    subject: asText(subject),
    message: asText(message),
    courseId: asText(courseId),
    status: normalizedStatus,
    timestamp,
  };

  let mailSent = false;
  let mailReason = '';
  try {
    const mail = await sendSubmissionEmail(submission);
    mailSent = mail.sent;
    mailReason = mail.reason || '';
  } catch (err) {
    mailReason = err instanceof Error ? err.message : 'mail_failed';
  }

  res.status(201).json({ ok: true, id: info.lastInsertRowid, mailSent, mailReason });
});

app.get('/api/requests', (_req, res) => {
  const courseRows = db
    .prepare(
      `SELECT
        NULL as id,
        'course' as type,
        email,
        full_name as fullName,
        '' as phone,
        'Kurs giriş müraciəti' as subject,
        '' as message,
        course_id as courseId,
        status,
        timestamp,
        created_at as createdAt
      FROM course_requests`,
    )
    .all();

  const formRows = db
    .prepare(
      `SELECT
        id,
        type,
        email,
        full_name as fullName,
        phone,
        subject,
        message,
        course_id as courseId,
        status,
        timestamp,
        created_at as createdAt
      FROM form_submissions`,
    )
    .all();

  const requests = [...courseRows, ...formRows].sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
  );
  res.json({ requests });
});

app.patch('/api/submissions/:id', (req, res) => {
  const id = Number(req.params.id);
  const status = asText(req.body?.status);
  if (!id || !status) {
    res.status(400).json({ error: 'id and status are required' });
    return;
  }

  const info = db.prepare('UPDATE form_submissions SET status = ? WHERE id = ?').run(status, id);
  if (!info.changes) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  res.json({ ok: true });
});

app.delete('/api/submissions/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'id is required' });
    return;
  }
  const info = db.prepare('DELETE FROM form_submissions WHERE id = ?').run(id);
  if (!info.changes) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  if (!err) {
    res.status(500).json({ error: 'Unknown server error' });
    return;
  }
  res.status(400).json({ error: String(err.message || 'Request error') });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sitemap API listening on http://0.0.0.0:${PORT}`);
  console.log(`SQLite: ${DB_PATH}`);
  console.log(`Sitemap file: ${SITEMAP_PATH}`);
});
