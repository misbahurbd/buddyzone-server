import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostVisibility, Prisma } from 'generated/prisma/client';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';

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
      });

      return post;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getPosts(userId: string, query: GetPostsQueryDto) {
    try {
      const { limit = 10, cursor, order, orderBy = 'createdAt' } = query;

      const postInclude = {
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
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                photo: true,
              },
            },
          },
          take: 3,
          orderBy: {
            createdAt: Prisma.SortOrder.desc,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
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
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    photo: true,
                  },
                },
              },
              take: 3,
              orderBy: {
                createdAt: Prisma.SortOrder.desc,
              },
            },
            replies: {
              select: {
                id: true,
                content: true,
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
                    user: {
                      select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        photo: true,
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
            comments: true,
          },
        },
      };

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
        include: postInclude,
        ...(cursor ? { cursor: { id: cursor } } : {}),
        take: limit + 1,
        orderBy: {
          [orderBy]: order,
        },
      });
      const actualPosts = posts.slice(0, limit);

      const hasNext = posts.length > limit;
      const nextCursor = hasNext ? posts[posts.length - 1].id : null;

      const responseData = actualPosts.map((post) => {
        const { comments, _count, ...restPost } = post;

        const commentsResponse = comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          author: comment.author,
          reactions: comment.reactions,
          replies: comment.replies.map((reply) => ({
            id: reply.id,
            content: reply.content,
            author: reply.author,
            reactions: reply.reactions,
            totalReactions: reply._count.reactions,
            totalReplies: reply._count.replies,
          })),
          totalReactions: comment._count.reactions,
          totalReplies: comment._count.replies,
        }));
        return {
          ...restPost,
          comments: commentsResponse,
          totalReactions: _count.reactions,
          totalComments: _count.comments,
        };
      });

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
        include: {
          mediaUrls: {
            select: {
              id: true,
              publicId: true,
              url: true,
            },
          },
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
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  photo: true,
                },
              },
            },
            take: 3,
            orderBy: {
              createdAt: Prisma.SortOrder.desc,
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
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
          },
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to get post by id');
    }
  }
}
