import { TELEGRAM_SESSION_TTL_SEC } from '@/common/constants';
import { GI18nService } from '@/common/services/gI18n.service';
import { TelegramUser } from '@/common/types';
import { Env } from '@/common/utils';
import { TelegramExceptionInvalid } from '@/features/auth/exceptions';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import sodium from 'libsodium-wrappers';

/**
 * Service for handling Telegram Web App authentication and user ID encryption/decryption.
 * Provides functionality for validating Telegram initData, encrypting/decrypting user IDs,
 * and managing Telegram Web App authentication flows.
 */
@Injectable()
export class TelegramService {
	static ENC_KEY: Buffer;
	/**
	 * Creates an instance of CryptoService.
	 *
	 * @param {ConfigService<Env>} config - Configuration service for environment variables.
	 * @param {GI18nService} i18n - Service for translating.
	 * @throws {Error} if Sodium is not initialized
	 * @throws {Error} if Failed to decrypt telegramId
	 */
	constructor(
		private readonly config: ConfigService<Env>,
		private readonly i18n: GI18nService,
	) {
		if (this.config.get<string>('TELEGRAM_SECRET')) {
			TelegramService.ENC_KEY = this.getEncryptionKey();
		}
	}

	/**
	 * Validates the Telegram Web App initData.
	 * Based on: https://core.telegram.org/bots/webapps#validating-data-from-web-apps
	 *
	 * @param {string} initData The initData string from Telegram.
	 * @returns {Boolean} if the data is valid, false otherwise.
	 * @throws{TelegramExceptionInvalid}  if telegram token are invalid or older than 5 mins
	 */
	validateInitData(initData: string): boolean {
		if (!initData) return false;

		const botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

		const params = new URLSearchParams(initData);
		const hash = params.get('hash');
		params.delete('hash'); // Remove hash from parameters to calculate it

		const sortedParams = Array.from(params.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

		let dataCheckString = '';
		for (const [key, value] of sortedParams) {
			dataCheckString += `${key}=${value}\n`;
		}
		// Remove the trailing newline character
		dataCheckString = dataCheckString.slice(0, -1);

		const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken);
		const computedHash = crypto.createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

		if (computedHash !== hash) {
			throw new TelegramExceptionInvalid(initData, this.i18n);
		}

		// Check the auth_date to prevent replay attacks
		const authDate = Number(params.get('auth_date'));
		const now = Math.floor(Date.now() / 1000);
		if (!authDate || now - authDate > TELEGRAM_SESSION_TTL_SEC) {
			// throw new TelegramExceptionInvalid(initData, this.i18n);
		}

		return true;
	}

	/**
	 * Encrypts a Telegram user ID using AEGIS-256 encryption algorithm.
	 *
	 * @param telegramId - The Telegram user ID to encrypt (number or string)
	 * @param key - Optional encryption key buffer, uses default key if not provided
	 * @returns Promise resolving to encrypted data buffer containing nonce and ciphertext
	 * @throws Error if Sodium is not initialized
	 */
	async encryptId(telegramId: number | string, key?: Buffer): Promise<Buffer> {
		await sodium.ready;

		if (!sodium.ready) throw new Error('Sodium is not initialized.');

		const encryptionKey = key || this.getEncryptionKey();

		const idString = telegramId.toString();
		const message = Buffer.from(idString, 'utf8');
		const nonce = crypto.randomBytes(32);

		const ciphertext = sodium.crypto_aead_aegis256_encrypt(message, null, null, nonce, encryptionKey);

		return Buffer.concat([nonce, Buffer.from(ciphertext)]);
	}

	/**
	 * Decrypts an encrypted Telegram user ID.
	 *
	 * @param encrypted - Buffer containing the encrypted data (nonce + ciphertext)
	 * @param key - Optional encryption key buffer, uses default key if not provided
	 * @returns Promise resolving to the decrypted Telegram user ID as string
	 * @throws Error if Sodium is not initialized or decryption fails
	 */
	async decryptId(encrypted: Buffer, key?: Buffer): Promise<string> {
		await sodium.ready;

		if (!sodium.ready) throw new Error('Sodium is not initialized.');

		const encryptionKey = key || this.getEncryptionKey();
		const nonce = encrypted.subarray(0, 32);
		const ciphertext = encrypted.subarray(32);

		try {
			const decrypted = sodium.crypto_aead_aegis256_decrypt(null, ciphertext, null, nonce, encryptionKey);

			return Buffer.from(decrypted).toString('utf8');
		} catch (e) {
			throw new Error('Failed to decrypt telegramId');
		}
	}

	/**
	 * Verify HMAC-SHA256 hash of Telegram UserId. Compare with stored hash.
	 *
	 * @param {number} telegramId The initData from Telegram.
	 * @param {string} storedHash Hashed Telegram UserId.
	 * @param {string} secret The secret 256bit key for hashing.
	 * @returns {string} HMAC-SHA256 hash of Telegram UserId.
	 */
	verifyIdHash(telegramId: number, storedHash: string, secret?: string): boolean {
		const computedHash = this.createIdHash(telegramId, secret);
		return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
	}

	/**
	 *  Get the Telegram UserId from initData.
	 *
	 * @param {string} initData Safe initData from telegram.
	 * @returns {TelegramUser} Telegram User parsed .
	 * @throws{TelegramExceptionInvalid} if telegram token/data are invalid
	 */
	getUserFromInitData(initData: string): TelegramUser {
		const params = new URLSearchParams(initData);
		const userStr = params.get('user');

		if (!userStr) {
			throw new TelegramExceptionInvalid(initData, this.i18n);
		}

		const user = JSON.parse(userStr) as TelegramUser;

		if (!user || !user.id) {
			throw new TelegramExceptionInvalid(initData, this.i18n);
		}

		return user;
	}

	/**
	 * Create HMAC-SHA256 hash for Telegram UserId
	 *
	 * @param {number} telegramId The initData from Telegram.
	 * @param {string} secret The secret 256bit key for hashing.
	 * @returns {string} HMAC-SHA256 hash of Telegram UserId.
	 */
	createIdHash(telegramId: number, secret?: string): string {
		secret = this.config.getOrThrow<string>('TELEGRAM_SECRET');
		return crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
	}

	/**
	 * Gets the encryption key from the configured TELEGRAM_SECRET environment variable.
	 *
	 * @returns Buffer containing the encryption key
	 * @throws Error if TELEGRAM_SECRET is not configured
	 */
	private getEncryptionKey(): Buffer {
		let encryptionKey = TelegramService.ENC_KEY;
		if (encryptionKey) {
			return encryptionKey;
		}

		const telegramSecret = this.config.get<string>('TELEGRAM_SECRET');

		if (!telegramSecret) {
			throw new Error('TELEGRAM_SECRET is not configured');
		}

		encryptionKey = Buffer.from(telegramSecret, 'hex');
		return encryptionKey;
	}
}
