import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InitUserDto {
	@ApiProperty({
		description:
			'A string with raw data transferred to the Mini App, convenient for validating data.\n' +
			"WARNING: Validate data from this field before using it on the bot's server.",
		example:
			'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
		required: true,
		minLength: 32,
	})
	@IsString()
	initData: string;
}
