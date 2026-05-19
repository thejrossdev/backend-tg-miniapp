import { Env } from '@/common/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import sodium from 'libsodium-wrappers';
import { Logger } from 'nestjs-pino';

/**
 * Service for Telegram UserId crypto logic.
 */
@Injectable()
export class CryptoService {
	static ENC_KEY: Buffer;
	/**
	 * Creates an instance of CryptoService.
	 *
	 * @param {ConfigService<Env>} config - Configuration service for environment variables.
	 * @param {Logger} logger - Logger instance.
	 * @throws {Error} if Sodium is not initialized
	 * @throws {Error} if Failed to decrypt telegramId
	 */
	constructor(
		private readonly config: ConfigService<Env>,
		private readonly logger: Logger,
	) {
		if (this.config.get<string>('TELEGRAM_SECRET')) {
			CryptoService.ENC_KEY = this.getTelegramEncryptionKey();
		}
	}

	async encryptTelegramId(telegramId: number | string, key?: Buffer): Promise<Buffer> {
		await sodium.ready;

		if (!sodium.ready) throw new Error('Sodium is not initialized.');

		const encryptionKey = key || this.getTelegramEncryptionKey();

		const idString = telegramId.toString();
		const message = Buffer.from(idString, 'utf8');
		const nonce = crypto.randomBytes(32);

		const ciphertext = sodium.crypto_aead_aegis256_encrypt(message, null, null, nonce, encryptionKey);

		return Buffer.concat([nonce, Buffer.from(ciphertext)]);
	}

	async decryptTelegramId(encrypted: Buffer, key?: Buffer): Promise<string> {
		await sodium.ready;

		if (!sodium.ready) throw new Error('Sodium is not initialized.');

		const encryptionKey = key || this.getTelegramEncryptionKey();
		const nonce = encrypted.subarray(0, 32);
		const ciphertext = encrypted.subarray(32);

		try {
			const decrypted = sodium.crypto_aead_aegis256_decrypt(null, ciphertext, null, nonce, encryptionKey);

			return Buffer.from(decrypted).toString('utf8');
		} catch (e) {
			throw new Error('Failed to decrypt telegramId');
		}
	}

	getTelegramEncryptionKey(): Buffer {
		let encryptionKey = CryptoService.ENC_KEY;
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

	createTelegramIdHash(telegramId: number | string, secret?: string): string {
		if (!secret) {
			secret = this.config.get<string>('TELEGRAM_SECRET');
		}

		if (!secret) {
			throw new Error('TELEGRAM_SECRET is not configured');
		}

		return crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
	}

	verifyTelegramIdHash(telegramId: number | string, storedHash: string, secret?: string): boolean {
		const computedHash = this.createTelegramIdHash(telegramId, secret);
		return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
	}
}
