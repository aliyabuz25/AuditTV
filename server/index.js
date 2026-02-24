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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function toAbsoluteAssetUrl(req, value, fallback = '/uploads/default-blog.jpg') {
  const raw = asText(value) || fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return buildAbsoluteUrl(req, raw);
  return buildAbsoluteUrl(req, `/${raw}`);
}

function normalizePublicPath(input) {
  const rawInput = asText(input) || '/';
  let raw = rawInput;
  try {
    raw = decodeURIComponent(rawInput);
  } catch {
    raw = rawInput;
  }
  let next = raw;

  if (/^https?:\/\//i.test(next)) {
    try {
      next = new URL(next).pathname || '/';
    } catch {
      next = '/';
    }
  }

  if (!next.startsWith('/')) next = `/${next}`;
  next = next.split('#')[0].split('?')[0] || '/';
  if (next.length > 1) next = next.replace(/\/+$/, '');
  return next || '/';
}

function buildFrontendUrl(req, pagePath) {
  const normalizedPath = normalizePublicPath(pagePath);
  const hashPath = normalizedPath === '/' ? '/' : normalizedPath;
  if (PUBLIC_BASE_URL) {
    return `${PUBLIC_BASE_URL}/#${hashPath}`;
  }
  return buildAbsoluteUrl(req, `/#${hashPath}`);
}

function renderShareHtml({
  lang = 'az',
  siteName,
  title,
  description,
  imageUrl,
  shareUrl,
  frontendUrl,
  type = 'website',
}) {
  const safeSiteName = asText(siteName) || 'audit.tv';
  const safeTitle = asText(title) || safeSiteName;
  const safeDescription = asText(description) || safeSiteName;
  const safeImage = asText(imageUrl);
  const safeShareUrl = asText(shareUrl);
  const safeFrontendUrl = asText(frontendUrl);

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(safeTitle)} | ${escapeHtml(safeSiteName)}</title>
    <meta name="description" content="${escapeHtml(safeDescription)}" />
    <link rel="canonical" href="${escapeHtml(safeFrontendUrl)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:site_name" content="${escapeHtml(safeSiteName)}" />
    <meta property="og:title" content="${escapeHtml(safeTitle)}" />
    <meta property="og:description" content="${escapeHtml(safeDescription)}" />
    <meta property="og:image" content="${escapeHtml(safeImage)}" />
    <meta property="og:url" content="${escapeHtml(safeShareUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(safeTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(safeDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(safeImage)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(safeFrontendUrl)}" />
  </head>
  <body>
    <script>window.location.replace(${JSON.stringify(safeFrontendUrl)});</script>
  </body>
