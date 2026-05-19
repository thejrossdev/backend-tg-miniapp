import { ApiProperty, PartialType } from '@nestjs/swagger';

/**
 * Sign in or generic message response.
 *
 * @property {string} message - Response message.
 */
export class MessageResponse {
	@ApiProperty({
		description: 'Response message.',
		examples: ['Success sing in!', 'User are invalid!'],
		type: 'string',
		required: true,
	})
	message: string;
}

export class StatusCodeResponse extends PartialType(MessageResponse) {
	@ApiProperty({
		description: 'Response status code.',
		examples: [200, 401, 403, 500],
		type: 'number',
		required: true,
	})
	statusCode: number;
}

export class ErrorResponse extends PartialType(StatusCodeResponse) {
	@ApiProperty({
		description: 'Simple Error message.',
		examples: ['Unauthorized'],
		type: 'string',
		required: true,
	})
	error: string;
}

export class UnauthorizedResponse extends PartialType(StatusCodeResponse) {}
export class NotFoundResponse extends PartialType(StatusCodeResponse) {}

export class UnauthorizedResponseWithError extends PartialType(StatusCodeResponse) {}
export class BadRequestResponseWithError extends PartialType(ErrorResponse) {}
export class NotFoundResponseWithError extends PartialType(StatusCodeResponse) {}
