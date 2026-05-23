import { AUTH_REFRESH_TOKEN_NAME, AUTH_SESSION_NAME, AUTH_USER_ID_NAME } from '@/common/constants/auth';
import { Env } from '@/common/utils';
import { AuthService } from '@/features/auth/auth.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from 'src/common/decorators';

/**
 * JWT Authentication Guard for protecting routes in a NestJS application.
 * Implements JWT-based authentication by validating access tokens in the Authorization header.
 * Supports public routes through the @Public() decorator and automatically attaches the decoded user payload to the request object.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	/**
	 * Creates an instance of JwtAuthGuard.
	 *
	 * @param jwtService - Service for JWT token operations (verify, decode)
	 * @param reflector - NestJS utility for reading metadata from decorators
	 * @param configService - Configuration service for accessing environment variables
	 * @param authService - Authentication service for handling token refresh operations
	 */
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
		private configService: ConfigService<Env>,
		private authService: AuthService,
	) {}

	/**
	 * Determines if the current request should be allowed to proceed.
	 * Performs authentication by checking for public routes, extracting JWT tokens,
	 * verifying tokens, and attaching user payload to the request object.
	 *
	 * @param context - The execution context containing request/response information
	 * @returns Promise resolving to true if authentication succeeds
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}
		const request = context.switchToHttp().getRequest<FastifyRequest>();
		const response = context.switchToHttp().getResponse<FastifyReply>();
		let token = this.extractTokenFromHeader(request) ?? '';
		let user: any = undefined;
		try {
			user = await this.jwtService.verifyAsync(token, {
				secret: this.configService.get('ACCESS_TOKEN_SECRET'),
			});
			// @ts-ignore
			request.user = user;
		} catch {}

		if (!user && request.cookies?.['refresh_token']) {
			try {
				token = await this.handleRefresh(request, response);
				user = await this.jwtService.verifyAsync(token, {
					secret: this.configService.get('ACCESS_TOKEN_SECRET'),
				});
				// @ts-ignore
				request.user = user;
			} catch (e) {
				throw new UnauthorizedException(e, 'No valid session');
			}
		}

		return true;
	}

	/**
	 * Handles token refresh when the access token is invalid but a refresh token exists.
	 * Extracts session, user ID, and refresh tokens from cookies, then requests a new access token.
	 *
	 * @param request - The Fastify request object containing cookies
	 * @param response - The Fastify response object for setting new cookies
	 * @returns Promise resolving to the new access token string
	 * @throws UnauthorizedException if refresh operation fails
	 */
	private async handleRefresh(request: FastifyRequest, response: FastifyReply): Promise<string> {
		try {
			const session_token = request.unsignCookie(request.cookies?.[AUTH_SESSION_NAME] ?? '');
			const user_id = request.unsignCookie(request.cookies?.[AUTH_USER_ID_NAME] ?? '');
			const refresh_token = request.unsignCookie(request.cookies?.[AUTH_REFRESH_TOKEN_NAME] ?? '');
			const { access_token } = await this.authService.refreshToken(response, {
				session_token: session_token.valid ? session_token.value : '',
				user_id: user_id.valid ? user_id.value : '',
				refresh_token: refresh_token.valid ? refresh_token.value : '',
			});
			const token = access_token;

			request.headers.authorization = `Bearer ${token}`;

			return token;
		} catch (error) {
			throw new UnauthorizedException(error, 'No valid session');
		}
	}

	/**
	 * Extracts the JWT token from the Authorization header.
	 * Parses the Authorization header expecting "Bearer <token>" format and validates the authorization type.
	 *
	 * @param request - The Fastify request object containing headers
	 * @returns The JWT token string if found and valid, undefined otherwise
	 */
	private extractTokenFromHeader(request: FastifyRequest): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
