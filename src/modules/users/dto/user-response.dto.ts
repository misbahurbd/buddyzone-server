import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'The user id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The user username',
    example: 'john-doe',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: 'The user first name',
    example: 'John',
    required: true,
  })
  firstName: string;

  @ApiProperty({
    description: 'The user last name',
    example: 'Doe',
    required: true,
  })
  lastName: string;

  @ApiProperty({
    description: 'The user photo',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  photo: string | null;

  @ApiProperty({
    description: 'The user is current user',
    example: false,
    required: false,
  })
  isCurrentUser: boolean | null;

  @ApiProperty({
    description: 'The user created at date',
    example: '2021-01-01',
    required: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The user updated at date',
    example: '2021-01-01',
    required: true,
  })
  updatedAt: Date;
}
