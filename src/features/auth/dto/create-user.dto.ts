import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		description: 'Telegram ID encrypted using AEGIS-256',
		required: true,
	})
	telegramIdEncrypted: Buffer;

	@ApiProperty({
		description: 'HMAC-SHA256 hash of the Telegram ID',
		example: '9216d54301b3afa22bcc9097b4f7433697dba3b99605d2729d9e8ca146476966',
		required: true,
		minLength: 64,
	})
	@IsString()
	telegramIdHash: string;

	@ApiProperty({
		description: 'Referral code who invite',
		example: 'rejolwprxhie3uldz6qrlffb8xlsiaa7je',
		required: false,
		minLength: 34,
	})
	@IsString()
	@MinLength(34)
	@MaxLength(34)
	@Optional()
	referrerCode?: string;
}
