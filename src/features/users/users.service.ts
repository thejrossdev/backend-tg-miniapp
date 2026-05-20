import { GI18nService } from '@/common/services';
import { User } from '@/features/users/entities';
import { UserExceptionNotFound } from '@/features/users/exceptions';
import { UserSafe } from '@/features/users/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Service for managing user data.
 */
@Injectable()
export class UsersService {
	/**
	 * Creates an instance of UsersService.
	 *
	 * @param {GI18nService} i18n - Service for translating.
	 * @param {Repository<User>} UserRepository - Repository for user entities.
	 */
	constructor(
		private readonly i18n: GI18nService,
		@InjectRepository(User) private readonly UserRepository: Repository<User>,
	) {}

	/**
	 * Retrieves all users with their profiles.
	 *
	 * @returns {Promise<User[]>} A promise that resolves to an array of users with profiles.
	 */
	async findAll(): Promise<User[]> {
		return await this.UserRepository.find({});
	}

	/**
	 * Gets a user by id.
	 *
	 * @param {string} identifier - The UUID of the user to find.
	 * @returns {Promise<User>} A promise that resolves to the user entity.
	 * @throws {UserExceptionNotFound} If the user is not found.
	 */
	async findOne(identifier: string): Promise<User> {
		const user = await this.UserRepository.findOne({
			where: { id: identifier },
		});
		if (!user) {
			throw new UserExceptionNotFound(identifier, this.i18n);
		}
		return user;
	}

	/**
	 * Removes sensitive fields from a user entity to create a safe version.
	 *
	 * @param {User} user - The user entity to make safe
	 * @returns {UserSafe} A user object without sensitive encryption fields
	 */
	getSafeUser(user: User): UserSafe {
		const { telegramIdEncrypted, telegramIdHash, ...data } = user;
		return data;
	}
}
