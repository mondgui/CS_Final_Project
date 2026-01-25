import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '../websocket/socket.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService,
  ) {}

  async sendMessage(senderId: string, createMessageDto: CreateMessageDto) {
    const { recipientId, text } = createMessageDto;

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found.');
    }

    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send message to yourself.');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        text: text.trim(),
        read: false,
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

    // Emit Socket.io events
    this.socketService.emitToUser(recipientId, 'new-message', message);
    this.socketService.emitToRoom(`chat:${senderId}:${recipientId}`, 'message', message);
    this.socketService.emitToRoom(`chat:${recipientId}:${senderId}`, 'message', message);

    return message;
  }

  async getConversation(currentUserId: string, otherUserId: string) {
    // Verify other user exists
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      throw new NotFoundException('User not found.');
    }

    // Get all messages between the two users
    const messages = await this.prisma.message.findMany({
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
    await this.prisma.message.updateMany({
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

    // Emit Socket.io event for read receipts
    this.socketService.emitToRoom(`chat:${otherUserId}:${currentUserId}`, 'messages-read', {
      recipientId: currentUserId,
    });

    return messages;
  }

  async getConversations(currentUserId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Get all messages where current user is sender or recipient
    const messages = await this.prisma.message.findMany({
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
    const conversationsMap = new Map<string, any>();

    messages.forEach((msg) => {
      const otherUser =
        msg.senderId === currentUserId ? msg.recipient : msg.sender;
      const otherUserId = otherUser.id;
      const isOwnMessage = msg.senderId === currentUserId;

      if (!conversationsMap.has(otherUserId)) {
        // Only count unread if message was sent TO current user (not by current user)
        const isUnread = !isOwnMessage && !msg.read;
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name || 'Unknown',
          profileImage: otherUser.profileImage || '',
          email: otherUser.email || '',
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
    const allConversations = Array.from(conversationsMap.values()).sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime(),
    );

    // Get total count
    const totalCount = allConversations.length;

    // Apply pagination to conversations
    const conversations = allConversations.slice(skip, skip + limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      conversations,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async getUnreadCount(currentUserId: string) {
    const count = await this.prisma.message.count({
      where: {
        recipientId: currentUserId,
        read: false,
      },
    });

    return { count };
  }
}
