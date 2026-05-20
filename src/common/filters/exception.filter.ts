import { ErrorCode } from '@/common/enums';
import { GI18nService } from '@/common/services';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class RequestExceptionFilter implements ExceptionFilter {
	/**
	 * Creates an instance of RequestExceptionFilter.
	 *
	 * @param {GI18nService} i18n - Service for translating.
	 */
	constructor(private readonly i18n: GI18nService) {}

	/**
	 * Creates an instance of RequestExceptionFilter.
	 *
	 * @param {any} exception - Any exception.
	 * @param {ArgumentsHost} host - Allows choosing the appropriate execution context (e.g., Http, RPC, or WebSockets) to retrieve the arguments from.
	 */
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const rep = ctx.getResponse<FastifyReply>();
		const req = ctx.getRequest<FastifyRequest>();

		const traceId =
			(req.headers['x-trace-id'] as string) || (req.headers['x-request-id'] as string) || randomUUID();

		// Default fallback
		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let code = ErrorCode.INTERNAL_ERROR;
		let message = this.i18n.t('exceptions.INTERNAL_ERROR');
		let details: unknown = undefined;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const response = exception.getResponse();

			// Allow throwing structured payloads safely
			if (typeof response === 'object' && response) {
				const r = response as any;
				code = r.code ?? code;
				message = r.message ?? message;
				details = r.details ?? undefined;
			} else {
				message = response;
			}

			// If it’s a 404, give a “next action” style message
			if (status === 404 && code === ErrorCode.INTERNAL_ERROR) {
				code = ErrorCode.NOT_FOUND;
				message = this.i18n.t('exceptions.NOT_FOUND');
			}
		}

		rep.code(status).send({
			success: false,
			statusCode: status,
			code,
			message,
			details,
			traceId,
			path: req.originalUrl || req.url,
			method: req.method,
			timestamp: new Date().toISOString(),
		});
	}
}
