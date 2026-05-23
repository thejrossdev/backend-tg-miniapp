import { TELEGRAM_SESSION_TTL } from '@/common/constants';
import { GI18nService, TelegramService } from '@/common/services';
import { Env, generateRefreshTime } from '@/common/utils';
import { RefreshTokenDto, SignInUserDto, SignOutAllDeviceUserDto, SignOutUserDto } from '@/features/auth/dto';
import { Session } from '@/features/auth/entities';
import { SessionExceptionNotFound, TelegramExceptionInvalid } from '@/features/auth/exceptions';
import { AuthExceptionNotInit } from '@/features/auth/exceptions/auth-not-init.exception';
import { AuthUserInit, AuthUserSessionAccessTokens, AuthUserSignedIn, AuthUserTokens } from '@/features/auth/types';
import { UserDtoCreate, UserDtoDelete, UserDtoInit, UserDtoValidate } from '@/features/users/dto';
import { User } from '@/features/users/entities';
import { UserExceptionNotFound } from '@/features/users/exceptions';
import { UsersService } from '@/features/users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
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
	 * @param {TelegramService} telegramService - Telegram service for telegram data hashing and encode/decode operations.
	 * @param {UsersService} usersService - Service for users operations.
	 * @param {GI18nService} i18n - Service for translating.
	 * @param {Cache} cacheManager - Service for caching data (e.g. memory, redis storages).
	 * @param {ConfigService<Env>} config - Configuration service for environment variables.
	 * @param {Repository<User>} UserRepository - Repository for user entities.
	 * @param {Repository<Session>} SessionRepository - Repository for session entities.
	 * @param {Logger} logger - Logger instance.
	 */
	constructor(
		private readonly jwtService: JwtService,
		private readonly telegramService: TelegramService,
		private readonly usersService: UsersService,
		private readonly i18n: GI18nService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly config: ConfigService<Env>,
		@InjectRepository(User)
		private readonly UserRepository: Repository<User>,
		@InjectRepository(Session)
		private readonly SessionRepository: Repository<Session>,
		private readonly logger: Logger,
	) {}

	/**
	 * Signs in a user account.
	 *
	 * @param {InitUserDto} dto - Sign-in DTO.
	 * @returns {Promise<AuthUserInit>} Login response with user data and tokens.
	 * @throws{TelegramExceptionInvalid} if telegram token are invalid or older than 5 mins
	 */
	async init(dto: UserDtoInit): Promise<AuthUserInit> {
		this.telegramService.validateInitData(dto.initData);
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
	 * @throws {SessionExceptionNotFound} If session is not found.
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
	 * @throws {SessionExceptionNotFound} If user or session is not found.
	 * @throws {UserExceptionNotFound} If user is not found.
	 */
	async refreshToken(dto: RefreshTokenDto): Promise<AuthUserSessionAccessTokens> {
		const user = await this.UserRepository.findOne({
			where: { id: dto.user_id },
		});
		if (!user) throw new UserExceptionNotFound(dto.user_id, this.i18n);
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
	 * @throws {SessionExceptionNotFound} If session is not found.
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
	 * @param {UserDtoDelete} dto - Delete user DTO.
	 * @returns {Promise<void>}
	 * @throws {UserExceptionNotFound} If user is not found.
	 * @throws {UserExceptionDeleteFail} If credentials are invalid or deletion fails.
	 */
	async deleteAccount(dto: UserDtoDelete): Promise<void> {
		await this.usersService.delete(dto);
	}

	/**
	 * Validates a user with identifier and password.
	 *
	 * @param {UserDtoValidate} dto - Validation DTO containing initData and sessionId.
	 * @returns {Promise<User>} The validated user entity.
	 * @throws {AuthExceptionNotInit} If user was not init.
	 * @throws{TelegramExceptionInvalid}  if telegram token are invalid or older than 5 mins
	 */
	async validateUser(dto: UserDtoValidate): Promise<User> {
		const isValidTelegramData = this.telegramService.validateInitData(dto.initData);
		const memorySession = await this.cacheManager.get<string>(dto.sessionId);

		if (!isValidTelegramData || !memorySession) {
			throw new AuthExceptionNotInit(this.i18n);
		}

		if (memorySession !== dto.initData) {
			throw new TelegramExceptionInvalid(dto.initData, this.i18n);
		}

		const telegramUser = this.telegramService.getUserFromInitData(memorySession);
		const telegramId = telegramUser.id;
		const telegramIdHash = this.telegramService.createIdHash(telegramId);

		let user = await this.UserRepository.findOne({
			where: [{ telegramIdHash: telegramIdHash }],
		});
		if (!user) {
			const telegramIdEncrypted = await this.telegramService.encryptId(telegramId);
			const createDto: UserDtoCreate = {
				telegramIdEncrypted,
				telegramIdHash,
				referrerCode: dto.referrerCode,
			};
			user = await this.usersService.create(createDto);
		}
		await this.cacheManager.del(dto.sessionId);
		return user;
	}
}
