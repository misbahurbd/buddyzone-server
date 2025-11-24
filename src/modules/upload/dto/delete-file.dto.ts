import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class DeleteFileDto {
  @ApiProperty({
    description: 'Public ID of the file to delete',
    example: 'buddyzone/abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiPropertyOptional({
    description: 'Resource type of the file',
    example: 'image',
    enum: ['image', 'video', 'raw'],
    default: 'image',
  })
  @IsOptional()
  @IsString()
  @IsIn(['image', 'video', 'raw'])
  resourceType?: 'image' | 'video' | 'raw';
}
