import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuccessResponseDto<T = unknown> {
  @ApiPropertyOptional({
    description: 'The message of the response',
    example: 200,
    required: true,
  })
  statusCode: number;

  @ApiProperty({
    description: 'The success of the response',
    example: true,
    required: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The message of the response',
    example: 'Success',
    required: true,
  })
  message: string;

  @ApiProperty({
    description: 'The data of the response',
    required: true,
  })
  data: T;
}

export class MetaDto {
  @ApiProperty({
    description: 'The page of the response',
    example: 1,
    required: false,
  })
  page: number;

  @ApiProperty({
    description: 'The limit of the response',
    example: 10,
    required: false,
  })
  limit: number;

  @ApiProperty({
    description: 'The skip of the response',
    example: 0,
    required: false,
  })
  skip: number;

  @ApiProperty({
    description: 'The total of the response',
    example: 100,
    required: false,
  })
  total?: number;

  @ApiProperty({
    description: 'The total pages of the response',
    example: 100,
    required: false,
  })
  totalPages?: number;

  @ApiProperty({
    description: 'The next cursor of the response',
    example: '123',
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'The previous cursor of the response',
    example: '123',
    required: false,
  })
  previousCursor?: string;
}

export class SuccessResponseWithMeta<
  T = unknown,
> extends SuccessResponseDto<T> {
  @ApiProperty({
    description: 'The meta of the response',
    required: true,
    type: MetaDto,
  })
  meta: MetaDto;
}
