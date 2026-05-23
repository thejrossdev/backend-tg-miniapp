import { ErrorCode } from '@/common/enums';
import { SuccessCode } from '@/common/enums/success-code.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type BaseResponse = {
	/**
	 * Indicates whether the operation was successful
	 */
	success: boolean;

	/**
	 * Human-readable success message (translated)
	 */
	message: string;
	/**
	 * Optional custom error code.
	 */
	code: string;

	/**
	 * HTTP status code for the response.
	 */
	statusCode: number;

	/**
	 * Response timestamp
	 */
	timestamp: string;
	/**
	 * Request path that generated this response.
	 */
	path?: string;

	/**
	 * HTTP method used for the request.
	 */
	method?: string;

	/**
	 * Unique trace identifier for the request.
	 */
	traceId?: string;
};

/**
 * Interface defining options for creating a success response.
 */
export interface SuccessResponseOptions {
	/**
	 * Optional custom error code.
	 */
	code?: SuccessCode;

	/**
	 * HTTP status code for the response.
	 */
	statusCode?: number;

	/**
	 * Translation key for the success message.
	 */
	messageKey?: string;

	/**
	 * Arguments to pass to the translation function.
	 */
	messageArgs?: Record<string, any>;

	/**
	 * Request path that generated this response.
	 */
	path?: string;

	/**
	 * HTTP method used for the request.
	 */
	method?: string;

	/**
	 * Unique trace identifier for the request.
	 */
	traceId?: string;
}

/**
 * Standardized success response format with metadata.
 *
 * @template T - Type of data included in the response
 */
export class BaseSuccessResponse implements BaseResponse {
	/**
	 * Indicates whether the operation was successful
	 * @example true
	 */
	@ApiProperty({
		description: 'Operation success flag. true - operation completed successfully, false - an error occurred',
		example: true,
		type: Boolean,
	})
	success: boolean;

	/**
	 * Human-readable success message (translated)
	 * @example 'Operation completed successfully'
	 */
	@ApiProperty({
		description: 'Localized message describing the operation result. Suitable for displaying to users',
		example: 'Operation completed successfully',
		type: String,
	})
	message: string;

	/**
	 * Standardized success code
	 * @example SuccessCode.SUCCESS
	 */
	@ApiProperty({
		description: 'Standardized operation status code. Used for programmatic response handling',
		example: SuccessCode.SUCCESS,
		enum: SuccessCode,
		enumName: 'SuccessCode',
	})
	code: SuccessCode;

	/**
	 * HTTP status code
	 * @example 200
	 */
	@ApiProperty({
		description: 'HTTP status code (200, 201, 400, 401, 403, 404, 500, etc.)',
		example: 200,
		type: Number,
	})
	statusCode: number;

	/**
	 * Response timestamp
	 * @example '2026-05-19T01:32:55.443Z'
	 */
	@ApiProperty({
		description: 'ISO 8601 timestamp indicating when the response was generated',
		example: '2026-05-19T01:32:55.443Z',
		type: String,
		format: 'date-time',
	})
	timestamp: string;
}

/**
 * Standardized success response format with metadata.
 *
 * @template T - Type of data included in the response
 */
export class SuccessResponse<T = any> implements BaseResponse {
	/**
	 * Indicates whether the operation was successful
	 * @example true
	 */
	@ApiProperty({
		description: 'Operation success flag. true - operation completed successfully, false - an error occurred',
		example: true,
		type: Boolean,
	})
	success: boolean;

	/**
	 * Human-readable success message (translated)
	 * @example 'Operation completed successfully'
	 */
	@ApiProperty({
		description: 'Localized message describing the operation result. Suitable for displaying to users',
		example: 'Operation completed successfully',
		type: String,
	})
	message: string;

	/**
	 * Standardized success code
	 * @example SuccessCode.SUCCESS
	 */
	@ApiProperty({
		description: 'Standardized operation status code. Used for programmatic response handling',
		example: SuccessCode.SUCCESS,
		enum: SuccessCode,
		enumName: 'SuccessCode',
	})
	code: SuccessCode;

