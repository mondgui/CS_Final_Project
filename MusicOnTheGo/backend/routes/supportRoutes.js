// backend/routes/supportRoutes.js - Support ticket routes
import express from 'express';
import prisma from '../utils/prisma.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendSupportTicketReplyEmail } from '../utils/emailService.js';
import { sendPushNotification } from '../utils/pushNotificationService.js';

const router = express.Router();

/**
 * POST /api/support/contact
 * Create a support ticket (contact us form)
 * Can be used by authenticated or anonymous users
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, queryType, subject, message } = req.body;

    // Validation
    if (!name || !email || !queryType || !subject || !message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'All fields are required.',
        statusCode: 400,
      });
    }

    // Get userId if authenticated (optional)
    let userId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // If token invalid, continue as anonymous
        userId = null;
      }
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId || null,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        queryType: queryType.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
      },
    });

    res.status(201).json({
      message: 'Support ticket created successfully. We will get back to you within 24-48 hours.',
      ticket: {
        id: ticket.id,
        status: ticket.status,
      },
    });
  } catch (err) {
    console.error('Support ticket creation error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'Failed to create support ticket.',
      statusCode: 500,
    });
  }
});

/**
 * GET /api/support/tickets/me
 * Get support tickets for the current user (if authenticated)
 */
router.get('/tickets/me', authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/admin/support-tickets
 * ADMIN: Get all support tickets with pagination
 */
router.get('/admin/support-tickets', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Filter by status

    const where = {};
    if (status && ['open', 'replied', 'resolved', 'closed'].includes(status)) {
      where.status = status;
    }

    // Build include options
    const includeOptions = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };

    // Try to include replies (only if migration has been run)
    // If the table doesn't exist, Prisma will throw an error, so we catch it and retry without replies
    let tickets, totalCount;
    try {
      includeOptions.replies = {
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      };

      [tickets, totalCount] = await Promise.all([
        prisma.supportTicket.findMany({
          where,
          include: includeOptions,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.supportTicket.count({ where }),
      ]);
    } catch (err) {
      // If error is about missing table/relation, retry without replies
      if (err.message && (err.message.includes('SupportTicketReply') || err.message.includes('replies'))) {
        console.log('[Support Routes] SupportTicketReply table not found - loading tickets without replies');
        delete includeOptions.replies;
        [tickets, totalCount] = await Promise.all([
          prisma.supportTicket.findMany({
            where,
            include: includeOptions,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.supportTicket.count({ where }),
        ]);
      } else {
        // Re-throw if it's a different error
        throw err;
      }
    }

    res.json({
      tickets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/support-tickets/:id/reply
 * ADMIN: Reply to a support ticket
 */
router.put('/admin/support-tickets/:id/reply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    // Create a new reply record (to support multiple replies)
    // If the table doesn't exist yet, we'll fall back to the old method
    let ticketReply = null;
    let useNewReplySystem = true;
    
    try {
      ticketReply = await prisma.supportTicketReply.create({
        data: {
          ticketId: req.params.id,
          adminId: req.user.id,
          reply: reply.trim(),
          emailSent: false, // Will be updated after email is sent
        },
      });
    } catch (err) {
      // If table doesn't exist, use old method (single adminReply field)
      // Check for various error types: model not found, table doesn't exist, relation doesn't exist
      const errorMessage = err.message || '';
      const errorCode = err.code || '';
      if (
        errorMessage.includes('SupportTicketReply') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('Unknown model') ||
        errorCode === 'P2001' || // Record not found
        errorCode === 'P2021' || // Table does not exist
        errorCode === 'P2025'    // Record to update not found
      ) {
        console.log('[Support Routes] SupportTicketReply table not found - using legacy reply method');
        useNewReplySystem = false;
      } else {
        // Log the actual error for debugging
        console.error('[Support Routes] Error creating reply:', err);
        throw err;
      }
    }

    // Update ticket status and latest reply info
    const updateData = {
      adminReply: reply.trim(), // Keep for backward compatibility
      status: 'replied',
      adminId: req.user.id,
      repliedAt: new Date(),
    };

    const includeOptions = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };

    // Try to include replies if using new system
    if (useNewReplySystem) {
      try {
        includeOptions.replies = {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        };
      } catch (err) {
        // If fails, just continue without replies
      }
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: updateData,
      include: includeOptions,
    });

    // Send email notification to user about the reply
    const emailSent = await sendSupportTicketReplyEmail(
      ticket.email,
      ticket.subject,
      reply.trim(),
      ticket.id
    );

    // Send push notification if user is logged in (has userId)
    if (ticket.userId) {
      const replyPreview = reply.trim().length > 80 
        ? reply.trim().substring(0, 80) + "..." 
        : reply.trim();

      await sendPushNotification(ticket.userId, {
        title: "Support Ticket Reply",
        body: `We've replied to your ticket: ${ticket.subject}`,
        data: {
          type: "support_reply",
          ticketId: ticket.id,
        },
      });
    }

    // Update reply record with email status (if using new system)
    if (useNewReplySystem && ticketReply && emailSent) {
      try {
        await prisma.supportTicketReply.update({
          where: { id: ticketReply.id },
          data: { emailSent: true },
        });
      } catch (err) {
        console.error('[Support Routes] Failed to update reply email status:', err);
      }
    }

    res.json({
      message: emailSent 
        ? 'Reply sent successfully and email notification sent to user.' 
        : 'Reply sent successfully, but email notification failed.',
      ticket: updatedTicket,
      emailSent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/support-tickets/:id/status
 * ADMIN: Update support ticket status
 */
router.put('/admin/support-tickets/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { status } = req.body;

    if (!status || !['open', 'replied', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be open, replied, resolved, or closed.' });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    const updateData = {
      status,
      adminId: req.user.id,
    };

    if (status === 'resolved' && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Ticket status updated successfully.',
      ticket: updatedTicket,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/support-tickets/:id
 * ADMIN: Delete a support ticket
 */
router.delete('/admin/support-tickets/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    await prisma.supportTicket.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Support ticket deleted successfully.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;
