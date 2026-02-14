// POST /api/analytics/event - Record app usage (screen view or feature click)
// Auth optional: if token present, userId is stored for "unique users" metrics
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const VALID_EVENT_TYPES = ["screen_view", "feature_click"];
const MAX_NAME_LENGTH = 120;

router.post(
  "/event",
  (req, res, next) => {
    // Optional auth: run auth middleware but don't fail if no token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authMiddleware(req, res, next);
    }
    next();
  },
  async (req, res) => {
    try {
      const { eventType, name } = req.body || {};
      if (!eventType || !name || typeof name !== "string") {
        return res.status(400).json({
          message: "Missing or invalid eventType and name",
        });
      }
      if (!VALID_EVENT_TYPES.includes(eventType)) {
        return res.status(400).json({
          message: `eventType must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
        });
      }
      const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
      if (!trimmedName) {
        return res.status(400).json({ message: "name cannot be empty" });
      }

      if (!prisma.appEvent) {
        return res.status(201).json({ ok: true });
      }

      await prisma.appEvent.create({
        data: {
          eventType,
          name: trimmedName,
          userId: req.user?.id ?? null,
        },
      });

      res.status(201).json({ ok: true });
    } catch (err) {
      if (err.code === "P2021" || err.message?.includes("does not exist")) {
        return res.status(201).json({ ok: true });
      }
      console.error("[Analytics] Event error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
