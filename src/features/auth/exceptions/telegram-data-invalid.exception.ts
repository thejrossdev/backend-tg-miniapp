import { DomainException } from '@/common/exceptions';
import { GI18nService } from '@/common/services';
import { TelegramErrorCode } from '@/features/auth/enums';

/**
 * Exception thrown when a telegram data broken/invalid or provided partial data.
 */
export class TelegramExceptionInvalid extends DomainException {
	/**
	 * Error code for exception.
	 */
	public readonly code = TelegramErrorCode.TELEGRAM_UNAUTHORIZED;

	/**
	 * HTTP status code for this exception (401 Unauthorized).
	 */
	public readonly statusCode = 401;

	/**
	 * Creates an instance of TelegramExceptionInvalid.
	 *
	 * @param {string} data - The provided data used
	 * @param {GI18nService} i18n - The i18n service for translation
	 */
	constructor(
		data: string,
		private readonly i18n: GI18nService,
	) {
		super(i18n.t('exceptions.telegram.TELEGRAM_UNAUTHORIZED', { args: { data } }));
	}
}
