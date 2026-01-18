// backend/routes/communityRoutes.js - Converted to use Prisma
import express from "express";
import prisma from "../utils/prisma.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/community
 * Get community feed with filters
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { filter, instrument, sort = "recent", page, limit } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build visibility filter
    const visibilityFilter = [];
    visibilityFilter.push("public");
    if (filter === "students" || userRole === "student") {
      visibilityFilter.push("students");
    }
    if (filter === "teachers" || userRole === "teacher") {
      visibilityFilter.push("teachers");
    }

    const where = {
      visibility: { in: visibilityFilter },
    };

    if (instrument) {
      where.instrument = instrument;
    }

    // If filtering by author role, we need additional filtering after fetch
    let orderBy = { createdAt: 'desc' };
    if (sort === "popular") {
      orderBy = { likeCount: 'desc', createdAt: 'desc' };
    } else if (sort === "comments") {
      orderBy = { commentCount: 'desc', createdAt: 'desc' };
    }

    let posts;
    let totalCount;

    if (filter === "students" || filter === "teachers") {
      const roleToFilter = filter === "students" ? "student" : "teacher";
      
      // First get posts with visibility filter
      const allPosts = await prisma.communityPost.findMany({
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
      });

      // Filter by author role
      posts = allPosts.filter(post => post.author.role === roleToFilter);
      totalCount = posts.length;
      
      // Apply pagination after filtering
      posts = posts.slice(skip, skip + limitNum);
    } else {
      totalCount = await prisma.communityPost.count({ where });
      
      posts = await prisma.communityPost.findMany({
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
        take: limitNum,
      });
    }

    // Check if current user liked each post
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some(like => like.id === userId),
    }));

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/community/me
 * Get current user's posts
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      prisma.communityPost.findMany({
        where: { authorId: req.user.id },
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
      prisma.communityPost.count({
        where: { authorId: req.user.id },
      }),
    ]);

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some(like => like.id === req.user.id),
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/community/:id
 * Get a specific post by ID
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ message: "Post not found." });
    }

    const postWithLikeStatus = {
      ...post,
      isLiked: post.likes.some(like => like.id === req.user.id),
    };

    res.json(postWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community
 * Create a new community post
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      mediaUrl,
      mediaType,
      thumbnailUrl,
      instrument,
      level,
      visibility,
    } = req.body;

    if (!title || !mediaUrl || !mediaType || !instrument) {
      return res.status(400).json({
        message: "Title, mediaUrl, mediaType, and instrument are required.",
      });
    }

    if (!["video", "audio", "image"].includes(mediaType)) {
      return res.status(400).json({
        message: "mediaType must be 'video', 'audio', or 'image'.",
      });
    }

    const post = await prisma.communityPost.create({
      data: {
        title,
        description: description || "",
        mediaUrl,
        mediaType,
        thumbnailUrl: thumbnailUrl || "",
        instrument,
        level: level || "Beginner",
        visibility: visibility || "public",
        authorId: req.user.id,
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
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("[Community] Error creating post:", err);
    res.status(500).json({ 
      message: err.message || "Failed to create post",
    });
  }
});

/**
 * PUT /api/community/:id
 * Update a post (only by author)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const { title, description, instrument, level, visibility } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instrument) updateData.instrument = instrument;
    if (level) updateData.level = level;
    if (visibility) updateData.visibility = visibility;

    const updatedPost = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: updateData,
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

    const postWithLikeStatus = {
      ...updatedPost,
      isLiked: updatedPost.likes.some(like => like.id === req.user.id),
    };

    res.json(postWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/community/:id
 * Delete a post (only by author)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await prisma.communityPost.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community/:id/like
 * Like or unlike a post
 */
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: { likes: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const userId = req.user.id;
    const isLiked = post.likes.some(like => like.id === userId);

    // Update likes relation
    const updatedPost = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: {
        likes: isLiked
          ? { disconnect: { id: userId } }
          : { connect: { id: userId } },
        likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
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

    const postWithLikeStatus = {
      ...updatedPost,
      isLiked: !isLiked,
    };

    res.json(postWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community/:id/comment
 * Add a comment to a post
 */
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Create comment
    await prisma.comment.create({
      data: {
        postId: req.params.id,
        authorId: req.user.id,
        text: text.trim(),
      },
    });

    // Update comment count
    const updatedPost = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: {
        commentCount: post.commentCount + 1,
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

    const postWithLikeStatus = {
      ...updatedPost,
      isLiked: updatedPost.likes.some(like => like.id === req.user.id),
    };

    res.json(postWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/community/:id/comment/:commentId
 * Delete a comment (only by comment author or post author)
 */
router.delete("/:id/comment/:commentId", authMiddleware, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: req.params.commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check authorization
    const isCommentAuthor = comment.authorId === req.user.id;
    const isPostAuthor = post.authorId === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: req.params.commentId },
    });

    // Update comment count
    const updatedPost = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: {
        commentCount: Math.max(0, post.commentCount - 1),
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

    const postWithLikeStatus = {
      ...updatedPost,
      isLiked: updatedPost.likes.some(like => like.id === req.user.id),
    };

    res.json(postWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
