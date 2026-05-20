import { Role } from '@/common/enums';
import { Public, Roles, User as UserDec } from '@/common/decorators';
import { JwtRefreshGuard } from '@/common/guards/jwt-refresh.guard';
import {
	BadRequestResponseWithError,
	MessageResponse,
	NotFoundResponseWithError,
	UnauthorizedResponse,
	UnauthorizedResponseWithError,
} from '@/common/types';
import {
	DeleteUserDto,
	RefreshTokenDto,
	SignInUserDto,
	SignOutAllDeviceUserDto,
	SignOutUserDto,
} from '@/features/auth/dto';
import { InitUserDto } from '@/features/auth/dto/init-user.dto';
import {
	AuthResponseRefreshToken,
	AuthResponseSession,
	AuthResponseSessions,
	AuthResponseSignIn,
	AuthResponseUserInit,
} from '@/features/auth/response';
import { User } from '@/features/users/entities/user.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiProperty,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AuthService } from './auth.service';

/**
 * Controller for handling authentication and user account related endpoints.
 */
@Controller('auth')
export class AuthController {
	/**
	 * Creates an instance of AuthController.
	 *
	 * @param {AuthService} authService - The authentication service.
	 */
	constructor(private readonly authService: AuthService) {}

	/**
	 * Signs in a user.
	 *
	 * @param {InitUserDto} initUserDto - User credentials for init.
	 * @returns {Promise<AuthResponseUserInit>} Initialized response with temporary SessionId.
	 */
	@ApiBody({
		type: InitUserDto,
		description: 'Telegram WebApp init data',
	})
	@ApiOkResponse({
		description: 'Successfully initialized the user',
		type: AuthResponseUserInit,
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponseWithError,
		example: {
			message: 'User are invalid!',
			error: 'Unauthorized',
			statusCode: 401,
		},
	})
	@Public()
	@Post('init')
	async initTelegramAuth(@Body() initUserDto: InitUserDto): Promise<AuthResponseUserInit> {
		return await this.authService.init(initUserDto);
	}

