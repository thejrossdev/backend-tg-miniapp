import { MessageResponse } from '@/common/types';
import { User } from '@/features/users/entities/user.entity';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

/**
 * User find one response containing user data.
 *
 * @property {string} message - Response message.
 * @property {Omit<User, 'password' | 'sessions' | 'generateUserInfo'>} data - User data excluding sensitive fields.
 */

export class UserResponseFindOne extends IntersectionType(MessageResponse) {
	@ApiProperty({
		description: 'User data excluding sensitive fields.',
		required: true,
		type: User,
	})
	data: Omit<User, 'telegramIdEncrypted' | 'telegramIdHash' | 'sessions' | 'generateUserInfo'>;
}

/**
 * Fetched current user response containing user data.
 *
 * @property {string} message - Response message.
 * @property {Omit<User, 'password' | 'sessions' | 'generateUserInfo'>} data - User data excluding sensitive fields.
 */
export class UserResponseMe extends IntersectionType(UserResponseFindOne) {}

/**
 * User find one response containing user data.
 *
 * @property {string} message - Response message.
 * @property {Omit<User, 'password' | 'sessions' | 'generateUserInfo'>} data - User data excluding sensitive fields.
 */
export class UserResponseFindAll extends IntersectionType(MessageResponse) {
	@ApiProperty({
		description: 'Array of Users data excluding sensitive fields.',
		required: true,
		type: [User],
	})
	data: Omit<User, 'telegramIdEncrypted' | 'telegramIdHash' | 'sessions' | 'generateUserInfo'>[];
}
