import { Injectable, Optional } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';

@Injectable()
export class SocketService {
  constructor(@Optional() private gateway: WebSocketGateway) {}

  emitToUser(userId: string, event: string, data: any) {
    if (this.gateway) {
      this.gateway.emitToUser(userId, event, data);
    }
  }

  emitToRoom(room: string, event: string, data: any) {
    if (this.gateway) {
      this.gateway.emitToRoom(room, event, data);
    }
  }
}