	/**
	 * Signs in a user.
	 *
	 * @param {SignInUserDto} signInUserDto - User credentials for sign in.
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<AuthResponseSignIn>} Sign-in response with tokens and user data.
	 */
	@ApiBody({
		type: SignInUserDto,
		description: 'User credentials for sign in',
	})
	@ApiOkResponse({
		description: 'Successfully signed in',
		type: AuthResponseSignIn,
	})
	@ApiBadRequestResponse({
		type: BadRequestResponseWithError,
		example: {
			message: 'Something went wrong!',
			error: 'Bad request',
			statusCode: 500,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponseWithError,
		example: {
			message: 'User are invalid!',
			error: 'Unauthorized',
			statusCode: 401,
		},
	})
	@Public()
	@Post('sign-in')
	async init(@Body() signInUserDto: SignInUserDto, @I18n() i18n: I18nContext): Promise<AuthResponseSignIn> {
		const data = await this.authService.signIn(signInUserDto);
		const { telegramIdEncrypted, telegramIdHash, sessions, ...result } = data.data;

		return {
			message: await i18n.t('success.auth.sign-in'),
			data: result,
			tokens: data.tokens,
		};
	}

	/**
	 * Signs out the user from the current session.
	 *
	 * @param {SignOutUserDto} signOutUserDto - Data for signing out.
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<MessageResponse>} Response message.
	 */
	@ApiBody({
		type: SignOutUserDto,
		description: 'User credentials for sign out',
	})
	@ApiOkResponse({
		type: MessageResponse,
	})
	@ApiNotFoundResponse({
		type: NotFoundResponseWithError,
		example: {
			message: 'Session not found',
			error: 'Not found',
			statusCode: 404,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Post('sign-out')
	async signOut(@Body() signOutUserDto: SignOutUserDto, @I18n() i18n: I18nContext): Promise<MessageResponse> {
		await this.authService.signOut(signOutUserDto);
		return { message: await i18n.t('success.auth.sign-out') };
	}

	/**
	 * Signs out the user from all devices.
	 *
	 * @param {SignOutAllDeviceUserDto} dto - Data for signing out from all devices.
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<MessageResponse>} Response message.
	 */
	@ApiBody({
		type: SignOutAllDeviceUserDto,
		description: 'User credentials for sign out from all devices',
	})
	@ApiOkResponse({
		type: MessageResponse,
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Post('sign-out-allDevices')
	async signOutAllDevices(@Body() dto: SignOutAllDeviceUserDto, @I18n() i18n: I18nContext): Promise<MessageResponse> {
		await this.authService.signOutAllDevices(dto);
		return { message: await i18n.t('success.auth.sign-out-allDevices') };
	}

	/**
	 * Retrieves all sessions for a user.
	 *
	 * @param {string} userId - ID of the user.
	 * @returns {Promise<AuthResponseSessions>} List of user sessions.
	 */
	@ApiProperty({
		description: 'UUID of user',
		type: 'string',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
	})
	@ApiOkResponse({
		type: AuthResponseSessions,
	})
	@ApiBadRequestResponse({
		type: BadRequestResponseWithError,
		example: {
			message: 'Something went wrong!',
			error: 'Bad request',
			statusCode: 500,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Get('sessions/:userId')
	@Roles(Role.ADMIN)
	async sessions(@Param('userId') userId: string): Promise<AuthResponseSessions> {
		const data = await this.authService.getSessions(userId);
		return { data };
	}

	/**
	 * Retrieves all sessions for current user.
	 *
	 * @param {User} user - ID of the user.
	 * @returns {Promise<AuthResponseSessions>} List of user sessions.
	 */
	@ApiOkResponse({
		type: AuthResponseSessions,
	})
	@ApiBadRequestResponse({
		type: BadRequestResponseWithError,
		example: {
			message: 'Something went wrong!',
			error: 'Bad request',
			statusCode: 500,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Get('sessions/me')
	async sessionsMe(@UserDec() user: User): Promise<AuthResponseSessions> {
		const data = await this.authService.getSessions(user.id);
		return { data };
	}

	/**
	 * Retrieves a session by ID.
	 *
	 * @param {string} id - Session ID.
	 * @returns {Promise<AuthResponseSession>} Session details.
	 */
	@ApiProperty({
		description: 'UUID of session',
		type: 'string',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
	})
	@ApiOkResponse({
		type: AuthResponseSession,
	})
	@ApiNotFoundResponse({
		type: NotFoundResponseWithError,
		example: {
			message: 'Session not found',
			error: 'Not found',
			statusCode: 404,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Get('session/:id')
	async session(@Param('id') id: string): Promise<AuthResponseSession> {
		const data = await this.authService.getSession(id);
		return { data };
	}

	/**
	 * Refreshes the access token using a refresh token.
	 *
	 * @param {RefreshTokenDto} dto - Data for refreshing the token.
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<AuthResponseRefreshToken>} Refresh token response.
	 */
	@ApiBody({
		type: RefreshTokenDto,
		description: 'Data for refreshing the token',
	})
	@ApiOkResponse({
		type: AuthResponseRefreshToken,
	})
	@ApiNotFoundResponse({
		type: NotFoundResponseWithError,
		example: {
			message: 'User not found',
			error: 'Not found',
			statusCode: 404,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@UseGuards(JwtRefreshGuard)
	@Patch('refresh-token')
	async refreshToken(@Body() dto: RefreshTokenDto, @I18n() i18n: I18nContext): Promise<AuthResponseRefreshToken> {
		const data = await this.authService.refreshToken(dto);
		return {
			message: await i18n.t('refresh-token'),
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			access_token_refresh_time: data.access_token_refresh_time,
			session_token: data.session_token,
		};
	}

	/**
	 * Deletes the user account.
	 *
	 * @param {DeleteUserDto} deleteUserDto - Data for deleting the user.
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<MessageResponse>} Response message.
	 */
	@ApiBody({
		type: DeleteUserDto,
		description: 'Data for deleting the user',
	})
	@ApiOkResponse({
		type: MessageResponse,
	})
	@ApiNotFoundResponse({
		type: NotFoundResponseWithError,
		example: {
			message: 'User not found',
			error: 'Not found',
			statusCode: 404,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Delete('delete-account')
	@Roles(Role.ADMIN)
	async deleteUser(@Body() deleteUserDto: DeleteUserDto, @I18n() i18n: I18nContext): Promise<MessageResponse> {
		await this.authService.deleteAccount(deleteUserDto);
		return { message: await i18n.t('delete-account') };
	}
}
