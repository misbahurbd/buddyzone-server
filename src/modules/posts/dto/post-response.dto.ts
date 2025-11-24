import { ApiProperty } from '@nestjs/swagger';
import { PostVisibility, ReactionType } from 'generated/prisma/client';

export class CreatedPostResponseDto {
  @ApiProperty({
    description: 'The id of the post',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The content of the post',
    example: 'This is a post',
    required: true,
  })
  content: string;

  @ApiProperty({
    description: 'The visibility of the post',
    example: PostVisibility.PUBLIC,
    required: true,
  })
  visibility: PostVisibility;

  @ApiProperty({
    description: 'The id of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  authorId: string;

  @ApiProperty({
    description: 'The created at date of the post',
    example: '2021-01-01',
    required: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated at date of the post',
    example: '2021-01-01',
    required: true,
  })
  updatedAt: Date;
}

export class PostMediaResponseDto {
  @ApiProperty({
    description: 'The id of the media',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The public ID of the media',
    example: 'abc123xyz',
    required: true,
  })
  publicId: string;

  @ApiProperty({
    description: 'The URL of the media',
    example: 'https://example.com/image.jpg',
    required: true,
  })
  url: string;
}

export class AutorResponseDto {
  @ApiProperty({
    description: 'The id of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The username of the author',
    example: 'john.doe.123',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: 'The first name of the author',
    example: 'John',
    required: true,
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the author',
    example: 'Doe',
    required: true,
  })
  lastName: string;

  @ApiProperty({
    description: 'The photo of the author',
    example: 'https://example.com/image.jpg',
    required: false,
    nullable: true,
  })
  photo: string | null;
}

export class ReactionResponseDto {
  @ApiProperty({
    description: 'The reaction type',
    example: ReactionType.LIKE,
    required: true,
  })
  reactionType: ReactionType;

  @ApiProperty({
    description: 'The author who reacted',
    type: AutorResponseDto,
    required: true,
  })
  author: AutorResponseDto;
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'The id of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The parent id of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a comment',
    required: true,
  })
  content: string;

  @ApiProperty({
    description: 'The created at date of the comment',
    example: '2021-01-01',
    required: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The author of the comment',
    type: AutorResponseDto,
    required: true,
  })
  author: AutorResponseDto;

  @ApiProperty({
    description: 'The reactions of the comment',
    type: [ReactionResponseDto],
    required: true,
  })
  reactions: ReactionResponseDto[];

  @ApiProperty({
    description: 'The replies of the comment',
    type: [CommentResponseDto],
    required: false,
    nullable: true,
  })
  replies?: CommentResponseDto[];

  @ApiProperty({
    description: 'The total number of reactions of the comment',
    example: 10,
    required: true,
  })
  totalReactions: number;

  @ApiProperty({
    description: 'The total number of replies of the comment',
    example: 10,
    required: true,
  })
  totalReplies: number;
}

export class PostResponseDto extends CreatedPostResponseDto {
  @ApiProperty({
    description: 'The media urls of the post',
    type: [PostMediaResponseDto],
    required: true,
  })
  mediaUrls: PostMediaResponseDto[];

  @ApiProperty({
    description: 'The author of the post',
    type: AutorResponseDto,
    required: true,
  })
  author: AutorResponseDto;

  @ApiProperty({
    description: 'The reactions of the post',
    type: [ReactionResponseDto],
    required: true,
  })
  reactions: ReactionResponseDto[];

  @ApiProperty({
    description: 'The comments of the post',
    type: [CommentResponseDto],
    required: true,
  })
  comments: CommentResponseDto[];

  @ApiProperty({
    description: 'The total number of reactions of the post',
    example: 10,
    required: true,
  })
  totalReactions: number;

  @ApiProperty({
    description: 'The total number of comments of the post',
    example: 10,
    required: true,
  })
  totalComments: number;
}
