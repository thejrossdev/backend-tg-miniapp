import { I18nPath, I18nTranslations } from '@/generated/i18n.generated';
import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TranslateOptions } from 'nestjs-i18n/dist/interfaces';

/**
 * Service for handling internationalization (i18n) translations.
 */
@Injectable()
export class GI18nService {
	/**
	 * Creates an instance of GI18nService .
	 *
	 * @param {I18nService<I18nTranslations>} i18n - The NestJS i18n service instance to use for translations.
	 */
	constructor(private readonly i18n: I18nService<I18nTranslations>) {}

	/**
	 * Translates a given key into the current locale's text.
	 *
	 * @param {I18nPath} key - The translation key to look up.
	 * @param {Record<string, any>} options - Optional parameters to interpolate into the translation string.
	 * @returns {string} The translated message.
	 */
	t(key: I18nPath, options?: TranslateOptions): string {
		const lang = I18nContext.current()?.lang;
		return this.i18n.translate(key, { lang, ...options });
	}
}
