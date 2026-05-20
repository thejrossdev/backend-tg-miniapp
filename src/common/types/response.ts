import { ApiProperty } from '@nestjs/swagger';
import { SuccessCode } from '@/common/enums/success-code.enum';

/**
 * Interface defining options for creating a success response.
 */
export interface SuccessResponseOptions {
	/**
	 * Optional custom error code.
	 */
	code?: string;

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
export class SuccessResponse<T = any> {
	/**
	 * Indicates whether the operation was successful.
	 */
	@ApiProperty({ example: true })
	success: boolean;

	/**
	 * Human-readable success message (translated).
	 */
	@ApiProperty({ example: 'Operation completed successfully' })
	message: string;

	/**
	 * Standardized success code.
	 */
	@ApiProperty({ example: SuccessCode.SUCCESS, enum: SuccessCode })
	code: string;

	/**
	 * HTTP status code of the response.
	 */
	@ApiProperty({ example: 200 })
	statusCode: number;

	/**
	 * Timestamp when the response was created.
	 */
	@ApiProperty({ example: '2026-05-19T01:32:55.443Z' })
	timestamp: string;

	/**
	 * Optional data payload of the response.
	 */
	@ApiProperty({ nullable: true })
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
