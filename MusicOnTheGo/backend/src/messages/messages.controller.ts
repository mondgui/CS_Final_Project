import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @CurrentUser() user: { id: string },
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.sendMessage(user.id, createMessageDto);
  }

  @Get('conversation/:userId')
  async getConversation(
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
  ) {
    return this.messagesService.getConversation(user.id, userId);
  }

  @Get('conversations')
  async getConversations(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.messagesService.getConversations(user.id, page, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.messagesService.getUnreadCount(user.id);
  }
}
