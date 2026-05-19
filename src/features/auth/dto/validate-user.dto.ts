import { InitUserDto } from '@/features/auth/dto/init-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateUserDto extends InitUserDto {
	@ApiProperty({
		description: 'Temporary SessionID',
		example: '550e8400-e29b-41d4-a716-446655440000',
		required: true,
	})
	@IsString()
	@IsNotEmpty({ message: 'sessionId cant be empty' })
	sessionId: string;
}
