import { BaseSuccessResponse } from '@/common/types';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UserSafe } from '@/features/users/types';
import { User } from '@/features/users/entities';

/**
 * Initial authentication data structure.
 */
export class AuthUserInit {
	@ApiProperty({
		description: 'Temporary authentication token',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		type: String,
		required: true,
	})
	data: string;
}

/**
 * Initial authentication response structure.
 */
export class AuthResponseUserInit extends IntersectionType(BaseSuccessResponse, AuthUserInit) {}

/**
 * Basic authentication tokens (access and refresh).
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
 * Basic authentication response tokens (access and refresh).
 */
export class AuthResponseUserTokens extends IntersectionType(BaseSuccessResponse, AuthUserTokens) {}

/**
 * Extended authentication tokens with session token.
 */
export class AuthUserSessionTokens extends AuthUserTokens {
	@ApiProperty()
	session_token: string;
}

/**
 * Session tokens with refresh time information.
 */
export class AuthUserSessionRefreshTokens extends AuthUserSessionTokens {
	@ApiProperty()
	session_refresh_time: string;
}

/**
 * Session tokens with access token refresh time information.
 */
export type AuthUserSessionAccessTokens = AuthUserSessionTokens & {
	access_token_refresh_time: string;
};

/**
 * Complete user authentication response with full user data.
 */
export class AuthUserSignedIn {
	@ApiProperty({
		type: User,
	})
	data: User;

	@ApiProperty({
		type: AuthUserSessionRefreshTokens,
	})
	tokens: AuthUserSessionRefreshTokens;
}

/**
 * Complete user authentication response with safe user data (sensitive fields removed).
 */
export class AuthUserSignedInSafe {
	@ApiProperty({
		type: UserSafe,
	})
	data: UserSafe;

	@ApiProperty({
		type: AuthUserSessionRefreshTokens,
	})
	tokens: AuthUserSessionRefreshTokens;
}
export class AuthResponseUserSignedInSafe extends IntersectionType(BaseSuccessResponse, AuthUserSignedInSafe) {}
