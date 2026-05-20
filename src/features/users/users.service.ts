import { User } from '@/features/users/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

/**
 * Service for managing user data.
 */
@Injectable()
export class UsersService {
	/**
	 * Creates an instance of UsersService.
	 *
	 * @param {I18nService} i18n - Service for translating.
	 * @param {Repository<User>} UserRepository - Repository for user entities.
	 */
	constructor(
		private readonly i18n: I18nService,
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
	 * @throws {NotFoundException} If the user is not found.
	 */
	async findOne(identifier: string): Promise<User> {
		const user = await this.UserRepository.findOne({
			where: { id: identifier },
		});
		if (!user) {
			throw new NotFoundException(this.i18n.t('errors.users.not-found', { lang: I18nContext.current()?.lang }));
		}
		return user;
	}
}
