import { SuccessResponse } from '@/common/types';
import { User } from '@/features/users/entities';
import { UserSafe } from '@/features/users/types';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

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
export class AuthResponseUserInit extends IntersectionType(SuccessResponse<string>, AuthUserInit) {}

/**
 * Basic authentication tokens (access and refresh).
 */
export type AuthUserTokens = {
	access_token: string;
	refresh_token: string;
};

/**
 * Extended authentication tokens with session token.
 */
export type AuthUserSessionTokens = AuthUserTokens & {
	session_token: string;
};

/**
 * Session tokens with refresh time information.
 */
export type AuthUserSessionRefreshTokens = AuthUserSessionTokens & {
	session_refresh_time: string;
};

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
	@ApiProperty()
	data: User;

	@ApiProperty()
	tokens: AuthUserSessionRefreshTokens;
}

/**
 * Complete user authentication response with safe user data (sensitive fields removed).
 */
export class AuthUserSignedInSafe {
	@ApiProperty()
	data: UserSafe;

	@ApiProperty()
	tokens: AuthUserSessionRefreshTokens;
}
