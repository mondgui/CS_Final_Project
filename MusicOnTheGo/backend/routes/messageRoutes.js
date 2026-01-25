// backend/routes/messageRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendPushNotification } from "../utils/pushNotificationService.js";

const router = express.Router();

/**
 * GET /api/messages/conversations
 * Get all unique conversations for the current user
 * NOTE: This route must be defined BEFORE /conversation/:userId to prevent route collision
 */
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const { page, limit } = req.query;
    const currentUserId = req.user.id;

    // Get all messages where current user is sender or recipient (using Prisma)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { recipientId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create a map of unique contacts with their last message
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.senderId === currentUserId ? msg.recipient : msg.sender;
      const otherUserId = otherUser.id;
      const isOwnMessage = msg.senderId === currentUserId;

      if (!conversationsMap.has(otherUserId)) {
        // Only count unread if message was sent TO current user (not by current user)
        const isUnread = !isOwnMessage && !msg.read;
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name || "Unknown",
          profileImage: otherUser.profileImage || "",
          email: otherUser.email || "",
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        // Update unread count if this is an unread message sent TO current user
        const conversation = conversationsMap.get(otherUserId);
        if (!isOwnMessage && !msg.read) {
          conversation.unreadCount += 1;
        }
        // Update last message if this is more recent
        if (msg.createdAt > conversation.lastMessageTime) {
          conversation.lastMessage = msg.text;
          conversation.lastMessageTime = msg.createdAt;
        }
      }
    });

    // Convert map to array and sort by last message time
    const allConversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    // Pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = allConversations.length;

    // Apply pagination to conversations
    const conversations = allConversations.slice(skip, skip + limitNum);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      conversations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/messages/unread-count
 * Get count of unread messages for current user
 * NOTE: This route must be defined BEFORE /conversation/:userId to prevent route collision
 */
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        recipientId: req.user.id,
        read: false,
      },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/messages/conversation/:userId/mark-read
 * Mark all messages from this conversation (otherUser -> me) as read.
 * Call when leaving the chat so the unread count only includes messages received while away.
 */
router.post("/conversation/:userId/mark-read", authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: req.user.id,
        read: false,
      },
      data: { read: true, readAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/messages/conversation/:userId
 * Get all messages between current user and another user (also marks them read on load)
 */
router.get("/conversation/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read if they were sent to current user
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: currentUserId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Unread count updates are delivered via Supabase Realtime (Message UPDATE events)
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/messages
 * Send a new message (Supabase Realtime handles real-time updates)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { recipientId, text } = req.body;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ message: "Recipient ID and message text are required." });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // Create roomId for efficient real-time filtering (sorted user IDs)
    const roomId = [req.user.id, recipientId].sort().join('_');

    // Create message using Prisma (Supabase Realtime delivers INSERT to chat and messages list)
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        recipientId: recipientId,
        text: text.trim(),
        read: false,
        roomId: roomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Send push notification to recipient
    const messagePreview = text.trim().length > 50 
      ? text.trim().substring(0, 50) + "..." 
      : text.trim();

    await sendPushNotification(recipientId, {
      title: message.sender.name,
      body: messagePreview,
      data: {
        type: "message",
        senderId: req.user.id,
        roomId: roomId,
      },
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
