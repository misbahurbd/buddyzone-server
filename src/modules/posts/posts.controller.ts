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
  CommentResponseDto,
  CreatedPostResponseDto,
  PostResponseDto,
  ReactionResponseDto,
} from './dto/post-response.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CursorPaginationQueryDto } from './dto/cursor-pagination-query.dto';
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
    @Query() query: CursorPaginationQueryDto,
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

  @Get('username/:username')
  @ApiOperation({ summary: 'Get posts by username' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: PostResponseDto,
    withMeta: true,
    isArray: true,
  })
  async getPostsByUsername(
    @Req() req: Request & { user: SessionUserDto },
    @Param('username') username: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const posts = await this.postsService.getPostsByUsername(
      req.user.id,
      username,
      query,
    );

    return {
      message: 'Posts retrieved successfully',
      data: posts.data,
      meta: posts.meta,
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

  @Get(':postId/comments')
  @ApiOperation({ summary: 'Get comments to a post' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: CommentResponseDto,
    withMeta: true,
    isArray: true,
  })
  async getPostComments(
    @Param('postId') postId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const comments = await this.postsService.getComments(postId, query);

    return {
      message: 'Comments retrieved successfully',
      data: comments.data,
      meta: comments.meta,
    };
  }

  @Get(':postId/reactions')
  @ApiOperation({ summary: 'Get reactions to a post' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Reactions retrieved successfully',
    type: ReactionResponseDto,
    withMeta: true,
    isArray: true,
  })
  async getPostReactions(
    @Param('postId') postId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const reactions = await this.postsService.getPostReactions(postId, query);

    return {
      message: 'Reactions retrieved successfully',
      data: reactions.data,
      meta: reactions.meta,
    };
  }

  @Get('/comment/:commentId/reactions')
  @ApiOperation({ summary: 'Get reactions to a comment' })
  @ApiSuccessResponse({
    status: 200,
    description: 'Reactions retrieved successfully',
    type: ReactionResponseDto,
    withMeta: true,
    isArray: true,
  })
  async getCommentReactions(
    @Param('commentId') commentId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const reactions = await this.postsService.getCommentReactions(
      commentId,
      query,
    );

    return {
      message: 'Reactions retrieved successfully',
      data: reactions.data,
      meta: reactions.meta,
    };
  }
}
