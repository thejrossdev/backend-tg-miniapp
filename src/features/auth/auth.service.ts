import { TELEGRAM_SESSION_TTL, TELEGRAM_SESSION_TTL_SEC } from '@/common/constants';
import { CryptoService, GI18nService } from '@/common/services';
import { Env, generateRefreshTime } from '@/common/utils';
import { TransactionService } from '@/database';
import {
	CreateUserDto,
	DeleteUserDto,
	InitUserDto,
	RefreshTokenDto,
	SignInUserDto,
	SignOutAllDeviceUserDto,
	SignOutUserDto,
	ValidateUserDto,
} from '@/features/auth/dto';
import { Session } from '@/features/auth/entities';
import { SessionExceptionNotFound } from '@/features/auth/exceptions';
import { AuthUserInit, AuthUserSessionAccessTokens, AuthUserSignedIn, AuthUserTokens } from '@/features/auth/types';
import { User } from '@/features/users/entities';
import { UserExceptionNotFound } from '@/features/users/exceptions';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { I18nContext } from 'nestjs-i18n';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

/**
 * Service for handling authentication, registration, session, and user security logic.
 */
@Injectable()
export class AuthService {
	/**
	 * Creates an instance of AuthService.
	 *
	 * @param {JwtService} jwtService - JWT service for token operations.
	 * @param {CryptoService} cryptoService - Crypto service for telegram hashing and encode/decode operations.
	 * @param {GI18nService} i18n - Service for translating.
	 * @param {Cache} cacheManager - Service for caching data (e.g. memory, redis storages).
	 * @param {ConfigService<Env>} config - Configuration service for environment variables.
	 * @param {Repository<User>} UserRepository - Repository for user entities.
	 * @param {Repository<Session>} SessionRepository - Repository for session entities.
	 * @param {TransactionService} transactionService - TransactionService to run typeorm query.
	 * @param {Logger} logger - Logger instance.
	 */
	constructor(
		private readonly jwtService: JwtService,
		private readonly cryptoService: CryptoService,
		private readonly i18n: GI18nService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly config: ConfigService<Env>,
		@InjectRepository(User)
		private readonly UserRepository: Repository<User>,
		@InjectRepository(Session)
		private readonly SessionRepository: Repository<Session>,
		private readonly transactionService: TransactionService,
		private readonly logger: Logger,
	) {}

	/**
	 * Signs in a user account.
	 *
	 * // TODO Create exceptions for this method
	 * @param {InitUserDto} dto - Sign-in DTO.
	 * @returns {Promise<AuthUserInit>} Login response with user data and tokens.
	 */
	async init(dto: InitUserDto): Promise<AuthUserInit> {
		const isValidTelegramData = this.validateTelegramInitData(dto.initData);

		if (!isValidTelegramData) {
			throw new UnauthorizedException(this.i18n.t('errors.auth.telegram.user-invalid'));
		}

		const sessionId = randomUUID();
		await this.cacheManager.set(sessionId, dto.initData, TELEGRAM_SESSION_TTL);

		return {
			data: sessionId,
		};
	}

	/**
	 * Signs in a user account.
	 *
	 * @param {SignInUserDto} dto - Sign-in DTO.
	 * @returns {Promise<AuthUserSignedIn} Login response with user data and tokens.
	 */
	async signIn(dto: SignInUserDto): Promise<AuthUserSignedIn> {
		const user = await this.validateUser(dto);
		const tokens = await this.generateTokens(user);
		const sessionData = this.SessionRepository.create({
			user_id: user.id,
			refresh_token: tokens.refresh_token,
			ip: dto.ip,
			device_name: dto.device_name,
			device_os: dto.device_os,
			browser: dto.browser,
			location: dto.location,
			userAgent: dto.userAgent,
		});
		const session = await this.SessionRepository.save(sessionData);

		const session_refresh_time = await generateRefreshTime();
		return {
			data: user,
			tokens: { ...tokens, session_token: session.id, session_refresh_time },
		};
	}

	/**
	 * Signs out the user from the current session.
	 *
	 * @param {SignOutUserDto} dto - Sign out DTO.
	 * @returns {Promise<void>}
	 * @throws {NotFoundException} If session is not found.
	 */
	async signOut(dto: SignOutUserDto): Promise<void> {
		const session = await this.SessionRepository.findOne({
			where: { id: dto.session_token },
		});
		if (!session) throw new SessionExceptionNotFound(dto.session_token, this.i18n);
		await this.SessionRepository.remove(session);
	}

