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
  @ApiPropertyOptional({
    description:
      'Indicates if there are more items available after the current page',
    example: true,
    required: false,
  })
  hasNext?: boolean;

  @ApiPropertyOptional({
    description:
      'The next cursor for pagination. Use this to fetch the next page.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  nextCursor?: string | null;

  @ApiPropertyOptional({
    description: 'The number of items per page',
    example: 10,
    required: false,
  })
  limit?: number;
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
