import { Router, type IRouter } from "express";
import {
  getUniverseEmailStatus,
  subscribeUniverseEmail,
  updateUniverseStats,
} from "../lib/universeMailer";

const router: IRouter = Router();

router.get("/universe-emails/status", (_req, res) => {
  res.json({ ok: true, ...getUniverseEmailStatus() });
});

router.post("/universe-emails/subscribe", async (req, res, next) => {
  try {
    const { email, stats } = req.body as { email?: string; stats?: unknown };
    if (!email) {
      res.status(400).json({ message: "Email is required." });
      return;
    }

    const result = await subscribeUniverseEmail(email, stats as Record<string, unknown>);
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post("/universe-emails/stats", async (req, res, next) => {
  try {
    const { email, stats } = req.body as { email?: string; stats?: unknown };
    if (!email) {
      res.status(400).json({ message: "Email is required." });
      return;
    }

    await updateUniverseStats(email, stats as Record<string, unknown>);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
