import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserDtoDelete {
	@ApiProperty()
	@IsUUID()
	user_id: string;
}
