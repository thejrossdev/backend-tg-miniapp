import { ErrorCode } from '@/common/enums';
import { GI18nService } from '@/common/services';
import { ValidationDetailField } from '@/common/types';
import { I18nPath } from '@/generated/i18n.generated';
import { BadRequestException, Injectable, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

/**
 * Custom validation pipe that extends NestJS's default ValidationPipe.
 * Provides internationalized error messages and detailed field-specific validation issues.
 */
@Injectable()
export class ValidatorPipe extends ValidationPipe {
	/**
	 * Creates an instance of ValidatorPipe.
	 *
	 * @param {GI18nService<I18nTranslations>} i18n - The i18n service instance to use for translations.
	 */
	constructor(private readonly i18n: GI18nService) {
		super({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			exceptionFactory: (errors: ValidationError[]) => {
				const flattened = this.flattenErrors(errors);

				return new BadRequestException({
					code: ErrorCode.VALIDATION_FAILED,
					message: this.i18n.t('exceptions.VALIDATION_FAILED'),
					details: { fields: flattened },
				});
			},
		});
	}

	/**
	 * Recursively flattens nested validation errors into a flat array of field-specific issues.
	 *
	 * @param {ValidationError[]} errors - Array of validation errors to flatten
	 * @param {string} parentPath - The dot-notation path to the parent property (used for nesting)
	 * @returns {Array<ValidationDetailField>} Flattened array with path and translated issue message
	 */
	private flattenErrors(errors: ValidationError[], parentPath: string = ''): ValidationDetailField[] {
		const out: ValidationDetailField[] = [];

		for (const err of errors) {
			const path = parentPath ? `${parentPath}.${err.property}` : err.property;
			if (err.constraints) {
				for (const [key, value] of Object.entries(err.constraints)) {
					const translationKey = `validation.${key}` as I18nPath;
					const args = this.transformValueToArgs(value);
					const issue = this.i18n.t(translationKey, {
						args,
					});

					out.push({ path, issue });
				}
			}

			if (err.children?.length) {
				out.push(...this.flattenErrors(err.children, path));
			}
		}

		return out;
	}

	/**
	 * Transforms various value types into the required argument format for i18n translations.
	 * Ensures numeric indices are prefixed with "value" (e.g., value0, value1) while preserving
	 * non-numeric keys as-is.
	 *
	 * @param {any} value - The value to transform
	 * @returns {Object} An object with transformed keys starting with "value" for numeric indices
	 */
	private transformValueToArgs(value: any): Object {
		if (value === undefined || value === null) {
			return {};
		}

		// Handle arrays
		if (Array.isArray(value)) {
			const result: { [p: string]: any } = {};
			value.forEach((item, index) => {
				result[`value${index}`] = item;
			});
			return result;
		}

		// Handle objects (but not arrays, we already handled those)
		if (typeof value === 'object') {
			// If it's already an object with numeric keys, transform it
			const result: { [p: string]: any } = {};
			const entries = Object.entries(value);

			if (entries.length > 0) {
				entries.forEach(([k, v], index) => {
					// If key is numeric, use value0, value1 format
					if (/^\d+$/.test(k)) {
						result[`value${index}`] = v;
					} else {
						// For non-numeric keys, preserve original key name
						result[k] = v;
					}
				});
			} else {
				return value;
			}
			return result;
		}

		// Handle primitive values (string, number, boolean)
		return { value0: value };
	}
}
