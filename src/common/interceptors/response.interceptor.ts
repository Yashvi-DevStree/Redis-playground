/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((response) => {
                // If the service explicitly returns { success, message, data } already, skip wrapping
                if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
                    return response;
                }

                let message = 'Request successful';

                // Optional: customize message based on request method
                switch (request.method) {
                    case 'POST':
                        message = 'Created successfully';
                        break;
                    case 'PUT':
                    case 'PATCH':
                        message = 'Updated successfully';
                        break;
                    case 'DELETE':
                        message = 'Deleted successfully';
                        break;
                    case 'GET':
                        message = 'Fetched successfully';
                        break;
                }

                return {
                    success: true,
                    message,
                    data: response,
                };
            }),
        );
    }
}
