// backend/routes/notificationRoutes.js
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendPushNotification } from "../utils/pushNotificationService.js";

const router = express.Router();

/**
 * POST /api/notifications/register-token
 * Register or update a device push token for the current user
 */
router.post("/register-token", authMiddleware, async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;

    if (!token || !platform) {
      return res.status(400).json({ 
        message: "Token and platform are required." 
      });
    }

    if (!["ios", "android"].includes(platform)) {
      return res.status(400).json({ 
        message: "Platform must be 'ios' or 'android'." 
      });
    }

    // Check if token already exists for this user
    const existingToken = await prisma.deviceToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      // Update if it belongs to a different user (device was transferred)
      if (existingToken.userId !== req.user.id) {
        await prisma.deviceToken.update({
          where: { token },
          data: {
            userId: req.user.id,
            platform,
            deviceId: deviceId || null,
          },
        });
      } else {
        // Update platform/deviceId if it changed
        await prisma.deviceToken.update({
          where: { token },
          data: {
            platform,
            deviceId: deviceId || null,
          },
        });
      }
    } else {
      // Create new token
      await prisma.deviceToken.create({
        data: {
          userId: req.user.id,
          token,
          platform,
          deviceId: deviceId || null,
        },
      });
    }

    res.json({ message: "Device token registered successfully." });
  } catch (err) {
    console.error("Error registering device token:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/notifications/unregister-token
 * Remove a device push token (e.g., on logout)
 */
router.delete("/unregister-token", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    await prisma.deviceToken.deleteMany({
      where: {
        token,
        userId: req.user.id,
      },
    });

    res.json({ message: "Device token unregistered successfully." });
  } catch (err) {
    console.error("Error unregistering device token:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/notifications/test
 * Test endpoint to send a push notification to the current user
 */
router.get("/test", authMiddleware, async (req, res) => {
  try {
    await sendPushNotification(req.user.id, {
      title: "Test Notification",
      body: "This is a test notification from MusicOnTheGo!",
      data: { type: "test" },
    });

    res.json({ message: "Test notification sent." });
  } catch (err) {
    console.error("Error sending test notification:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
