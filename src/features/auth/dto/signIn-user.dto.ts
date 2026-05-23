import { UserDtoInit } from '@/features/users/dto/init-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SignInUserDto extends UserDtoInit {
	@ApiProperty()
	@IsOptional()
	@IsString()
	ip?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	location?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	device_name?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	device_os?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	device_type?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	browser?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	userAgent?: string;

	@ApiProperty()
	@IsString()
	sessionId: string;
}
