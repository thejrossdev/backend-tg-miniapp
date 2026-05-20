import { MessageResponse } from '@/common/types';
import { Session } from '@/features/auth/entities/session.entity';
import { RefreshToken } from '@/features/auth/types/types';
import { User } from '@/features/users/entities/user.entity';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

/**
 * User init response containing temporary SessionId.
 *
 * @property {string} message - Response message.
 * @property {string} data - Temp sessionId for user.
 */
export class AuthResponseUserInit {
	@ApiProperty({
		description: 'Temporary SessionId with UUID format',
		example: '5c7ffbef-eceb-40e1-a679-89a524117edc',
		type: 'string',
		required: true,
	})
	data: string;
}

/**
 * Sign in response containing user data and authentication tokens.
 *
 * @property {string} message - Response message.
 * @property {Omit<User, 'password' | 'sessions' | 'generateUserInfo'>} data - User data excluding sensitive fields.
 * @property {{ access_token: string; refresh_token: string }} tokens - Authentication tokens.
 */
export class AuthResponseSignIn {
	@ApiProperty({
		description: 'Response message.',
		example: 'Success sing in!',
		type: 'string',
		required: true,
	})
	message: string;

	@ApiProperty({
		description: 'User data excluding sensitive fields.',
		required: true,
		type: User,
	})
	data: Omit<User, 'telegramIdEncrypted' | 'telegramIdHash' | 'sessions' | 'generateUserInfo'>;

	@ApiProperty({
		description: 'Authentication tokens.',
		example: {
			access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
			refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		},
	})
	tokens: {
		access_token: string;
		refresh_token: string;
	};
}

/**
 * Response containing an array of session entities.
 *
 * @property {Session[]} data - List of session entities.
 */
export class AuthResponseSessions {
	@ApiProperty({
		description: 'Array of User session data',
		required: true,
		type: [Session],
	})
	data: Session[];
}

/**
 * Response containing a single session entity.
 *
 * @property {Session} data - Session entity.
 */
export class AuthResponseSession {
	@ApiProperty({
		description: 'User session data',
		required: true,
		type: Session,
	})
	data: Session;
}

/**
 * Response for refresh token operation.
 *
 * @property {string} message - Response message.
 * @property {string} access_token - New access token.
 * @property {string} refresh_token - New refresh token.
 * @property {string} access_token_refresh_time - Access token expiration or refresh time.
 * @property {string} session_token - Session token.
 */
export class AuthResponseRefreshToken extends IntersectionType(MessageResponse, RefreshToken) {}
