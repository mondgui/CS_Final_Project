import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  async createPost(
    @CurrentUser() user: { id: string; role: string },
    @Body() createDto: CreatePostDto,
  ) {
    return this.communityService.createPost(user.id, user.role, createDto);
  }

  @Get()
  async getPosts(
    @CurrentUser() user: { id: string; role: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filter') filter?: string,
    @Query('instrument') instrument?: string,
    @Query('sort') sort?: string,
  ) {
    return this.communityService.getPosts(
      user.id,
      user.role,
      page,
      limit,
      filter,
      instrument,
      sort,
    );
  }

  @Get('me')
  async getMyPosts(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.communityService.getUserPosts(user.id, page, limit);
  }

  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.communityService.getPostById(id, user.id);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updateDto: UpdatePostDto,
  ) {
    return this.communityService.updatePost(id, user.id, updateDto);
  }

  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.communityService.deletePost(id, user.id);
  }

  @Post(':id/like')
  async toggleLike(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.communityService.toggleLike(id, user.id);
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() createDto: CreateCommentDto,
  ) {
    return this.communityService.addComment(id, user.id, createDto);
  }

  @Delete(':id/comment/:commentId')
  async deleteComment(
    @Param('id') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.communityService.deleteComment(postId, commentId, user.id);
  }
}
