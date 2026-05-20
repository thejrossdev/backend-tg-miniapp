import { SuccessCode } from '@/common/enums';
import { GI18nService } from '@/common/services';
import { SuccessResponse, SuccessResponseOptions } from '@/common/types';
import { I18nPath } from '@/generated/i18n.generated';
import { Injectable } from '@nestjs/common';

/**
 * Factory for creating standardized success response objects with internationalized messages.
 */
@Injectable()
export class SuccessResponseFactory {
	constructor(private readonly i18n: GI18nService) {}

	/**
	 * Creates a standardized success response object.
	 *
	 * @param {T} data - The response data to include
	 * @param {SuccessResponseOptions} options - Configuration options for the response
	 * @returns {SuccessResponse<T>} Formatted success response object
	 */
	create<T = any>(data: T, options?: SuccessResponseOptions): SuccessResponse<T> {
		const {
			code = SuccessCode.SUCCESS,
			statusCode = 200,
			messageKey = 'success.default',
			messageArgs = {},
			path,
			method,
			traceId,
		} = options || {};

		let message = this.i18n.t(messageKey as I18nPath, { args: messageArgs });

		if (message === messageKey) {
			message = this.getDefaultMessage(statusCode);
		}

		return {
			success: true,
			code,
			statusCode,
			message,
			data,
			timestamp: new Date().toISOString(),
			...(path && { path }),
			...(method && { method }),
			...(traceId && { traceId }),
		};
	}

	/**
	 * Creates a success response for GET operations.
	 *
	 * @param {T} data - The resource data retrieved
	 * @param {Omit<SuccessResponseOptions, 'messageKey'>} options - Response options excluding messageKey (will be set automatically)
	 * @returns {SuccessResponse<T>} Formatted success response object
	 */
	found<T = any>(data: T, options?: Omit<SuccessResponseOptions, 'messageKey'>): SuccessResponse<T> {
		return this.create(data, {
			...options,
			messageKey: 'success.resource-found',
			statusCode: 200,
		});
	}

	/**
	 * Creates a success response for POST (create) operations.
	 *
	 * @param {T} data - The created resource data
	 * @param {Omit<SuccessResponseOptions, 'messageKey'>} options - Response options excluding messageKey (will be set automatically)
	 * @returns {SuccessResponse<T>} Formatted success response object
	 */
	created<T = any>(data: T, options?: Omit<SuccessResponseOptions, 'messageKey'>): SuccessResponse<T> {
		return this.create(data, {
			...options,
			messageKey: 'success.resource-created',
			statusCode: 201,
		});
	}

	/**
	 * Creates a success response for PUT/PATCH (update) operations.
	 *
	 * @param {T} data - The updated resource data
	 * @param {Omit<SuccessResponseOptions, 'messageKey'>} options - Response options excluding messageKey (will be set automatically)
	 * @returns {SuccessResponse<T>} Formatted success response object
	 */
	updated<T = any>(data: T, options?: Omit<SuccessResponseOptions, 'messageKey'>): SuccessResponse<T> {
		return this.create(data, {
			...options,
			messageKey: 'success.resource-updated',
			statusCode: 200,
		});
	}

	/**
	 * Creates a success response for DELETE operations.
	 *
	 * @param {Omit<SuccessResponseOptions, 'messageKey'>} options - Response options excluding messageKey (will be set automatically)
	 * @returns {SuccessResponse<null>} Formatted success response object
	 */
	deleted(options?: Omit<SuccessResponseOptions, 'messageKey'>): SuccessResponse<null> {
		return this.create(null, {
			...options,
			messageKey: 'success.resource-deleted',
			statusCode: 204,
		});
	}

	/**
	 * Gets default English message based on status code when translation is not available.
	 *
	 * @param {number} statusCode - The HTTP status code
	 * @returns {string} Default message for the given status code
	 */
	private getDefaultMessage(statusCode: number): string {
		switch (statusCode) {
			case 201:
				return 'Resource created successfully';
			case 204:
				return 'Resource deleted successfully';
			default:
				return 'Operation completed successfully';
		}
	}
}
