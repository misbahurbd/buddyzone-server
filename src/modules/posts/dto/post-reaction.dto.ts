import { ReactionType } from 'generated/prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ReactionDto {
  @ApiProperty({
    description: 'The reaction type',
    example: ReactionType.LIKE,
    required: true,
    nullable: true,
  })
  @IsEnum(ReactionType)
  @IsOptional()
  @Transform(({ value }: { value: ReactionType }) => value || null, {
    toClassOnly: true,
  })
  reactionType: ReactionType | null;
}