	/**
	 * Signs out the user from all devices by user ID.
	 *
	 * @param {SignOutAllDeviceUserDto} dto - Sign out all devices DTO.
	 * @returns {Promise<void>}
	 */
	async signOutAllDevices(dto: SignOutAllDeviceUserDto): Promise<void> {
		await this.SessionRepository.delete({ user_id: dto.userId });
	}

	/**
	 * Generates access and refresh tokens for a user.
	 *
	 * @param {User} user - User entity.
	 * @returns {Promise<AuthUserTokens>} Object containing access and refresh tokens.
	 */
	async generateTokens(user: User): Promise<AuthUserTokens> {
		const [access_token, refresh_token] = await Promise.all([
			this.jwtService.signAsync(
				{
					id: user.id,
				},
				{
					secret: this.config.get('ACCESS_TOKEN_SECRET'),
					expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION'),
				},
			),
			this.jwtService.signAsync(
				{
					id: user.id,
				},
				{
					secret: this.config.get('REFRESH_TOKEN_SECRET'),
					expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION'),
				},
			),
		]);
		return {
			access_token,
			refresh_token,
		};
	}

	/**
	 * Refreshes the user's access token.
	 *
	 * @param {RefreshTokenDto} dto - Refresh token DTO.
	 * @returns {Promise<AuthUserSessionAccessTokens>} New tokens and session info.
	 * @throws {NotFoundException} If user or session is not found.
	 */
	async refreshToken(dto: RefreshTokenDto): Promise<AuthUserSessionAccessTokens> {
		const user = await this.UserRepository.findOne({
			where: { id: dto.user_id },
		});
		if (!user) throw new NotFoundException(this.i18n.t('errors.auth.user.not-found'));
		const { access_token, refresh_token } = await this.generateTokens(user);
		const session = await this.SessionRepository.findOne({
			where: {
				id: dto.session_token,
				user_id: dto.user_id,
			},
		});
		if (!session) throw new SessionExceptionNotFound(dto.session_token, this.i18n);
		session.refresh_token = refresh_token;
		const access_token_refresh_time = await generateRefreshTime();
		await this.SessionRepository.save(session);
		return {
			access_token,
			refresh_token,
			session_token: dto.session_token,
			access_token_refresh_time,
		};
	}

	/**
	 * Retrieves all sessions for a user by user ID.
	 *
	 * @param {string} userId - User ID.
	 * @returns {Promise<Session[]>} List of sessions.
	 */
	async getSessions(userId: string): Promise<Session[]> {
		return await this.SessionRepository.find({
			where: {
				user_id: userId,
			},
		});
	}

	/**
	 * Retrieves a session by session ID.
	 *
	 * @param {string} id - Session ID.
	 * @returns {Promise<Session>} Session entity.
	 * @throws {NotFoundException} If session is not found.
	 */
	async getSession(id: string): Promise<Session> {
		const session = await this.SessionRepository.findOne({
			where: {
				id: id,
			},
		});
		if (!session) throw new SessionExceptionNotFound(id, this.i18n);
		return session;
	}

	/**
	 * Deletes a user account.
	 *
	 * @param {DeleteUserDto} dto - Delete user DTO.
	 * @returns {Promise<void>}
	 * @throws {NotFoundException} If user is not found.
	 * @throws {BadRequestException} If credentials are invalid or deletion fails.
	 */
	async deleteAccount(dto: DeleteUserDto): Promise<void> {
		const user = await this.UserRepository.findOne({
			where: { id: dto.user_id },
		});
		if (!user) throw new UserExceptionNotFound(dto.user_id, this.i18n);
		try {
			await this.UserRepository.remove(user);
		} catch (e) {
			throw new BadRequestException(e);
		}
	}

	/**
	 * Registers a new user account with email and password.
	 *
	 * // TODO Create exceptions for this method
	 * @param {CreateUserDto} createUserDto - Data for creating a new user.
	 * @returns {Promise<User>} Registered user data.
	 * @throws {BadRequestException} If registration fails.
	 */
	async create(createUserDto: CreateUserDto): Promise<User> {
		try {
			const result = await this.transactionService.runInTransaction(async (manager) => {
				const user = manager.create(User, createUserDto);
				await manager.insert(User, user);

				if (createUserDto.referrerCode) {
					// TODO call create referral in service
				}

				return { user };
			});

			return result.user;
		} catch (e) {
			this.logger.error(e);
			throw new BadRequestException();
		}
	}

