import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PostCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a comment',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({
    description: 'The parent comment id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value || null, {
    toClassOnly: true,
  })
  parentCommentId: string | null;
}
