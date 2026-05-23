import { Env } from '@/common/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';

/**
 * Service for managing HTTP cookies in Fastify responses.
 * Provides methods for setting, setting with infinite expiration, and clearing cookies
 * with secure default configurations including HTTP-only, secure, and signed options.
 */
@Injectable()
export class CookieService {
	/**
	 * Creates an instance of CookieService.
	 *
	 * @param configService - Configuration service for accessing environment variables like COOKIE_DOMAIN
	 */
	constructor(private readonly configService: ConfigService<Env>) {}

	/**
	 * Sets a cookie with specified expiration date and secure configuration.
	 * Configures the cookie with HTTP-only, secure, signed, and lax same-site policies for security.
	 *
	 * @param rep - The Fastify response object to set the cookie on
	 * @param key - The name/key of the cookie
	 * @param value - The value to store in the cookie
	 * @param expires - The expiration date for the cookie
	 * @returns The modified FastifyReply object with the cookie set
	 */
	set(rep: FastifyReply, key: string, value: string, expires: Date): FastifyReply {
		return rep.setCookie(key, value, {
			domain: this.configService.getOrThrow<string>('COOKIE_DOMAIN'),
			httpOnly: true,
			secure: true,
			signed: true,
			path: '/',
			expires,
			sameSite: 'lax',
		});
	}

	/**
	 * Sets a cookie with effectively infinite expiration (20 years).
	 * Useful for long-lived authentication tokens or persistent user preferences.
	 *
	 * @param rep - The Fastify response object to set the cookie on
	 * @param key - The name/key of the cookie
	 * @param value - The value to store in the cookie
	 * @returns The modified FastifyReply object with the cookie set
	 */
	setInf(rep: FastifyReply, key: string, value: string): FastifyReply {
		return this.set(rep, key, value, new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000));
	}

	/**
	 * Clears/removes a cookie by setting it to expire immediately.
	 * Uses the same secure configuration as when setting cookies to ensure proper removal.
	 *
	 * @param rep - The Fastify response object to clear the cookie from
	 * @param key - The name/key of the cookie to clear
	 * @returns The modified FastifyReply object with the cookie cleared
	 */
	clear(rep: FastifyReply, key: string): FastifyReply {
		return rep.clearCookie(key, {
			domain: this.configService.getOrThrow<string>('COOKIE_DOMAIN'),
			httpOnly: true,
			secure: true,
			signed: true,
			path: '/',
			sameSite: 'lax',
		});
	}
}
