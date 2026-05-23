import { DomainException } from '@/common/exceptions';
import { GI18nService } from '@/common/services';
import { AuthErrorCode } from '@/features/auth/enums';

/**
 * Exception thrown when a User was not initialized.
 */
export class AuthExceptionNotInit extends DomainException {
	/**
	 * Error code for exception.
	 */
	public readonly code = AuthErrorCode.INIT_UNAUTHORIZED;

	/**
	 * HTTP status code for this exception (401 Unauthorized).
	 */
	public readonly statusCode = 401;

	/**
	 * Creates an instance of AuthExceptionNotInit.
	 *
	 * @param {string} data - The provided data used
	 * @param {GI18nService} i18n - The i18n service for translation
	 */
	constructor(
		private readonly i18n: GI18nService,
		data?: string,
	) {
		super(i18n.t('exceptions.auth.INIT_UNAUTHORIZED', { args: { data } }));
	}
}
