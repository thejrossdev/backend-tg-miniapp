import { User } from '@/features/users/entities';
import { OmitType } from '@nestjs/swagger';

export class UserSafe extends OmitType(User, [
	'telegramIdEncrypted',
	'telegramIdHash',
	'sessions',
	'setEntityName',
	'__entity',
	'generateOrderNumber',
	'orders',
	'promoCodes',
] as const) {}
