import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Visibility, PostLevel } from '@prisma/client';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, userRole: string, createDto: CreatePostDto) {
    const post = await this.prisma.communityPost.create({
      data: {
        authorId: userId,
        title: createDto.title,
        description: createDto.description || '',
        mediaUrl: createDto.mediaUrl,
        mediaType: createDto.mediaType,
        thumbnailUrl: createDto.thumbnailUrl || '',
        instrument: createDto.instrument,
        level: createDto.level || PostLevel.Beginner,
        visibility: createDto.visibility || Visibility.public,
        likeCount: 0,
        commentCount: 0,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return { ...post, isLiked: false };
  }

  async getPosts(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 20,
    filter?: string,
    instrument?: string,
    sort: string = 'recent',
  ) {
    const skip = (page - 1) * limit;

    // Build visibility filter based on user role
    const visibilityFilter: Visibility[] = [Visibility.public];
    if (userRole === 'student') {
      visibilityFilter.push(Visibility.students);
    } else if (userRole === 'teacher') {
      visibilityFilter.push(Visibility.teachers);
    }

    // Build where clause
    const where: any = {
      visibility: {
        in: visibilityFilter,
      },
    };

    if (instrument) {
      where.instrument = instrument;
    }

    // Filter by author role if specified
    if (filter === 'students' || filter === 'teachers') {
      const roleToFilter = filter === 'students' ? 'student' : 'teacher';
      // We'll need to filter by author role after fetching
      // This requires a join, which we'll handle in the query
    }

    // Build sort
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') {
      orderBy = [{ likeCount: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'comments') {
      orderBy = [{ commentCount: 'desc' }, { createdAt: 'desc' }];
    }

    // Get posts
    let posts = await this.prisma.communityPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Filter by author role if needed
    if (filter === 'students' || filter === 'teachers') {
      const roleToFilter = filter === 'students' ? 'student' : 'teacher';
      posts = posts.filter((post) => post.author.role === roleToFilter);
    }

    // Get total count (with role filter if needed)
    let totalCount: number;
    if (filter === 'students' || filter === 'teachers') {
      const roleToFilter = filter === 'students' ? 'student' : 'teacher';
      // We need to count posts with matching author role
      const allPosts = await this.prisma.communityPost.findMany({
        where,
        include: {
          author: {
            select: {
              role: true,
            },
          },
        },
      });
      totalCount = allPosts.filter((p) => p.author.role === roleToFilter).length;
    } else {
      totalCount = await this.prisma.communityPost.count({ where });
    }

    // Add isLiked status
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some((like) => like.id === userId),
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async getPostById(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return {
      ...post,
      isLiked: post.likes.some((like) => like.id === userId),
    };
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      this.prisma.communityPost.findMany({
        where: { authorId: userId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              role: true,
            },
          },
          likes: {
            select: {
              id: true,
              name: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.communityPost.count({ where: { authorId: userId } }),
    ]);

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some((like) => like.id === userId),
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    };
  }

  async updatePost(postId: string, userId: string, updateDto: UpdatePostDto) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Unauthorized.');
    }

    const updated = await this.prisma.communityPost.update({
      where: { id: postId },
      data: updateDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      ...updated,
      isLiked: updated.likes.some((like) => like.id === userId),
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Unauthorized.');
    }

    await this.prisma.communityPost.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully.' };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        likes: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const isLiked = post.likes.some((like) => like.id === userId);

    if (isLiked) {
      // Unlike
      await this.prisma.communityPost.update({
        where: { id: postId },
        data: {
          likes: {
            disconnect: { id: userId },
          },
          likeCount: {
            decrement: 1,
          },
        },
      });
    } else {
      // Like
      await this.prisma.communityPost.update({
        where: { id: postId },
        data: {
          likes: {
            connect: { id: userId },
          },
          likeCount: {
            increment: 1,
          },
        },
      });
    }

    // Return updated post
    const updated = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      ...updated,
      isLiked: !isLiked,
    };
  }

  async addComment(postId: string, userId: string, createDto: CreateCommentDto) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    if (!createDto.text || createDto.text.trim() === '') {
      throw new BadRequestException('Comment text is required.');
    }

    // Create comment and update comment count
    await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        text: createDto.text.trim(),
      },
    });

    await this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    // Return updated post
    const updated = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      ...updated,
      isLiked: updated.likes.some((like) => like.id === userId),
    };
  }

  async deleteComment(
    postId: string,
    commentId: string,
    userId: string,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    // Check if user is comment author or post author
    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = comment.post.authorId === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      throw new ForbiddenException('Unauthorized.');
    }

    // Delete comment and update comment count
    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    await this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    });

    // Return updated post
    const updated = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            role: true,
          },
        },
        likes: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      ...updated,
      isLiked: updated.likes.some((like) => like.id === userId),
    };
  }
}