	/**
	 * HTTP status code
	 * @example 200
	 */
	@ApiProperty({
		description: 'HTTP status code (200, 201, 400, 401, 403, 404, 500, etc.)',
		example: 200,
		type: Number,
	})
	statusCode: number;

	/**
	 * Response timestamp
	 * @example '2026-05-19T01:32:55.443Z'
	 */
	@ApiProperty({
		description: 'ISO 8601 timestamp indicating when the response was generated',
		example: '2026-05-19T01:32:55.443Z',
		type: String,
		format: 'date-time',
	})
	timestamp: string;

	/**
	 * Response payload data (optional)
	 * Present only in successful responses with data
	 */
	@ApiProperty({
		description: 'Optional data payload for successful responses',
		example: null,
		type: Object,
		required: false,
	})
	data?: T;
	/**
	 * Creates an instance of SuccessResponse.
	 *
	 * @param {boolean} b - Must be true to indicate success
	 * @param {number} statusCode - HTTP status code
	 * @param {string} message - Translated success message
	 * @param {Partial<SuccessResponse<T>>} partial - Partial success response object
	 * @param {Record<string, any>} meta - Additional metadata
	 */
	constructor(
		b: boolean,
		statusCode: number,
		message: string,
		partial: Partial<SuccessResponse<T>>,
		meta: Record<string, any> | undefined,
	) {
		this.success = true;
		this.code = SuccessCode.SUCCESS;
		this.statusCode = 200;
		this.message = partial.message || 'Success';
		this.data = partial.data;
	}
}

/**
 * Standardized error response format with metadata.
 * Used for all unsuccessful API responses.
 */
export class InternalResponse implements BaseResponse {
	/**
	 * Indicates whether the operation was successful
	 * @example false
	 */
	@ApiProperty({
		description: 'Operation success flag. Always false for error responses',
		example: false,
		type: Boolean,
		readOnly: true,
	})
	success: boolean;

	/**
	 * Human-readable error message (translated)
	 * @example 'Operation was not completed successfully'
	 */
	@ApiProperty({
		description: 'Localized error message describing what went wrong. Suitable for displaying to users',
		example: 'Unable to process your request. Please try again later.',
		type: String,
	})
	message: string;

	/**
	 * Standardized error code for programmatic handling
	 */
	@ApiProperty({
		description: 'Standardized error code for programmatic response handling and client-side error categorization',
		example: ErrorCode.INTERNAL_ERROR,
		enum: ErrorCode,
		enumName: 'ErrorCode',
	})
	code: string;

	/**
	 * HTTP status code
	 * @example 500
	 */
	@ApiProperty({
		description: 'HTTP status code indicating the type of error (400, 401, 403, 404, 409, 422, 500, etc.)',
		example: 500,
		type: Number,
		minimum: 400,
		maximum: 599,
	})
	statusCode: number;

	/**
	 * Response timestamp
	 * @example '2026-05-19T01:32:55.443Z'
	 */
	@ApiProperty({
		description: 'ISO 8601 timestamp indicating when the error response was generated',
		example: '2026-05-19T01:32:55.443Z',
		type: String,
		format: 'date-time',
	})
	timestamp: string;

	/**
	 * Unique request identifier for tracing and debugging
	 */
	@ApiProperty({
		description: 'Unique trace ID for request tracking and debugging purposes. Can be used to correlate logs',
		example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
		type: String,
		readOnly: true,
	})
	traceId: string;

	/**
	 * Request path that caused the error
	 */
	@ApiProperty({
		description: 'API endpoint path that was called when the error occurred',
		example: '/api/v1/users/123',
		type: String,
		readOnly: true,
	})
	path: string;

	/**
	 * HTTP method used for the request
	 */
	@ApiProperty({
		description: 'HTTP method of the request that caused the error',
		example: 'POST',
		enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
		readOnly: true,
	})
	method: string;