</html>`;
}

function getShareMetaForPath(req, sitemap, pagePath) {
  const siteName = asText(sitemap?.settings?.branding?.siteName) || 'audit.tv';
  const defaultTitle = asText(sitemap?.settings?.seo?.title) || siteName;
  const defaultDescription =
    asText(sitemap?.settings?.seo?.description) ||
    asText(sitemap?.home?.hero?.sub) ||
    `${siteName} platforması`;
  const fallbackImage =
    asText(sitemap?.settings?.branding?.logoUrl) ||
    asText(sitemap?.about?.hero?.imageUrl) ||
    asText(sitemap?.blog?.posts?.[0]?.imageUrl) ||
    '/uploads/default-blog.jpg';

  const normalizedPath = normalizePublicPath(pagePath);
  const blogPosts = Array.isArray(sitemap?.blog?.posts) ? sitemap.blog.posts : [];
  const courses = Array.isArray(sitemap?.education?.courses) ? sitemap.education.courses : [];
  const podcastEpisodes = Array.isArray(sitemap?.podcast?.episodes) ? sitemap.podcast.episodes : [];

  const output = {
    type: 'website',
    title: defaultTitle,
    description: defaultDescription.slice(0, 300),
    imageUrl: toAbsoluteAssetUrl(req, fallbackImage),
    frontendPath: normalizedPath,
  };

  if (normalizedPath === '/') {
    output.title = asText(sitemap?.home?.hero?.title) || defaultTitle;
    output.description = (asText(sitemap?.home?.hero?.sub) || defaultDescription).slice(0, 300);
    return output;
  }

  if (normalizedPath === '/haqqimizda') {
    const heroTitle = `${asText(sitemap?.about?.hero?.title)} ${asText(sitemap?.about?.hero?.spanTitle)}`.trim();
    output.title = heroTitle || 'Haqqımızda';
    output.description = (asText(sitemap?.about?.hero?.sub) || defaultDescription).slice(0, 300);
    output.imageUrl = toAbsoluteAssetUrl(req, sitemap?.about?.hero?.imageUrl || fallbackImage);
    return output;
  }

  if (normalizedPath === '/blog') {
    output.title = asText(sitemap?.blog?.pageHeader?.title) || 'Blog';
    output.description = (asText(sitemap?.blog?.pageHeader?.sub) || defaultDescription).slice(0, 300);
    output.imageUrl = toAbsoluteAssetUrl(req, blogPosts[0]?.imageUrl || fallbackImage);
    return output;
  }

  if (normalizedPath === '/podcast') {
    output.title = asText(sitemap?.podcast?.pageHeader?.title) || 'Podcast';
    output.description = (asText(sitemap?.podcast?.pageHeader?.description) || defaultDescription).slice(0, 300);
    output.imageUrl = toAbsoluteAssetUrl(req, podcastEpisodes[0]?.thumbnailUrl || fallbackImage);
    return output;
  }

  if (normalizedPath === '/tedris') {
    output.title = asText(sitemap?.education?.pageHeader?.title) || 'Tədris';
    output.description = (asText(sitemap?.education?.pageHeader?.sub) || defaultDescription).slice(0, 300);
    output.imageUrl = toAbsoluteAssetUrl(req, courses[0]?.thumbnailUrl || fallbackImage);
    return output;
  }

  if (normalizedPath === '/elaqe') {
    output.title = asText(sitemap?.contact?.pageTitle) || 'Əlaqə';
    output.description = (asText(sitemap?.contact?.pageDescription) || defaultDescription).slice(0, 300);
    return output;
  }

  if (normalizedPath === '/mexfilik-siyaseti') {
    output.title = 'Məxfilik Siyasəti';
    output.description = `${siteName} platformasında məlumatların məxfiliyi və emalı qaydaları.`;
    return output;
  }

  if (normalizedPath === '/istifade-sertleri') {
    output.title = 'İstifadə Şərtləri';
    output.description = `${siteName} platformasının istifadəsi üçün hüquq və öhdəlik şərtləri.`;
    return output;
  }

  const blogMatch = normalizedPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const blogId = decodeURIComponent(blogMatch[1]);
    const post = blogPosts.find((item) => String(item.id) === String(blogId));
    if (post) {
      const paragraphBlock = Array.isArray(post.blocks)
        ? post.blocks.find((block) => String(block.type) === 'paragraph' && asText(block.content))
        : null;
      const blockDesc = asText(paragraphBlock?.content)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      output.type = 'article';
      output.title = asText(post.title) || 'Blog';
      output.description = (blockDesc || asText(post.excerpt) || defaultDescription).slice(0, 300);
      output.imageUrl = toAbsoluteAssetUrl(req, post.imageUrl || fallbackImage);
      return output;
    }
  }

  const courseDetailMatch = normalizedPath.match(/^\/tedris\/([^/]+)(?:\/player)?$/);
  if (courseDetailMatch) {
    const courseId = decodeURIComponent(courseDetailMatch[1]);
    const course = courses.find((item) => String(item.id) === String(courseId));
    if (course) {
      output.title = asText(course.title) || 'Kurs';
      output.description = (asText(course.description) || defaultDescription).slice(0, 300);
      output.imageUrl = toAbsoluteAssetUrl(req, course.thumbnailUrl || fallbackImage);
      output.frontendPath = normalizedPath;
      return output;
    }
  }

  return output;
}

function sendSharePreview(res, meta, req) {
  const frontendUrl = buildFrontendUrl(req, meta.frontendPath || '/');
  const shareUrl = buildAbsoluteUrl(req, req.originalUrl || '/api/share/page');
  const html = renderShareHtml({
    siteName: meta.siteName,
    title: meta.title,
    description: meta.description,
    imageUrl: meta.imageUrl,
    shareUrl,
    frontendUrl,
    type: meta.type,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

function formatSubmissionType(type) {
  if (type === 'course') return 'Kurs müraciəti';
  if (type === 'contact') return 'Əlaqə formu';
  if (type === 'newsletter') return 'Newsletter abunəliyi';
  return 'Müraciət';
}

const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function parseRecipientEmails(value) {
  const input = String(value || '');
  if (!input.trim()) return [];

  const seen = new Set();
  const recipients = [];
  const chunks = input.split(/[,\n;،]/);
  for (const chunk of chunks) {
    const email = asText(chunk);
    if (!email || !SIMPLE_EMAIL_REGEX.test(email)) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    recipients.push(email);
  }
  return recipients;
}

function getSubmissionRecipient(sitemap) {
  const settings = sitemap?.settings || {};
  const smtp = settings.smtp || {};
  const rawList = smtp.notifyEmails || smtp.notifyEmail;
  const list = parseRecipientEmails(rawList);
  if (list.length > 0) return list;
  const fallback = asText(settings.footer?.email || sitemap?.contact?.email);
  return parseRecipientEmails(fallback);
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
    notifyEmails: asText(smtp.notifyEmails || smtp.notifyEmail),
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
  if (!smtp.host || !smtp.port || !smtp.username || !smtp.password || !smtp.fromEmail || to.length === 0) {
    return { sent: false, reason: 'smtp_not_configured' };
  }
  const title = formatSubmissionType(submission.type);

  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: {
          user: smtp.username,
          pass: smtp.password,
        },
      });

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
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'mail_failed';
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }
  }

  return { sent: false, reason: lastError || 'mail_failed' };
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

app.get('/api/share/blog/:id', (req, res) => {
  const postId = String(req.params.id || '');
  const { sitemap } = getStoredSitemap();
  const posts = Array.isArray(sitemap?.blog?.posts) ? sitemap.blog.posts : [];
  const post = posts.find((p) => String(p.id) === postId);

  if (!post) {
    res.status(404).send('Blog post not found');
    return;
  }

  const meta = getShareMetaForPath(req, sitemap, `/blog/${postId}`);
  sendSharePreview(res, { ...meta, siteName: asText(sitemap?.settings?.branding?.siteName) || 'audit.tv' }, req);
});

app.get('/api/share/page', (req, res) => {
  const { sitemap } = getStoredSitemap();
  const pathParam = normalizePublicPath(
    asText(req.query.path) || asText(req.query.url) || '/',
  );
  const meta = getShareMetaForPath(req, sitemap, pathParam);
  sendSharePreview(res, { ...meta, siteName: asText(sitemap?.settings?.branding?.siteName) || 'audit.tv' }, req);
});

app.get('/api/share/page/*', (req, res) => {
  const { sitemap } = getStoredSitemap();
  const wildcardPath = `/${asText(req.params[0])}`;
  const meta = getShareMetaForPath(req, sitemap, wildcardPath);
  sendSharePreview(res, { ...meta, siteName: asText(sitemap?.settings?.branding?.siteName) || 'audit.tv' }, req);
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

    const mail = await sendSubmissionEmail(submission);
    if (!mail.sent) {
      db.prepare('DELETE FROM course_requests WHERE email = ? AND course_id = ?').run(email, courseId);
      res.status(502).json({ error: 'Mail göndərilə bilmədi', mailSent: false, mailReason: mail.reason || 'mail_failed' });
      return;
    }

    res.status(201).json({ ok: true, mailSent: true, mailReason: '' });
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

  const mail = await sendSubmissionEmail(submission);
  if (!mail.sent) {
    db.prepare('DELETE FROM form_submissions WHERE id = ?').run(Number(info.lastInsertRowid));
    res.status(502).json({ error: 'Mail göndərilə bilmədi', mailSent: false, mailReason: mail.reason || 'mail_failed' });
    return;
  }

  res.status(201).json({ ok: true, id: info.lastInsertRowid, mailSent: true, mailReason: '' });
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
