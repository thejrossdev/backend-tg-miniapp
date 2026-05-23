import { UserDtoInit } from '@/features/users/dto';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UserDtoValidate extends UserDtoInit {
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
	@MinLength(34, { message: '34' })
	@MaxLength(34, { message: '34' })
	@Optional()
	referrerCode?: string;
}
