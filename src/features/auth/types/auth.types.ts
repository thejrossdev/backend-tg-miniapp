import { BaseSuccessResponse } from '@/common/types';
import { UserSafe } from '@/features/users/types';
import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';

/**
 * Initial authentication data structure containing temporary session information.
 */
export class AuthUserInit {
	@ApiProperty({
		description: 'Temporary authentication token',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		type: String,
		required: true,
	})
	sessionId: string;
}
/**
 * Initial authentication response structure combining success response with authentication data.
 */
export class AuthResponseUserInit extends IntersectionType(BaseSuccessResponse, AuthUserInit) {}

/**
 * Basic authentication tokens containing JWT access and refresh tokens.
 */
export class AuthUserTokens {
	/**
	 * JWT access token for API authorization
	 * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
	 */
	@ApiProperty({
		description:
			'JWT access token used for authorizing API requests. Contains user payload and expires after a short period (e.g., 15-60 minutes)',
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
		type: String,
	})
	access_token: string;

	/**
	 * JWT refresh token for obtaining new access tokens
	 * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
	 */
	@ApiProperty({
		description:
			'JWT refresh token used to obtain new access tokens without re-authentication. Has longer expiration time (e.g., 7-30 days) and should be stored securely',
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
		type: String,
	})
	refresh_token: string;
}

/**
 * Basic authentication response tokens combining success response with JWT tokens.
 */
export class AuthResponseUserTokens extends IntersectionType(BaseSuccessResponse, AuthUserTokens) {}

/**
 * Extended authentication tokens with additional session token for enhanced security.
 */
export class AuthUserSessionTokens extends AuthUserTokens {
	/**
	 * Session token for maintaining user session state
	 */
	@ApiProperty()
	session_token: string;
}

/**
 * Session tokens with refresh time information for session management.
 */
export class AuthUserSessionRefreshTokens extends AuthUserSessionTokens {
	/**
	 * Timestamp indicating when the session should be refreshed
	 */
	@ApiProperty()
	session_refresh_time: string;
}

/**
 * Session tokens with access token refresh time for automatic token renewal.
 */
export class AuthUserSessionAccessTokens extends AuthUserSessionTokens {
	/**
	 * Timestamp indicating when the access token should be refreshed
	 */
	@ApiProperty()
	access_token_refresh_time: string;
}

/**
 * Safe version of session access tokens with sensitive refresh token removed.
 */
export class AuthUserSessionAccessTokensSafe extends OmitType(AuthUserSessionAccessTokens, [
	'refresh_token',
] as const) {}

/**
 * Response structure for safe session access tokens.
 */
export class AuthResponseUserSessionAccessTokensSafe extends IntersectionType(BaseSuccessResponse) {
	@ApiProperty({
		type: AuthUserSessionAccessTokensSafe,
	})
	data: AuthUserSessionAccessTokensSafe;
}

/**
 * Complete user authentication response containing full user data and session tokens.
 */
class AuthUserSessionRefreshTokensSafe extends OmitType(AuthUserSessionRefreshTokens, ['refresh_token'] as const) {}

/**
 * Complete user authentication response with safe user data (sensitive fields removed).
 */
export class AuthUserSignedInSafe {
	/**
	 * Safe user object with sensitive information removed
	 */
	@ApiProperty({
		type: UserSafe,
	})
	user: UserSafe;

	/**
	 * Safe session tokens with sensitive refresh token removed
	 */
	@ApiProperty({
		type: AuthUserSessionRefreshTokensSafe,
	})
	tokens: AuthUserSessionRefreshTokensSafe;
}

/**
 * Response structure for safe user authentication data.
 */
export class AuthResponseUserSignedInSafe extends IntersectionType(BaseSuccessResponse, AuthUserSignedInSafe) {}
