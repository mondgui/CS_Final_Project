import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WSGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate using JWT token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach user info to socket
      client.data.userId = payload.sub;
      client.data.userRole = payload.role;

      // Join user's personal room
      await client.join(`user:${payload.sub}`);

      this.logger.log(`Client ${client.id} connected as user ${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Client ${client.id} authentication failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Join chat room (bidirectional)
    const roomId1 = `chat:${userId}:${data.otherUserId}`;
    const roomId2 = `chat:${data.otherUserId}:${userId}`;
    
    await client.join(roomId1);
    await client.join(roomId2);
    
    this.logger.log(`User ${userId} joined chat with ${data.otherUserId}`);
    return { success: true };
  }

  @SubscribeMessage('leave-chat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const roomId1 = `chat:${userId}:${data.otherUserId}`;
    const roomId2 = `chat:${data.otherUserId}:${userId}`;
    
    await client.leave(roomId1);
    await client.leave(roomId2);
    
    return { success: true };
  }

  @SubscribeMessage('join-teacher-bookings')
  async handleJoinTeacherBookings(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    await client.join(`teacher-bookings:${userId}`);
    return { success: true };
  }

  @SubscribeMessage('join-student-bookings')
  async handleJoinStudentBookings(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    await client.join(`student-bookings:${userId}`);
    return { success: true };
  }

  @SubscribeMessage('join-teacher-availability')
  async handleJoinTeacherAvailability(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    await client.join(`teacher-availability:${userId}`);
    return { success: true };
  }

  // Helper method to emit events (can be called from services)
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
