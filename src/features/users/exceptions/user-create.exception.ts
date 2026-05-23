import { DomainException } from '@/common/exceptions';
import { GI18nService } from '@/common/services';
import { UserErrorCode } from '@/features/users/enums';

/**
 * Exception thrown when a user can't create.
 */
export class UserExceptionCreateFail extends DomainException {
	/**
	 * Error code for  exception.
	 */
	public readonly code = UserErrorCode.USER_CREATE_INTERNAL;

	/**
	 * HTTP status code for this exception (500 Internal Server Error).
	 */
	public readonly statusCode = 500;

	/**
	 * Creates an instance of UserExceptionCreateFail.
	 *
	 * @param {string} data - The data used to look up
	 * @param {GI18nService} i18n - The i18n service for translation
	 */
	constructor(
		private readonly i18n: GI18nService,
		data?: string,
	) {
		super(i18n.t('exceptions.users.USER_CREATE_INTERNAL', { args: { data } }));
	}
}
