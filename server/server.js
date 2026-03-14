/**
 * Backend API for Guitar Lessons
 * - Stripe Checkout integration
 * - JWT token generation for lesson access
 * - SQLite-based lesson store (simple and production-viable)
 * - Protected streaming endpoint for lesson videos (local or S3)
 */

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const stripeLib = require('stripe');
const jwt = require('jsonwebtoken');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const STRIPE_SECRET = process.env.STRIPE_SECRET || 'sk_test_xxx';
const stripe = stripeLib(STRIPE_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || 'replace_me_in_production';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

// Simple SQLite wrapper
const db = require('./db');

// Serve static preview files (public previews can be placed under server/public/previews)
app.use('/previews', express.static(path.join(__dirname, 'public', 'previews')));

// Public health
app.get('/', (req, res) => res.send('Guitar Lessons API running'));

// List lessons
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await db.getAllLessons();
    res.json({ ok: true, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Create a Stripe Checkout session for a lesson
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) return res.status(400).json({ error: 'missing_lessonId' });

    const lesson = await db.getLessonById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'lesson_not_found' });

    // If Stripe is not configured or in local dev, provide a mock session URL so dev flow works
    let session;
    try {
      if (!process.env.STRIPE_SECRET || process.env.STRIPE_SECRET.indexOf('sk_') !== 0) throw new Error('stripe_not_configured');
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: lesson.title },
            unit_amount: Math.round(lesson.price * 100),
          },
          quantity: 1,
        }],
        metadata: { lessonId: lesson.id },
        success_url: `${SITE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/lessons`,
      });
      return res.json({ url: session.url });
    } catch (stripeErr) {
      // Dev fallback: generate a mock session id and redirect to checkout-success directly
  console.warn('Stripe not configured or error creating session — using mock session for dev', stripeErr && stripeErr.message);
  // Use a clear separator for lesson id (lesson ids may contain underscores)
  const mockSessionId = `MOCK::${lesson.id}::${Date.now()}`;
      // store a mock token record if needed — here we just return a URL that includes mock session id
      return res.json({ url: `${SITE_URL}/checkout-success?session_id=${mockSessionId}`, mock: true });
    }
  } catch (err) {
    console.error('create-checkout-session', err);
    res.status(500).json({ error: err.message || 'server_error' });
  }
});

// After Stripe Checkout success, client calls this to verify and obtain access token
app.post('/api/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'missing_sessionId' });
    // Support mock sessions used in development: sessionId starts with MOCK_<lessonId>_<timestamp>
    let lessonId;
    if (String(sessionId).startsWith('MOCK::')) {
      const parts = String(sessionId).split('::');
      // parts = ['MOCK', lessonId, timestamp]
      lessonId = parts[1];
    } else {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session || session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'payment_not_completed' });
      }
      lessonId = session.metadata && session.metadata.lessonId;
      if (!lessonId) return res.status(400).json({ error: 'invalid_session_metadata' });
    }

    // Generate a time-limited JWT token (e.g., 24 hours)
    const token = jwt.sign({ lessonId, sessionId }, JWT_SECRET, { expiresIn: '24h' });

    // Optionally store token for audit / revocation
    await db.storeToken(token, lessonId, sessionId);

    res.json({ ok: true, token, lessonUrl: `${SITE_URL}/lesson/${token}` });
  } catch (err) {
    console.error('verify-session', err);
    res.status(500).json({ error: err.message || 'server_error' });
  }
});

// Validate token and return lesson content (including streaming endpoints for videos)
app.get('/api/lesson/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: 'missing_token' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, error: 'invalid_or_expired_token' });
    }

    const lesson = await db.getLessonById(payload.lessonId);
    if (!lesson) return res.status(404).json({ ok: false, error: 'lesson_not_found' });

    // Build streaming URLs for each topic (this example uses local protected streaming)
    const topics = lesson.topics.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      // The client will call this endpoint to stream the protected video
      streamUrl: `${req.protocol}://${req.get('host')}/api/stream/${encodeURIComponent(t.videoPath)}?token=${token}`
    }));

    res.json({ ok: true, lesson: { id: lesson.id, title: lesson.title, description: lesson.description, topics } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Protected streaming endpoint - streams local file after validating token
app.get('/api/stream/:video', async (req, res) => {
  try {
    const { token } = req.query;
    const video = req.params.video;
    if (!token) return res.status(401).send('Missing token');

    try { jwt.verify(token, JWT_SECRET); } catch (err) { return res.status(401).send('Invalid or expired token'); }

    const safePath = path.join(__dirname, 'media', path.basename(decodeURIComponent(video)));
    if (!fs.existsSync(safePath)) return res.status(404).send('Not found');

    const stat = fs.statSync(safePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(safePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' };
      res.writeHead(200, head);
      fs.createReadStream(safePath).pipe(res);
    }
  } catch (err) {
    console.error('stream error', err);
    res.status(500).send('server_error');
  }
});

// Simple admin endpoints (password protected via ADMIN_PASSWORD env)
function checkAdmin(req, res, next) {
  const pw = req.headers['x-admin-password'] || req.query.admin_password;
  if (!pw || pw !== process.env.ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// Create a lesson (multipart: preview + topics' videos)
app.post('/api/admin/lessons', checkAdmin, upload.fields([{ name: 'preview', maxCount: 1 }, { name: 'topicVideos' }]), async (req, res) => {
  try {
    // Expect JSON fields: title, description, price, topics (JSON array with title,description)
    const { title, description, price, topics } = req.body;
    const parsedTopics = topics ? JSON.parse(topics) : [];

    // Move uploaded topic videos from uploads to media
    const mediaDir = path.join(__dirname, 'media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

    const topicFiles = req.files && req.files.topicVideos ? req.files.topicVideos : [];
    for (let i = 0; i < parsedTopics.length; i++) {
      const tf = topicFiles[i];
      if (tf) {
        const dest = path.join(mediaDir, tf.originalname);
        fs.renameSync(tf.path, dest);
        parsedTopics[i].videoPath = tf.originalname;
        parsedTopics[i].id = `t${Date.now()}${i}`;
      }
    }

    const lesson = await db.createLesson({ title, description, price: Number(price || 0), topics: parsedTopics });
    res.json({ ok: true, lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Static build serving (for production when client is built into ../client/build)
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
