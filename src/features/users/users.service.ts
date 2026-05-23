import { GI18nService } from '@/common/services';
import { TransactionService } from '@/database';
import { UserDtoCreate, UserDtoDelete } from '@/features/users/dto';
import { User } from '@/features/users/entities';
import { UserExceptionCreateFail, UserExceptionNotFound } from '@/features/users/exceptions';
import { UserExceptionDeleteFail } from '@/features/users/exceptions/user-delete.exception';
import { UserSafe } from '@/features/users/types';
import { BadRequestException, Injectable } from '@nestjs/common';
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
	 * @param {TransactionService} transactionService - TransactionService to run typeorm query.
	 */
	constructor(
		private readonly i18n: GI18nService,
		@InjectRepository(User) private readonly UserRepository: Repository<User>,
		private readonly transactionService: TransactionService,
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
	 * Registers a new user account with email and password.
	 *
	 * @param {UserDtoCreate} dto - Data for creating a new user.
	 * @returns {Promise<User>} Registered user data.
	 * @throws {BadRequestException} If create user fails.
	 */
	async create(dto: UserDtoCreate): Promise<User> {
		try {
			const result = await this.transactionService.runInTransaction(async (manager) => {
				const user = manager.create(User, dto);
				await manager.insert(User, user);

				if (dto.referrerCode) {
					// TODO call create referral in service
				}

				return { user };
			});

			return result.user;
		} catch (e) {
			throw new UserExceptionCreateFail(this.i18n);
		}
	}

	/**
	 * Deletes a user account.
	 *
	 * @param {UserDtoDelete} dto - Delete user DTO.
	 * @returns {Promise<void>}
	 * @throws {UserExceptionNotFound} If user is not found.
	 * @throws {UserExceptionDeleteFail} If credentials are invalid or deletion fails.
	 */
	async delete(dto: UserDtoDelete): Promise<void> {
		const user = await this.UserRepository.findOne({
			where: { id: dto.user_id },
		});
		if (!user) throw new UserExceptionNotFound(dto.user_id, this.i18n);
		try {
			await this.UserRepository.remove(user);
		} catch (e) {
			throw new UserExceptionDeleteFail(this.i18n);
		}
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
