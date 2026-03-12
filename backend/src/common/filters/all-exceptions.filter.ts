import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Une erreur interne est survenue';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse;
    } else {
      // Erreur non-HTTP (Prisma, runtime, etc.) → logger + masquer en prod
      this.logger.error(
        `Erreur non gérée: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );

      if (process.env.NODE_ENV !== 'production') {
        message = {
          statusCode: status,
          message: exception instanceof Error ? exception.message : String(exception),
          error: 'Internal Server Error',
        };
      } else {
        message = {
          statusCode: status,
          message: 'Une erreur interne est survenue',
          error: 'Internal Server Error',
        };
      }
    }

    response.status(status).json(
      typeof message === 'string' ? { statusCode: status, message } : message,
    );
  }
}
