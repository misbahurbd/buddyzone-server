import { Request, Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let message: string = 'Internal server error';
    let errorCode: string = 'UNKNOWN_ERROR';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // handle diffrent response types
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.getErrorCode(statusCode);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
          statusCode?: number;
        };

        message = Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message || responseObj.error || exception.message;

        errorCode =
          responseObj.statusCode?.toString() || this.getErrorCode(statusCode);
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception instanceof Error
            ? exception.message
            : 'Internal server error';
      errorCode = this.getErrorCode(statusCode);

      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.stack : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    if (statusCode >= 500 || process.env.NODE_ENV !== 'production') {
      this.logger.error(
        `HTTP ${statusCode} ${request.method} ${request.url}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      statusCode,
      message,
      errorCode,
      success: false,
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorCode(statusCode: number): string {
    const errorCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    return errorCodeMap[statusCode] || 'UNKNOWN_ERROR';
  }
}
