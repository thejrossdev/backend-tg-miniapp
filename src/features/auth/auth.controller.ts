import { Public, Roles, SuccessMessage, User as UserDec } from '@/common/decorators';
import { Role } from '@/common/enums';
import { BadResponse, InternalResponse, SuccessResponse } from '@/common/types';
import { SignInUserDto, SignOutAllDeviceUserDto, SignOutUserDto } from '@/features/auth/dto';
import { Session } from '@/features/auth/entities';
import {
	AuthResponseUserInit,
	AuthResponseUserSession,
	AuthResponseUserSessions,
	AuthResponseUserSignedInSafe,
	AuthUserInit,
	AuthUserSignedInSafe,
	SessionSafe,
} from '@/features/auth/types';
import { UserDtoDelete, UserDtoInit } from '@/features/users/dto';
import { User } from '@/features/users/entities';
import { Body, Controller, Delete, Get, Param, Post, Req, Res } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiProperty,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
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
	 * @param {UserDtoInit} userDtoInit - User credentials for init.
	 * @returns {Promise<AuthUserInit>} Initialized response with temporary SessionId.
	 * @throws{TelegramExceptionInvalid} if telegram token are invalid or older than 5 mins
	 */
	@ApiBody({
		type: UserDtoInit,
		description: 'Telegram WebApp init data',
	})
	@ApiOkResponse({
		type: AuthResponseUserInit,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiUnauthorizedResponse({
		description: 'Telegram token/data are invalid or older than 5 mins',
		type: InternalResponse,
	})
	@SuccessMessage('success.auth.init')
	@Public()
	@Post('init')
	async initTelegramAuth(@Body() userDtoInit: UserDtoInit): Promise<AuthUserInit> {
		return await this.authService.init(userDtoInit);
	}

	/**
	 * Signs in a user.
	 *
	 * @param {FastifyRequest} req - Fastify request
	 * @param {FastifyReply} rep - Fastify reply
	 * @param {SignInUserDto} signInUserDto - User credentials for sign in.
	 * @returns {Promise<AuthUserSignedInSafe >} Sign-in response with tokens and user data.
	 */
	@ApiBody({
		type: SignInUserDto,
		description: 'User credentials for sign in',
	})
	@ApiOkResponse({
		type: AuthResponseUserSignedInSafe,
	})
	@ApiUnauthorizedResponse({
		description: 'Telegram token/data are invalid or older than 5 mins',
		type: InternalResponse,
	})
	@ApiUnauthorizedResponse({
		description: 'User was not initialized',
		type: InternalResponse,
	})
	@ApiInternalServerErrorResponse({
		description: 'Cant create a user',
		type: InternalResponse,
	})
	@Public()
	@SuccessMessage('success.auth.sign-in')
	@Post('sign-in')
	async signIn(
		@Req() req: FastifyRequest,
		@Res({ passthrough: true }) rep: FastifyReply,
		@Body() signInUserDto: SignInUserDto,
	): Promise<AuthUserSignedInSafe> {
		const data = await this.authService.signIn(rep, signInUserDto);
		return {
			user: data.user,
			tokens: data.tokens,
		};
	}

	/**
	 * Signs out the user from the current session.
	 *
	 * @param {FastifyRequest} req - Fastify request
	 * @param {FastifyReply} rep - Fastify reply
	 * @param {SignOutUserDto} signOutUserDto - Data for signing out.
	 * @returns {Promise<SuccessResponse>} Response message.
	 * @throws {SessionExceptionNotFound} If session is not found.
	 */
	@ApiBody({
		type: SignOutUserDto,
		description: 'User credentials for sign out',
	})
	@ApiOkResponse({
		type: SuccessResponse,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiNotFoundResponse({
		description: 'User not found',
		type: InternalResponse,
	})
	@ApiBearerAuth('Bearer')
	@SuccessMessage('success.auth.sign-out')
	@Post('sign-out')
	async signOut(
		@Req() req: FastifyRequest,
		@Res({ passthrough: true }) rep: FastifyReply,
		@Body() signOutUserDto: SignOutUserDto,
	): Promise<void> {
		await this.authService.signOut(rep, signOutUserDto);
	}

	/**
	 * Signs out the user from all devices.
	 *
	 * @param {FastifyRequest} req - Fastify request
	 * @param {FastifyReply} rep - Fastify reply
	 * @param {SignOutAllDeviceUserDto} dto - Data for signing out from all devices.
	 * @returns {Promise<void>} Response message.
	 */
	@ApiBody({
		type: SignOutAllDeviceUserDto,
		description: 'User credentials for sign out from all devices',
	})
	@ApiOkResponse({
		type: SuccessResponse,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiBearerAuth('Bearer')
	@SuccessMessage('success.auth.sign-out-all')
	@Post('sign-out-allDevices')
	async signOutAllDevices(
		@Req() req: FastifyRequest,
		@Res({ passthrough: true }) rep: FastifyReply,
		@Body() dto: SignOutAllDeviceUserDto,
	): Promise<void> {
		await this.authService.signOutAllDevices(rep, dto);
	}

	/**
	 * Retrieves all sessions for a user.
	 *
	 * @param {string} userId - ID of the user.
	 * @returns {Promise<SessionSafe[]>} List of user sessions.
	 */
	@ApiProperty({
		description: 'UUID of user',
		type: 'string',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
	})
	@ApiOkResponse({
		type: AuthResponseUserSessions,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiBearerAuth('Bearer')
	@SuccessMessage('success.auth.sessions.found')
	@Get('sessions/:userId')
	@Roles(Role.ADMIN)
	async sessions(@Param('userId') userId: string): Promise<SessionSafe[]> {
		const sessions = await this.authService.getSessions(userId);
		return sessions.map((session: Session) => this.authService.getSafeSession(session));
	}

	/**
	 * Retrieves all sessions for current user.
	 *
	 * @param {User} user - ID of the user.
	 * @returns {Promise<SessionSafe[]>} List of user sessions.
	 */
	@ApiOkResponse({
		type: AuthResponseUserSessions,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiBearerAuth('Bearer')
	@SuccessMessage('success.auth.sessions.found')
	@Get('sessions/me')
	async sessionsMe(@UserDec() user: User): Promise<SessionSafe[]> {
		const sessions = await this.authService.getSessions(user.id);
		return sessions.map((session: Session) => this.authService.getSafeSession(session));
	}

	/**
	 * Retrieves a session by ID.
	 *
	 * @param {string} id - Session ID.
	 * @returns {Promise<SessionSafe>} Session details.
	 * @throws {SessionExceptionNotFound} If session is not found.
	 */
	@ApiProperty({
		description: 'UUID of session',
		type: 'string',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
	})
	@ApiOkResponse({
		type: AuthResponseUserSession,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiNotFoundResponse({
		description: 'Session not found',
		type: InternalResponse,
	})
	@ApiBearerAuth('Bearer')
	@SuccessMessage('success.auth.session.found')
	@Get('session/:id')
	async session(@Param('id') id: string): Promise<SessionSafe> {
		return this.authService.getSafeSession(await this.authService.getSession(id));
	}

	// Now refresh working with JwtAuthGuard via cookies
	// /**
	//  * Refreshes the access token using a refresh token.
	//  *
	//  * @param {FastifyRequest} req - Fastify request
	//  * @param {FastifyReply} rep - Fastify reply
	//  * @param {RefreshTokenDto} dto - Data for refreshing the token.
	//  * @returns {Promise<AuthUserSessionAccessTokensSafe>} Refresh token response.
	//  */
	// @ApiBody({
	// 	type: RefreshTokenDto,
	// 	description: 'Data for refreshing the token',
	// })
	// @ApiOkResponse({
	// 	type: AuthResponseUserSessionAccessTokensSafe,
	// })
	// @ApiBadRequestResponse({
	// 	description: 'Validation failed',
	// 	type: BadResponse,
	// })
	// @ApiNotFoundResponse({
	// 	description: 'User not found',
	// 	type: InternalResponse,
	// })
	// @ApiNotFoundResponse({
	// 	description: 'Session not found',
	// 	type: InternalResponse,
	// })
	// @ApiBearerAuth('Bearer')
	// @SuccessMessage('success.auth.refresh')
	// @UseGuards(JwtRefreshGuard)
	// @Patch('refresh-token')
	// async refreshToken(
	// 	@Req() req: FastifyRequest,
	// 	@Res({ passthrough: true }) rep: FastifyReply,
	// 	@Body() dto: RefreshTokenDto,
	// ): Promise<AuthUserSessionAccessTokensSafe> {
	// 	const data = await this.authService.refreshToken(rep, dto);
	// 	return {
	// 		access_token: data.access_token,
	// 		access_token_refresh_time: data.access_token_refresh_time,
	// 		session_token: data.session_token,
	// 	};
	// }

	/**
	 * Deletes the user account.
	 *
	 * @param {UserDtoDelete} dto - Data for deleting the user.
	 * @returns {Promise<void>} Response message.
	 * @throws {UserExceptionNotFound} If user is not found.
	 * @throws {UserExceptionDeleteFail} If credentials are invalid or deletion fails.
	 */
	@ApiBody({
		type: UserDtoDelete,
		description: 'Data for deleting the user',
	})
	@ApiOkResponse({
		type: SuccessResponse,
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		type: BadResponse,
	})
	@ApiNotFoundResponse({
		description: 'User not found',
		type: InternalResponse,
	})
	@ApiInternalServerErrorResponse({
		description: 'Cant delete a user',
		type: InternalResponse,
	})
	@ApiBearerAuth('Bearer')
	@SuccessMessage('success.users.deleted')
	@Delete('delete-account')
	@Roles(Role.ADMIN)
	async deleteUser(@Body() dto: UserDtoDelete): Promise<void> {
		await this.authService.deleteAccount(dto);
	}
}
