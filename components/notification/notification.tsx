import express from "express";
import webpush from "web-push";
import cors from "cors";
import path from "path";
import { RegisterBody, NotifyBody, NotifyBulkBody } from "./types";

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ?? "PASTE_PUBLIC_KEY_HERE";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ?? "PASTE_PRIVATE_KEY_HERE";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// In-memory store: Map<studentId, Set<stringifiedSubscription>>
const subscriptionsByStudentId = new Map<string, Set<string>>();

app.post("/api/subscribe", (req, res) => {
  const { studentId, subscription } = req.body as RegisterBody;
  if (!studentId || !subscription?.endpoint) {
    return res.status(400).json({ error: "studentId and subscription required" });
  }
  const set = subscriptionsByStudentId.get(studentId) ?? new Set<string>();
  set.add(JSON.stringify(subscription));
  subscriptionsByStudentId.set(studentId, set);
  return res.status(201).json({ ok: true });
});

app.post("/api/unsubscribe", (req, res) => {
  const { studentId, subscription } = req.body as RegisterBody;
  if (!studentId || !subscription?.endpoint) return res.json({ ok: true });
  const set = subscriptionsByStudentId.get(studentId);
  if (!set) return res.json({ ok: true });
  set.delete(JSON.stringify(subscription));
  if (set.size === 0) subscriptionsByStudentId.delete(studentId);
  return res.json({ ok: true });
});

app.post("/api/notify", async (req, res) => {
  const { studentId, title = "Exam Update", body, url } = req.body as NotifyBody;
  if (!studentId || !body) {
    return res.status(400).json({ error: "studentId and body required" });
  }
  const set = subscriptionsByStudentId.get(studentId);
  if (!set || set.size === 0) {
    return res.status(404).json({ error: "No subscriptions for this studentId" });
  }
  const payload = JSON.stringify({ title, body, url });

  const failures: string[] = [];
  await Promise.all(
    [...set].map(async (subStr) => {
      try {
        await webpush.sendNotification(JSON.parse(subStr), payload);
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          set.delete(subStr);
        } else {
          failures.push(String(err?.message ?? err));
        }
      }
    })
  );

  return res.json({ ok: true, attempted: set.size, failures });
});

app.post("/api/notify-bulk", async (req, res) => {
  const { studentIds, title = "Exam Update", body, url } = req.body as NotifyBulkBody;
  if (!Array.isArray(studentIds) || studentIds.length === 0 || !body) {
    return res.status(400).json({ error: "studentIds[] and body required" });
  }
  const uniqueSubs = new Set<string>();
  for (const id of studentIds) {
    for (const s of subscriptionsByStudentId.get(id) ?? []) uniqueSubs.add(s);
  }
  if (uniqueSubs.size === 0) return res.status(404).json({ error: "No subscriptions found" });

  const payload = JSON.stringify({ title, body, url });
  await Promise.all(
    [...uniqueSubs].map((s) => webpush.sendNotification(JSON.parse(s), payload).catch(() => {}))
  );

  return res.json({ ok: true, recipients: uniqueSubs.size });
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
  console.log(`VAPID public key: ${VAPID_PUBLIC_KEY}`);
});
