import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PostVisibility } from 'generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'The content of the post',
    example: 'This is a post',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The visibility of the post',
    example: PostVisibility.PUBLIC,
    required: false,
  })
  @IsEnum(PostVisibility)
  @IsOptional()
  @Transform(
    ({ value }: { value: PostVisibility }) => value || PostVisibility.PUBLIC,
    { toClassOnly: true },
  )
  visibility: PostVisibility = PostVisibility.PUBLIC;

  @ApiProperty({
    description: 'The media URLs of the post',
    example: [{ publicId: 'abc123xyz', url: 'https://example.com/image.jpg' }],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PostMediaDto)
  @Transform(({ value }: { value: PostMediaDto[] }) => value || [], {
    toClassOnly: true,
  })
  mediaUrls?: PostMediaDto[];
}

export class PostMediaDto {
  @ApiProperty({
    description: 'The public ID of the media',
    example: 'abc123xyz',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({
    description: 'The URL of the media',
    example: 'https://example.com/image.jpg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
