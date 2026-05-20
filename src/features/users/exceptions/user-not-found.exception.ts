import { DomainException } from '@/common/exceptions';
import { GI18nService } from '@/common/services';
import { UserErrorCode } from '@/features/users/enums';

/**
 * Exception thrown when a user is not found in the system.
 */
export class UserExceptionNotFound extends DomainException {
	/**
	 * Error code for user not found exception.
	 */
	public readonly code = UserErrorCode.NOT_FOUND;

	/**
	 * HTTP status code for this exception (404 Not Found).
	 */
	public readonly statusCode = 404;

	/**
	 * Creates an instance of UserExceptionNotFound.
	 *
	 * @param {string} identifier - The identifier used to look up the user
	 * @param {GI18nService} i18n - The i18n service for translation
	 */
	constructor(
		identifier: string,
		private readonly i18n: GI18nService,
	) {
		super(i18n.t('exceptions.users.NOT_FOUND', { args: { identifier } }));
	}
}
