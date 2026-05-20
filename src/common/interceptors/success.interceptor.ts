import { TSuccessMessageItem } from '@/common/constants';
import { SUCCESS_MESSAGE_ARGS, SUCCESS_MESSAGE_KEY } from '@/common/decorators';
import { SuccessResponseFactory } from '@/common/factories';
import { SuccessResponse } from '@/common/types';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { map, Observable } from 'rxjs';

/**
 * Interceptor that wraps successful HTTP responses in a standardized SuccessResponse format.
 * Adds request metadata (path, method, trace ID) and uses the SuccessResponseFactory for formatting.
 */
@Injectable()
export class SuccessInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
	constructor(
		private readonly successFactory: SuccessResponseFactory,
		private readonly reflector: Reflector,
	) {}

	/**
	 * Processes the response by wrapping it in a SuccessResponse object with metadata.
	 *
	 * @param {ExecutionContext} context - The execution context containing request/response objects
	 * @param {CallHandler} next - The call handler to process the request
	 * @returns {Observable<SuccessResponse<T>>} Observable of SuccessResponse wrapped data
	 */
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest<FastifyRequest>();
		const rep = context.switchToHttp().getResponse<FastifyReply>();
		const path = req.url;
		const method = req.method;

		const traceId = (req.headers['x-trace-id'] as string) || crypto.randomUUID();
		const messages = this.reflector.get<TSuccessMessageItem[]>(SUCCESS_MESSAGE_KEY, context.getHandler());
		const staticArgs = this.reflector.get<Record<string, any>>(SUCCESS_MESSAGE_ARGS, context.getHandler());

		return next.handle().pipe(
			map((data) => {
				const statusCode = rep.statusCode || 200;

				let messageKey: string | undefined;
				let messageArgs: Record<string, any> = { ...(staticArgs ?? {}) };

				if (messages && messages.length > 0) {
					const normalizedMessages = messages.map((msg) => (typeof msg === 'string' ? { key: msg } : msg));

					const selected = normalizedMessages.find((msg) => {
						if (!msg.condition) return true;
						return msg.condition(data, req);
					});

					if (selected) {
						messageKey = selected.key;

						if (typeof selected.args === 'function') {
							const dynamicArgs = selected.args(data, req);
							if (dynamicArgs) {
								messageArgs = { ...messageArgs, ...dynamicArgs };
							}
						}
						// Статические args объекта
						else if (selected.args) {
							messageArgs = { ...messageArgs, ...selected.args };
						}
					}
				}

				return this.successFactory.create(data, {
					statusCode,
					path,
					method,
					traceId,
					messageKey,
					messageArgs,
				});
			}),
		);
	}
}
