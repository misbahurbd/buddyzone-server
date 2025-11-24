import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  SuccessResponseDto,
  SuccessResponseWithMeta,
} from '../dto/success-response.dto';
import { map, Observable } from 'rxjs';

type SuccessResponse<T> = SuccessResponseDto<T> | SuccessResponseWithMeta<T>;

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data: T | SuccessResponse<T>): SuccessResponse<T> => {
        if (
          data &&
          typeof data === 'object' &&
          ('meta' in data || 'message' in data || 'data' in data)
        ) {
          const responseData: SuccessResponseWithMeta<T> =
            data as SuccessResponseWithMeta<T>;

          return {
            statusCode: responseData.statusCode || 200,
            success: true,
            message: responseData.message || 'Success',
            data: responseData.data,
            ...(responseData.meta && { meta: responseData.meta }),
          };
        }

        return {
          statusCode: 200,
          success: true,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
