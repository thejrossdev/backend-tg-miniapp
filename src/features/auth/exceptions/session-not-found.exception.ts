import { DomainException } from '@/common/exceptions';
import { GI18nService } from '@/common/services';
import { SessionErrorCode } from '@/features/auth/enums';

/**
 * Exception thrown when a session is not found in the system.
 */
export class SessionExceptionNotFound extends DomainException {
	/**
	 * Error code for session not found exception.
	 */
	public readonly code = SessionErrorCode.NOT_FOUND;

	/**
	 * HTTP status code for this exception (404 Not Found).
	 */
	public readonly statusCode = 404;

	/**
	 * Creates an instance of SessionExceptionNotFound.
	 *
	 * @param {string} identifier - The identifier used to look up the session
	 * @param {GI18nService} i18n - The i18n service for translation
	 */
	constructor(
		identifier: string,
		private readonly i18n: GI18nService,
	) {
		super(i18n.t('exceptions.sessions.NOT_FOUND', { args: { identifier } }));
	}
}
