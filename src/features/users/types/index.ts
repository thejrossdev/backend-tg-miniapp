import { User } from '@/features/users/entities';

export type UserSafe = Omit<
	User,
	'telegramIdEncrypted' | 'telegramIdHash' | 'sessions' | 'generateUserInfo' | 'setEntityName'
>;
