import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostVisibility, Prisma } from 'generated/prisma/client';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
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

      return this.transformPostResponse(post);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getPosts(userId: string, query: GetPostsQueryDto) {
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

      const responseData = actualPosts.map((post) =>
        this.transformPostResponse(post),
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

      return this.transformPostResponse(post);
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

      return this.transformPostResponse(post);
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

      return this.transformPostResponse(post);
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

      return this.transformPostResponse(post);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to react to comment');
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
        },
        take: 5,
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
            },
            take: 2,
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
                },
                take: 2,
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
            take: 2,
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
        take: 2,
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

  private transformPostResponse(
    post: Prisma.PostGetPayload<{
      include: {
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
  ) {
    const { comments, ...restPost } = post;

    return {
      ...restPost,
      comments: comments.map((comment) => ({
        id: comment.id,
        parentId: comment.parentId,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        reactions: comment.reactions,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          parentId: reply.parentId,
          content: reply.content,
          author: reply.author,
          createdAt: reply.createdAt,
          reactions: reply.reactions,
          totalReactions: reply._count.reactions,
          totalReplies: reply._count.replies,
        })),
        totalReactions: comment._count.reactions,
        totalReplies: comment._count.replies,
      })),
      totalReactions: post._count.reactions,
      totalComments: post._count.comments,
    };
  }
}
