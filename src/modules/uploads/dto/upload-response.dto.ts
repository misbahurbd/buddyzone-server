import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    description: 'Public ID of the uploaded file',
    example: 'buddyzone/abc123xyz',
  })
  publicId: string;

  @ApiProperty({
    description: 'URL of the uploaded file',
    example:
      'https://res.cloudinary.com/cloud/image/upload/v1234567890/buddyzone/abc123xyz.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Secure URL (HTTPS) of the uploaded file',
    example:
      'https://res.cloudinary.com/cloud/image/upload/v1234567890/buddyzone/abc123xyz.jpg',
  })
  secureUrl: string;

  @ApiProperty({
    description: 'Width of the file (if image/video)',
    example: 1920,
    required: false,
  })
  width?: number;

  @ApiProperty({
    description: 'Height of the file (if image/video)',
    example: 1080,
    required: false,
  })
  height?: number;

  @ApiProperty({
    description: 'File format',
    example: 'jpg',
  })
  format: string;

  @ApiProperty({
    description: 'Resource type',
    example: 'image',
    enum: ['image', 'video', 'raw', 'auto'],
  })
  resourceType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  bytes: number;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: string;
}
