import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SessionUserDto } from '../auth/dto/session-user.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import {
  CreatedPostResponseDto,
  PostResponseDto,
} from './dto/post-response.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { ReactionDto } from './dto/post-reaction.dto';
import { PostCommentDto } from './dto/post-comment.dto';

@UseGuards(AuthenticatedGuard)
@ApiCookieAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiSuccessResponse({
    status: 201,
    description: 'Post created successfully',
    type: CreatedPostResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Req() req: Request & { user: SessionUserDto },
    @Body() createPostDto: CreatePostDto,
  ) {
    const post = await this.postsService.createPost(req.user.id, createPostDto);

    return {
      message: 'Post created successfully',
      data: post,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get posts' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: PostResponseDto,
    withMeta: true,
    isArray: true,
  })
  async getPosts(
    @Req() req: Request & { user: SessionUserDto },
    @Query() query: GetPostsQueryDto,
  ) {
    const posts = await this.postsService.getPosts(req.user.id, query);

    return {
      message: 'Posts retrieved successfully',
      data: posts.data,
      meta: posts.meta,
    };
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Post retrieved successfully',
    type: PostResponseDto,
  })
  async getPostById(
    @Req() req: Request & { user: SessionUserDto },
    @Param('postId') postId: string,
  ) {
    const post = await this.postsService.getPostById(req.user.id, postId);

    return {
      message: 'Post retrieved successfully',
      data: post,
    };
  }

  @Post(':postId/react')
  @ApiOperation({ summary: 'React to a post' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Post reacted successfully',
    type: PostResponseDto,
  })
  async reactToPost(
    @Req() req: Request & { user: SessionUserDto },
    @Param('postId') postId: string,
    @Body() reactToPostDto: ReactionDto,
  ) {
    const post = await this.postsService.reactToPost(
      req.user.id,
      postId,
      reactToPostDto,
    );

    return {
      message: 'Post reacted successfully',
      data: post,
    };
  }

  @Post(':postId/comment')
  @ApiOperation({ summary: 'Comment on a post' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Commented on post successfully',
    type: PostResponseDto,
  })
  async commentOnPost(
    @Req() req: Request & { user: SessionUserDto },
    @Param('postId') postId: string,
    @Body() postCommentDto: PostCommentDto,
  ) {
    const post = await this.postsService.commentOnPost(
      req.user.id,
      postId,
      postCommentDto,
    );

    return {
      message: 'Commented on post successfully',
      data: post,
    };
  }

  @Post(':postId/comment/:commentId/react')
  @ApiOperation({ summary: 'React to a comment' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Comment reacted successfully',
    type: PostResponseDto,
  })
  async reactToComment(
    @Req() req: Request & { user: SessionUserDto },
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() reactionDto: ReactionDto,
  ) {
    const post = await this.postsService.reactToComment(
      req.user.id,
      postId,
      commentId,
      reactionDto,
    );

    return {
      message: 'Comment reacted successfully',
      data: post,
    };
  }
}
