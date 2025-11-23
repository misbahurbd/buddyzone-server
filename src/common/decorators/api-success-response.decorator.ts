import { applyDecorators, Type as ClassType } from '@nestjs/common';
import {
  SuccessResponseDto,
  SuccessResponseWithMeta,
} from '../dto/success-response.dto';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

type Options<TDataDto extends ClassType<unknown>> = {
  type?: TDataDto;
  status?: number;
  description?: string;
  withMeta?: boolean;
  isArray?: boolean;
};

export const ApiSuccessResponse = <TDataDto extends ClassType<unknown>>(
  options: Options<TDataDto> = {},
) => {
  const {
    status = 200,
    description,
    withMeta = false,
    isArray = false,
    type,
  } = options;

  const ResponseDto = withMeta ? SuccessResponseWithMeta : SuccessResponseDto;

  const apiResponseConfig: Parameters<typeof ApiResponse>[0] = {
    status,
    description,
    schema: {
      allOf: type
        ? [
            {
              $ref: getSchemaPath(ResponseDto),
            },
            {
              properties: {
                data: isArray
                  ? {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(type),
                      },
                    }
                  : {
                      $ref: getSchemaPath(type),
                    },
              },
            },
          ]
        : [{ $ref: getSchemaPath(ResponseDto) }],
    },
  };

  const decorators = type
    ? [ApiExtraModels(ResponseDto, type), ApiResponse(apiResponseConfig)]
    : [ApiExtraModels(ResponseDto), ApiResponse(apiResponseConfig)];

  return applyDecorators(...decorators);
};
