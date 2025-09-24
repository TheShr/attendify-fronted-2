// server.js
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cors = require('cors');

/**
 * TODO: move these to env vars in production
 * Replace with the keys you generated above.
 */
const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  || 'PASTE_PUBLIC_KEY_HERE';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'PASTE_PRIVATE_KEY_HERE';
const VAPID_SUBJECT = 'mailto:admin@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory store: { [studentId]: Set<subscription> }
const subscriptionsByStudentId = new Map();

/**
 * Register a subscription for a student
 * Body: { studentId: string, subscription: PushSubscriptionJSON }
 */
app.post('/api/subscribe', (req, res) => {
  const { studentId, subscription } = req.body || {};
  if (!studentId || !subscription) {
    return res.status(400).json({ error: 'studentId and subscription are required' });
  }
  const set = subscriptionsByStudentId.get(studentId) || new Set();
  set.add(JSON.stringify(subscription)); // store as string (to allow Set de-dupe)
  subscriptionsByStudentId.set(studentId, set);
  return res.status(201).json({ ok: true });
});

/**
 * OPTIONAL: un-subscribe (cleanup)
 * Body: { studentId, subscription }
 */
app.post('/api/unsubscribe', (req, res) => {
  const { studentId, subscription } = req.body || {};
  const set = subscriptionsByStudentId.get(studentId);
  if (!set) return res.json({ ok: true });
  set.delete(JSON.stringify(subscription));
  if (set.size === 0) subscriptionsByStudentId.delete(studentId);
  return res.json({ ok: true });
});

/**
 * Send notification to a single student
 * Body: { studentId: string, title?: string, body: string, url?: string }
 */
app.post('/api/notify', async (req, res) => {
  const { studentId, title = 'Exam Update', body, url } = req.body || {};
  if (!studentId || !body) {
    return res.status(400).json({ error: 'studentId and body are required' });
  }
  const set = subscriptionsByStudentId.get(studentId);
  if (!set || set.size === 0) {
    return res.status(404).json({ error: 'No subscriptions found for this studentId' });
  }

  const payload = JSON.stringify({ title, body, url });

  const failures = [];
  await Promise.all(
    Array.from(set).map(async (subStr) => {
      const sub = JSON.parse(subStr);
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        // If gone/invalid, remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          set.delete(subStr);
        } else {
          failures.push(err.message);
        }
      }
    })
  );

  return res.json({ ok: true, sent: set.size, failures });
});

/**
 * Broadcast to many students at once
 * Body: { studentIds: string[], title?: string, body: string, url?: string }
 */
app.post('/api/notify-bulk', async (req, res) => {
  const { studentIds, title = 'Exam Update', body, url } = req.body || {};
  if (!Array.isArray(studentIds) || studentIds.length === 0 || !body) {
    return res.status(400).json({ error: 'studentIds[] and body are required' });
  }
  const uniqueSubs = new Set();
  for (const id of studentIds) {
    for (const sub of (subscriptionsByStudentId.get(id) || [])) uniqueSubs.add(sub);
  }
  if (uniqueSubs.size === 0) return res.status(404).json({ error: 'No subscriptions found' });

  const payload = JSON.stringify({ title, body, url });
  await Promise.all(
    Array.from(uniqueSubs).map(async (subStr) => {
      const sub = JSON.parse(subStr);
      try { await webpush.sendNotification(sub, payload); }
      catch (err) { /* swallow non-critical errors; could log */ }
    })
  );
  res.json({ ok: true, recipients: uniqueSubs.size });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
