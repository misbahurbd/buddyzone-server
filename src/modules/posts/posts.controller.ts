import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SessionUserDto } from '../auth/dto/session-user.dto';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { ApiOperation } from '@nestjs/swagger';
import {
  CreatedPostResponseDto,
  PostResponseDto,
} from './dto/post-response.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';

@UseGuards(AuthenticatedGuard)
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
}
