import { FastifyNext } from '@/common/types';
import { concatStr } from '@/common/utils';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from 'nestjs-pino';

/**
 * Middleware for logging HTTP requests in a NestJS application.
 *
 * Logs the HTTP method and URL for each incoming request using the Pino logger.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	/**
	 * Creates an instance of LoggerMiddleware.
	 *
	 * @param {Logger} logger - The Pino logger instance injected by the NestJS DI container.
	 */
	constructor(private readonly logger: Logger) {}

	/**
	 * Logs the HTTP method and original URL of each incoming request.
	 *
	 * @param {FastifyRequest} rep - The Fastify request object.
	 * @param {FastifyReply} res - The Fastify response object.
	 * @param {FastifyNext} next - The next middleware function in the chain.
	 * @returns {void}
	 */
	use(rep: FastifyRequest, res: FastifyReply, next: FastifyNext): void {
		this.logger.log(concatStr([rep.method, rep.originalUrl]), 'Request');
		next();
	}
}
