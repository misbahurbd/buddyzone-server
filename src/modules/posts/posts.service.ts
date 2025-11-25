import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostVisibility, Prisma } from 'generated/prisma/client';
import { CursorPaginationQueryDto } from './dto/cursor-pagination-query.dto';
import { ReactionDto } from './dto/post-reaction.dto';
import { PostCommentDto } from './dto/post-comment.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    try {
      const { content, visibility, mediaUrls = [] } = createPostDto;

      const post = await this.prisma.post.create({
        data: {
          content,
          visibility,
          mediaUrls: {
            createMany: {
              data: mediaUrls.map((mediaUrl) => ({
                publicId: mediaUrl.publicId,
                url: mediaUrl.url,
              })),
              skipDuplicates: true,
            },
          },
          authorId: userId,
        },
        include: this.getPostInclude(),
      });

      return await this.transformPostResponse(post, userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getPosts(userId: string, query: CursorPaginationQueryDto) {
    try {
      const { limit = 10, cursor, order, orderBy = 'createdAt' } = query;

      const posts = await this.prisma.post.findMany({
        where: {
          OR: [
            {
              authorId: userId,
            },
            {
              visibility: PostVisibility.PUBLIC,
            },
          ],
        },
        include: this.getPostInclude(),
        ...(cursor ? { cursor: { id: cursor } } : {}),
        take: limit + 1,
        orderBy: {
          [orderBy]: order,
        },
      });
      const actualPosts = posts.slice(0, limit);

      const hasNext = posts.length > limit;
      const nextCursor = hasNext ? posts[posts.length - 1].id : null;

      const responseData = await Promise.all(
        actualPosts.map((post) => this.transformPostResponse(post, userId)),
      );

      return {
        data: responseData,
        meta: { hasNext, nextCursor },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get posts');
    }
  }

  async getPostsByUsername(
    userId: string,
    username: string,
    query: CursorPaginationQueryDto,
  ) {
    try {
      const { limit = 10, cursor, order, orderBy = 'createdAt' } = query;

      const posts = await this.prisma.post.findMany({
        where: {
          author: { username },
          OR: [{ authorId: userId }, { visibility: PostVisibility.PUBLIC }],
        },
        include: this.getPostInclude(),
        ...(cursor ? { cursor: { id: cursor } } : {}),
        take: limit + 1,
        orderBy: {
          [orderBy]: order,
        },
      });

      const actualPosts = posts.slice(0, limit);

      const hasNext = posts.length > limit;
      const nextCursor = hasNext ? posts[posts.length - 1].id : null;

      const responseData = await Promise.all(
        actualPosts.map((post) => this.transformPostResponse(post, userId)),
      );

      return {
        data: responseData,
        meta: { hasNext, nextCursor },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get posts by username');
    }
  }

  async getPostById(userId: string, id: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id,
          OR: [{ authorId: userId }, { visibility: PostVisibility.PUBLIC }],
        },
        include: this.getPostInclude(),
      });

      if (!post) {
        throw new NotFoundException(
          'Post not found or you are not authorized to access it',
        );
      }

      return await this.transformPostResponse(post, userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get post by id');
    }
  }

  async commentOnPost(
    userId: string,
    postId: string,
    postCommentDto: PostCommentDto,
  ) {
    try {
      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          comments: {
            create: {
              content: postCommentDto.comment,
              authorId: userId,
              parentId: postCommentDto.parentCommentId,
            },
          },
        },
        include: this.getPostInclude(),
      });

      if (!post) {
        throw new NotFoundException(
          'Post not found or you are not authorized to access it',
        );
      }

      return await this.transformPostResponse(post, userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to comment on post');
    }
  }

  async reactToPost(userId: string, postId: string, reactionDto: ReactionDto) {
    try {
      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          reactions: {
            ...(reactionDto.reactionType === null && {
              delete: {
                authorId_postId: {
                  authorId: userId,
                  postId,
                },
              },
            }),
            ...(reactionDto.reactionType !== null && {
              upsert: {
                where: { authorId_postId: { authorId: userId, postId } },
                update: { reactionType: reactionDto.reactionType },
                create: {
                  authorId: userId,
                  reactionType: reactionDto.reactionType,
                },
              },
            }),
          },
        },
        include: this.getPostInclude(),
      });

      if (!post) {
        throw new NotFoundException(
          'Post not found or you are not authorized to access it',
        );
      }

      return await this.transformPostResponse(post, userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to react to post');
    }
  }

  async reactToComment(
    userId: string,
    postId: string,
    commentId: string,
    reactionDto: ReactionDto,
  ) {
    try {
      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          comments: {
            update: {
              where: { id: commentId },
              data: {
                reactions: {
                  ...(reactionDto.reactionType === null && {
                    delete: {
                      authorId_commentId: {
                        authorId: userId,
                        commentId,
                      },
                    },
                  }),
                  ...(reactionDto.reactionType !== null && {
                    upsert: {
                      where: {
                        authorId_commentId: { authorId: userId, commentId },
                      },
                      update: { reactionType: reactionDto.reactionType },
                      create: {
                        authorId: userId,
                        reactionType: reactionDto.reactionType,
                      },
                    },
                  }),
                },
              },
            },
          },
        },
        include: this.getPostInclude(),
      });

      if (!post) {
        throw new NotFoundException(
          'Post not found or you are not authorized to access it',
        );
      }

      return await this.transformPostResponse(post, userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to react to comment');
    }
  }

  async getComments(postId: string, query: CursorPaginationQueryDto) {
    try {
      const { limit = 10, cursor, order, orderBy = 'createdAt' } = query;

      const comments = await this.prisma.comment.findMany({
        where: {
          postId,
          parentId: null,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photo: true,
            },
          },
          reactions: {
            select: {
              reactionType: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                },
              },
              createdAt: true,
            },
            take: 10,
            orderBy: {
              createdAt: Prisma.SortOrder.desc,
            },
          },
          replies: {
            select: {
              id: true,
              parentId: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                },
              },
              reactions: {
                select: {
                  reactionType: true,
                  author: {
                    select: {
                      id: true,
                      username: true,
                      firstName: true,
                      lastName: true,
                      photo: true,
                    },
                  },
                  createdAt: true,
                },
                take: 10,
                orderBy: {
                  createdAt: Prisma.SortOrder.desc,
                },
              },
              _count: {
                select: {
                  reactions: true,
                },
              },
            },
          },
          _count: {
            select: {
              reactions: true,
              replies: {
                where: {
                  parentId: {
                    not: null,
                  },
                },
              },
            },
          },
        },
        ...(cursor ? { cursor: { id: cursor } } : {}),
        take: limit + 1,
        orderBy: {
          [orderBy]: order,
        },
      });

      const actualComments = comments.slice(0, limit);

      const hasNext = comments.length > limit;
      const nextCursor = hasNext ? comments[comments.length - 1].id : null;

      return {
        data: actualComments,
        meta: { hasNext, nextCursor },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get comments');
    }
  }

  async getPostReactions(postId: string, query: CursorPaginationQueryDto) {
    try {
      const { limit = 10, cursor, order, orderBy = 'createdAt' } = query;

      const reactions = await this.prisma.postReaction.findMany({
        where: {
          postId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photo: true,
            },
          },
        },
        ...(cursor ? { cursor: { id: cursor } } : {}),
        take: limit + 1,
        orderBy: {
          [orderBy]: order,
        },
      });

      const actualReactions = reactions.slice(0, limit);

      const hasNext = reactions.length > limit;
      const nextCursor = hasNext ? reactions[reactions.length - 1].id : null;

      return {
        data: actualReactions,
        meta: { hasNext, nextCursor },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get post reactions');
    }
  }

  async getCommentReactions(
    commentId: string,
    query: CursorPaginationQueryDto,
  ) {
    try {
      const { limit = 10, cursor, order, orderBy = 'createdAt' } = query;

      const reactions = await this.prisma.commentReaction.findMany({
        where: {
          commentId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photo: true,
            },
          },
        },
        ...(cursor ? { cursor: { id: cursor } } : {}),
        take: limit + 1,
        orderBy: {
          [orderBy]: order,
        },
      });

      const actualReactions = reactions.slice(0, limit);

      const hasNext = reactions.length > limit;
      const nextCursor = hasNext ? reactions[reactions.length - 1].id : null;

      return {
        data: actualReactions,
        meta: { hasNext, nextCursor },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get comment reactions');
    }
  }

  private getPostInclude() {
    return {
      mediaUrls: true,
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          photo: true,
        },
      },
      reactions: {
        select: {
          reactionType: true,
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photo: true,
            },
          },
          createdAt: true,
        },
        take: 10,
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      },
      comments: {
        where: {
          parentId: null,
        },
        select: {
          id: true,
          parentId: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photo: true,
            },
          },
          reactions: {
            select: {
              reactionType: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                },
              },
              createdAt: true,
            },
            take: 10,
            orderBy: {
              createdAt: Prisma.SortOrder.desc,
            },
          },
          replies: {
            select: {
              id: true,
              parentId: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                },
              },
              reactions: {
                select: {
                  reactionType: true,
                  author: {
                    select: {
                      id: true,
                      username: true,
                      firstName: true,
                      lastName: true,
                      photo: true,
                    },
                  },
                  createdAt: true,
                },
                take: 10,
                orderBy: {
                  createdAt: Prisma.SortOrder.desc,
                },
              },
              _count: {
                select: {
                  reactions: true,
                  replies: true,
                },
              },
            },
            take: 3,
            orderBy: {
              createdAt: Prisma.SortOrder.desc,
            },
          },
          _count: {
            select: {
              reactions: true,
              replies: true,
            },
          },
        },
        take: 3,
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      },
      _count: {
        select: {
          reactions: true,
          comments: {
            where: {
              parentId: null,
            },
          },
        },
      },
    };
  }

  private async transformPostResponse(
    post: Prisma.PostGetPayload<{
      include: {
        reactions: {
          select: {
            reactionType: true;
            author: {
              select: {
                id: true;
                username: true;
                firstName: true;
                lastName: true;
                photo: true;
              };
            };
            createdAt: true;
          };
        };
        comments: {
          select: {
            id: true;
            parentId: true;
            content: true;
            createdAt: true;
            author: {
              select: {
                id: true;
                username: true;
                firstName: true;
                lastName: true;
                photo: true;
              };
            };
            reactions: {
              select: {
                reactionType: true;
                author: {
                  select: {
                    id: true;
                    username: true;
                    firstName: true;
                    lastName: true;
                    photo: true;
                  };
                };
                createdAt: true;
              };
            };
            replies: {
              select: {
                id: true;
                parentId: true;
                content: true;
                createdAt: true;
                author: {
                  select: {
                    id: true;
                    username: true;
                    firstName: true;
                    lastName: true;
                    photo: true;
                  };
                };
                reactions: {
                  select: {
                    reactionType: true;
                    author: {
                      select: {
                        id: true;
                        username: true;
                        firstName: true;
                        lastName: true;
                        photo: true;
                      };
                    };
                    createdAt: true;
                  };
                };
                _count: {
                  select: {
                    reactions: true;
                    replies: true;
                  };
                };
              };
            };
            _count: {
              select: {
                reactions: true;
                replies: true;
              };
            };
          };
        };
        _count: {
          select: {
            reactions: true;
            comments: true;
          };
        };
      };
    }>,
    userId: string,
  ) {
    const { comments, reactions, ...restPost } = post;

    // Collect all comment and reply IDs for batch queries
    const commentIds: string[] = [];
    const replyIds: string[] = [];

    comments.forEach((comment) => {
      commentIds.push(comment.id);
      comment.replies.forEach((reply) => {
        replyIds.push(reply.id);
      });
    });

    // Batch fetch user's reactions in parallel
    type UserCommentReaction = {
      reactionType: any;
      author: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        photo: string | null;
      };
      createdAt: Date;
      commentId: string;
    };

    const [userPostReaction, userCommentReactions, userReplyReactions] =
      await Promise.all([
        // Check if user's post reaction exists in fetched reactions, if not fetch it
        reactions.find((r) => r.author.id === userId)
          ? null
          : this.prisma.postReaction.findUnique({
              where: {
                authorId_postId: {
                  authorId: userId,
                  postId: post.id,
                },
              },
              select: {
                reactionType: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                  },
                },
                createdAt: true,
              },
            }),
        // Batch fetch user's reactions for all comments
        commentIds.length > 0
          ? this.prisma.commentReaction.findMany({
              where: {
                authorId: userId,
                commentId: { in: commentIds },
              },
              select: {
                reactionType: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                  },
                },
                createdAt: true,
                commentId: true,
              },
            })
          : Promise.resolve([] as UserCommentReaction[]),
        // Batch fetch user's reactions for all replies
        replyIds.length > 0
          ? this.prisma.commentReaction.findMany({
              where: {
                authorId: userId,
                commentId: { in: replyIds },
              },
              select: {
                reactionType: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                  },
                },
                createdAt: true,
                commentId: true,
              },
            })
          : Promise.resolve([] as UserCommentReaction[]),
      ]);

    // Create maps for quick lookup
    type CommentReactionType = (typeof userCommentReactions)[0];
    type ReplyReactionType = (typeof userReplyReactions)[0];

    const userCommentReactionsMap = new Map<string, CommentReactionType>();
    userCommentReactions.forEach((r) => {
      userCommentReactionsMap.set(r.commentId, r);
    });

    const userReplyReactionsMap = new Map<string, ReplyReactionType>();
    userReplyReactions.forEach((r) => {
      userReplyReactionsMap.set(r.commentId, r);
    });

    // Process post reactions: merge user's reaction if not already included
    const existingUserPostReaction = reactions.find(
      (r) => r.author.id === userId,
    );
    const allPostReactions = existingUserPostReaction
      ? [...reactions]
      : userPostReaction
        ? [...reactions, userPostReaction]
        : [...reactions];

    const processedReactions = this.prioritizeUserItem(
      allPostReactions,
      userId,
      5,
      (item) => item.author.id === userId,
    );

    // Process comments
    const processedComments = this.prioritizeUserItem(
      comments,
      userId,
      3,
      (item) => item.author.id === userId,
    ).map((comment) => {
      // Merge user's comment reaction if not already included
      const existingUserCommentReaction = comment.reactions.find(
        (r) => r.author.id === userId,
      );
      const userCommentReaction = userCommentReactionsMap.get(comment.id);
      const allCommentReactions =
        existingUserCommentReaction || !userCommentReaction
          ? [...comment.reactions]
          : [...comment.reactions, userCommentReaction];

      const processedCommentReactions = this.prioritizeUserItem(
        allCommentReactions,
        userId,
        5,
        (item) => item.author.id === userId,
      );

      // Process replies
      const processedReplies = this.prioritizeUserItem(
        comment.replies,
        userId,
        3,
        (item) => item.author.id === userId,
      ).map((reply) => {
        // Merge user's reply reaction if not already included
        const existingUserReplyReaction = reply.reactions.find(
          (r) => r.author.id === userId,
        );
        const userReplyReaction = userReplyReactionsMap.get(reply.id);
        const allReplyReactions =
          existingUserReplyReaction || !userReplyReaction
            ? [...reply.reactions]
            : [...reply.reactions, userReplyReaction];

        const processedReplyReactions = this.prioritizeUserItem(
          allReplyReactions,
          userId,
          5,
          (item) => item.author.id === userId,
        );

        return {
          id: reply.id,
          parentId: reply.parentId,
          content: reply.content,
          author: reply.author,
          createdAt: reply.createdAt,
          reactions: processedReplyReactions,
          totalReactions: reply._count.reactions,
          totalReplies: reply._count.replies,
        };
      });

      return {
        id: comment.id,
        parentId: comment.parentId,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        reactions: processedCommentReactions,
        replies: processedReplies,
        totalReactions: comment._count.reactions,
        totalReplies: comment._count.replies,
      };
    });

    return {
      ...restPost,
      reactions: processedReactions,
      comments: processedComments,
      totalReactions: post._count.reactions,
      totalComments: post._count.comments,
    };
  }

  private prioritizeUserItem<T extends { createdAt: Date }>(
    items: T[],
    userId: string,
    targetCount: number,
    isUserItem: (item: T) => boolean,
  ): T[] {
    if (!items || items.length === 0) {
      return [];
    }

    const userItemIndex = items.findIndex(isUserItem);
    const userItem = userItemIndex !== -1 ? items[userItemIndex] : null;

    if (userItem) {
      const otherItems = items.filter((item, index) => index !== userItemIndex);
      const additionalCount = targetCount - 1;
      const additionalItems = otherItems.slice(0, additionalCount);

      const result = [userItem, ...additionalItems];
      return result.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    } else {
      return items.slice(0, targetCount);
    }
  }
}
