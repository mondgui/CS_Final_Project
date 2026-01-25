import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { SocketService } from './socket.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [WebSocketGateway, SocketService],
  exports: [WebSocketGateway, SocketService],
})
export class WebSocketModule {}
