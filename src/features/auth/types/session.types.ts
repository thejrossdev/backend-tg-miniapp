import { BaseSuccessResponse } from '@/common/types';
import { Session } from '@/features/auth/entities';
import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';

export class SessionSafe extends OmitType(Session, ['setEntityName', '__entity', 'user', 'refresh_token'] as const) {}

export class AuthUserSession {
	@ApiProperty({
		description: 'User session',
		type: SessionSafe,
	})
	data: SessionSafe;
}
export class AuthResponseUserSession extends IntersectionType(BaseSuccessResponse, AuthUserSession) {}

export class AuthUserSessions {
	@ApiProperty({
		description: 'User sessions',
		type: [SessionSafe],
	})
	data: SessionSafe[];
}
export class AuthResponseUserSessions extends IntersectionType(BaseSuccessResponse, AuthUserSession) {}