	/**
	 * Creates an instance of InternalResponse.
	 *
	 * @param {boolean} b - Must be false to indicate unsuccessful operation
	 * @param {number} statusCode - HTTP status code
	 * @param {string} message - Translated error message
	 * @param {Partial<BadResponse>} partial - Partial error response object
	 * @param {Record<string, any>} meta - Additional metadata
	 */
	protected constructor(
		b: boolean,
		statusCode: number,
		message: string,
		partial: Partial<BadResponse>,
		meta: Record<string, any> | undefined,
	) {
		this.success = false;
		this.code = ErrorCode.INTERNAL_ERROR;
		this.statusCode = statusCode || 500;
		this.message = partial.message || message || 'An error occurred';
		this.timestamp = new Date().toISOString();
		this.traceId = partial.traceId || '';
		this.path = partial.path || '';
		this.method = partial.method || '';
	}
}

/**
 * Standardized error response format with metadata.
 * Used for all unsuccessful API responses.
 */
export class BadResponse implements BaseResponse {
	/**
	 * Indicates whether the operation was successful
	 * @example false
	 */
	@ApiProperty({
		description: 'Operation success flag. Always false for error responses',
		example: false,
		type: Boolean,
		readOnly: true,
	})
	success: boolean;

	/**
	 * Human-readable error message (translated)
	 * @example 'Operation was not completed successfully'
	 */
	@ApiProperty({
		description: 'Localized error message describing what went wrong. Suitable for displaying to users',
		example: 'Unable to process your request. Please try again later.',
		type: String,
	})
	message: string;

	/**
	 * Standardized error code for programmatic handling
	 */
	@ApiProperty({
		description: 'Standardized error code for programmatic response handling and client-side error categorization',
		example: ErrorCode.INTERNAL_ERROR,
		enum: ErrorCode,
		enumName: 'ErrorCode',
	})
	code: string;

	/**
	 * HTTP status code
	 * @example 500
	 */
	@ApiProperty({
		description: 'HTTP status code indicating the type of error (400, 401, 403, 404, 409, 422, 500, etc.)',
		example: 500,
		type: Number,
		minimum: 400,
		maximum: 599,
	})
	statusCode: number;

	/**
	 * Response timestamp
	 * @example '2026-05-19T01:32:55.443Z'
	 */
	@ApiProperty({
		description: 'ISO 8601 timestamp indicating when the error response was generated',
		example: '2026-05-19T01:32:55.443Z',
		type: String,
		format: 'date-time',
	})
	timestamp: string;

	/**
	 * Unique request identifier for tracing and debugging
	 */
	@ApiProperty({
		description: 'Unique trace ID for request tracking and debugging purposes. Can be used to correlate logs',
		example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
		type: String,
		readOnly: true,
	})
	traceId: string;

	/**
	 * Request path that caused the error
	 */
	@ApiProperty({
		description: 'API endpoint path that was called when the error occurred',
		example: '/api/v1/users/123',
		type: String,
		readOnly: true,
	})
	path: string;

	/**
	 * HTTP method used for the request
	 */
	@ApiProperty({
		description: 'HTTP method of the request that caused the error',
		example: 'POST',
		enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
		readOnly: true,
	})
	method: string;

	/**
	 * Additional error details (optional)
	 * Can contain validation errors, stack traces in development, etc.
	 */
	@ApiPropertyOptional({
		description:
			'Additional error details. May include validation errors, field-specific messages, or debugging information',
		example: {
			fields: [
				{
					path: 'initData',
					issue: 'Must be longer than 32 or equal to  characters',
				},
			],
		},
		type: 'object',
		additionalProperties: true,
	})
	details?: unknown = undefined;

	/**
	 * Creates an instance of BadResponse.
	 *
	 * @param {boolean} b - Must be false to indicate unsuccessful operation
	 * @param {number} statusCode - HTTP status code
	 * @param {string} message - Translated error message
	 * @param {Partial<BadResponse>} partial - Partial error response object
	 * @param {Record<string, any>} meta - Additional metadata
	 */
	protected constructor(
		b: boolean,
		statusCode: number,
		message: string,
		partial: Partial<BadResponse>,
		meta: Record<string, any> | undefined,
	) {
		this.success = false;
		this.code = ErrorCode.VALIDATION_FAILED;
		this.statusCode = statusCode || 400;
		this.message = partial.message || message || 'Some fields are invalid.';
		this.timestamp = new Date().toISOString();
		this.traceId = partial.traceId || '';
		this.path = partial.path || '';
		this.method = partial.method || '';
		this.details = partial.details || meta?.details || undefined;
	}
}
