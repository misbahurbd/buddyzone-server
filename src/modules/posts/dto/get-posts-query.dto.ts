import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Prisma } from 'generated/prisma/client';

export enum Direction {
  NEXT = 'next',
  PREVIOUS = 'previous',
}
export class GetPostsQueryDto {
  @ApiProperty({
    description: 'The cursor id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({
    description: 'The limit of the posts',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }: { value: number }) => Number(value), {
    toClassOnly: true,
  })
  limit?: number = 10;

  @ApiProperty({
    description: 'The order of the posts',
    example: 'desc',
    required: false,
  })
  @IsEnum(Prisma.SortOrder)
  @IsOptional()
  @Transform(({ value }: { value: Prisma.SortOrder }) => value, {
    toClassOnly: true,
  })
  order?: Prisma.SortOrder = Prisma.SortOrder.desc;

  @ApiProperty({
    description: 'The order by of the posts',
    example: 'createdAt',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value, {
    toClassOnly: true,
  })
  orderBy?: string = 'createdAt';
}
