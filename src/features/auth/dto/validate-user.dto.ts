import { InitUserDto } from '@/features/auth/dto/init-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Optional } from '@nestjs/common';

export class ValidateUserDto extends InitUserDto {
	@ApiProperty({
		description: 'Temporary SessionID',
		example: '550e8400-e29b-41d4-a716-446655440000',
		required: true,
	})
	@IsString()
	@IsNotEmpty({ message: 'sessionId cant be empty' })
	sessionId: string;

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