	/**
	 * Validates a user with identifier and password.
	 *
	 * // TODO Create exceptions for this method
	 * @param {ValidateUserDto} dto - Validation DTO containing initData and sessionId.
	 * @returns {Promise<User>} The validated user entity.
	 * @throws {NotFoundException} If user is not found.
	 * @throws {UnauthorizedException} If credentials are invalid or user data.
	 */
	async validateUser(dto: ValidateUserDto): Promise<User> {
		const isValidTelegramData = this.validateTelegramInitData(dto.initData);
		const memorySession = await this.cacheManager.get<string>(dto.sessionId);

		if (!isValidTelegramData || !memorySession) {
			throw new UnauthorizedException(this.i18n.t('errors.auth.telegram.user-not-init'));
		}

		if (memorySession !== dto.initData) {
			throw new UnauthorizedException(this.i18n.t('errors.auth.telegram.user-invalid'));
		}

		const telegramId = Number(this.getTelegramIdFromInitData(memorySession));
		const telegramIdHash = this.createTelegramIdHash(telegramId);

		let user = await this.UserRepository.findOne({
			where: [{ telegramIdHash: telegramIdHash }],
		});
		if (!user) {
			const telegramIdEncrypted = await this.cryptoService.encryptTelegramId(telegramId);
			const telegramIdHash = this.cryptoService.createTelegramIdHash(telegramId);
			const createDto: CreateUserDto = {
				telegramIdEncrypted,
				telegramIdHash,
				referrerCode: dto.referrerCode,
			};
			user = await this.create(createDto);
		}
		await this.cacheManager.del(dto.sessionId);
		return user;
	}

	/**
	 *  Get the Telegram UserId from initData.
	 *
	 * // TODO Create exceptions for this method
	 * @param {string} initData Safe initData from telegram.
	 * @returns {number} Telegram UserId.
	 * @throws {UnauthorizedException} if not found user string or user id in initData
	 */
	private getTelegramIdFromInitData(initData: string): number {
		const params = new URLSearchParams(initData);
		const userStr = params.get('user');

		if (!userStr) {
			throw new UnauthorizedException(this.i18n.t('errors.auth.telegram.user-data-not-found'));
		}

		const user = JSON.parse(userStr);

		if (!user.id) {
			throw new UnauthorizedException(this.i18n.t('errors.auth.telegram.user-id-not-found'));
		}

		return Number(user.id);
	}

	/**
	 * Create HMAC-SHA256 hash for Telegram UserId
	 *
	 * @param {number} telegramId The initData from Telegram.
	 * @param {string} secret The secret 256bit key for hashing.
	 * @returns {string} HMAC-SHA256 hash of Telegram UserId.
	 */
	private createTelegramIdHash(telegramId: number, secret?: string): string {
		secret = this.config.getOrThrow<string>('TELEGRAM_SECRET');
		return crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
	}

	/**
	 * Verify HMAC-SHA256 hash of Telegram UserId. Compare with stored hash.
	 *
	 * @param {number} telegramId The initData from Telegram.
	 * @param {string} storedHash Hashed Telegram UserId.
	 * @param {string} secret The secret 256bit key for hashing.
	 * @returns {string} HMAC-SHA256 hash of Telegram UserId.
	 */
	private verifyTelegramIdHash(telegramId: number, storedHash: string, secret?: string): boolean {
		const computedHash = this.createTelegramIdHash(telegramId, secret);
		return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
	}

	/**
	 * Validates the Telegram Web App initData.
	 * Based on: https://core.telegram.org/bots/webapps#validating-data-from-web-apps
	 *
	 * // TODO Create exceptions for this method
	 * @param {string} initData The initData string from Telegram.
	 * @returns {Boolean} if the data is valid, false otherwise.
	 * @throws {UnauthorizedException} if telegram token are invalid or older than 5 mins
	 */
	private validateTelegramInitData(initData: string): boolean {
		if (!initData) return false;

		const botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

		const params = new URLSearchParams(initData);
		const hash = params.get('hash');
		params.delete('hash'); // Remove hash from parameters to calculate it

		const sortedParams = Array.from(params.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

		let dataCheckString = '';
		for (const [key, value] of sortedParams) {
			dataCheckString += `${key}=${value}\n`;
		}
		// Remove the trailing newline character
		dataCheckString = dataCheckString.slice(0, -1);

		const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken);
		const computedHash = crypto.createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

		if (computedHash !== hash) {
			throw new UnauthorizedException(
				this.i18n.t('errors.auth.telegram.invalid-hash', { lang: I18nContext.current()?.lang }),
			);
		}

		// Check the auth_date to prevent replay attacks
		const authDate = Number(params.get('auth_date'));
		const now = Math.floor(Date.now() / 1000);
		if (!authDate || now - authDate > TELEGRAM_SESSION_TTL_SEC) {
			throw new UnauthorizedException(
				this.i18n.t('errors.auth.telegram.expired', {
					lang: I18nContext.current()?.lang,
				}),
			);
		}

		return true;
	}
}
