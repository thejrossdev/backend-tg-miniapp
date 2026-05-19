import { User } from '@/features/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class for login user response.
 *
 * @property {string} data - temporary sessionId.
 */
export class InitUser {
	data: string;
}

/**
 * Interface for refresh token details.
 *
 * @property {string} access_token - Access token.
 * @property {string} refresh_token - Refresh token.
 * @property {string} access_token_refresh_time - Access token refresh time.
 * @property {string} session_token - Session token.
 */
export class RefreshToken {
	@ApiProperty({
		description: 'New User access token',
		required: true,
		type: 'string',
	})
	access_token: string;

	@ApiProperty({
		description: 'New User refresh token',
		required: true,
		type: 'string',
	})
	refresh_token: string;

	@ApiProperty({
		description: 'Refresh token time',
		required: true,
		type: 'string',
	})
	access_token_refresh_time: string;

	@ApiProperty({
		description: 'UUID of session',
		required: true,
		type: 'string',
	})
	session_token: string;
}

/**
 * Authentication tokens.
 *
 * @property {string} access_token - Access token.
 * @property {string} refresh_token - Refresh token.
 */
export class AuthTokens {
	@ApiProperty({
		description: 'User access token',
		required: true,
		type: 'string',
	})
	access_token: string;

	@ApiProperty({
		description: 'User refresh token',
		required: true,
		type: 'string',
	})
	refresh_token: string;
}

/**
 * Login user for response.
 *
 * @property {User} data - User entity.
 * @property {{
 *   session_token: string;
 *   access_token: string;
 *   refresh_token: string;
 *   session_refresh_time: string;
 * }} tokens - Authentication and session tokens.
 */
export class LoginUser {
	@ApiProperty({
		description: 'Authorized User',
		required: true,
		type: User,
	})
	data: User;

	@ApiProperty({
		description: 'Authorized User',
		required: true,
		type: User,
	})
	tokens: {
		session_token: string;
		access_token: string;
		refresh_token: string;
		session_refresh_time: string;
	};
}

/**
 * Register user response.
 *
 * @property {User} data - Registered user entity.
 */
export class RegisterUser {
	@ApiProperty({
		description: 'Registered User',
		required: true,
		type: User,
	})
	data: User;
}
