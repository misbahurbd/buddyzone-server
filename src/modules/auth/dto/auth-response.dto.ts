import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'The user id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john.doe.123',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: true,
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: true,
  })
  lastName: string;

  @ApiProperty({
    description: 'The photo URL of the user',
    example: 'https://example.com/photo.jpg',
    required: false,
    nullable: true,
  })
  photo: string | null;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'The created at date of the user',
    example: '2021-01-01',
    required: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated at date of the user',
    example: '2021-01-01',
    required: true,
  })
  updatedAt: Date;
}
