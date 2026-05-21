import { Roles, SuccessMessage, User as UserDec } from '@/common/decorators';
import { Role } from '@/common/enums';
import { FileService } from '@/features/file/file.service';
import { User } from '@/features/users/entities';
import { UserExceptionNotFound } from '@/features/users/exceptions';
import { UserSafe } from '@/features/users/types';
import { FileInterceptor, MemoryStorageFile, UploadedFile } from '@blazity/nest-file-fastify';
import { Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { UsersService } from './users.service';

/**
 * Controller for managing user-related operations.
 *
 * Provides endpoints to fetch all users, fetch a single user by identifier,
 * and test file upload functionality.
 */
@Controller('users')
export class UsersController {
	/**
	 * Creates an instance of UsersController.
	 *
	 * @param {UsersService} usersService - Service for user-related operations.
	 * @param {FileService} fileService - Service for file-related operations.
	 */
	constructor(
		private readonly usersService: UsersService,
		private readonly fileService: FileService,
	) {}

	/**
	 * Fetches all users.
	 *
	 * @returns {Promise<UserSafe[]>} An object containing a message and an array of user data.
	 */
	@ApiOkResponse({
		type: UserSafe,
	})
	@Get()
	@Roles(Role.ADMIN)
	@SuccessMessage('success.users.found-all')
	async findAll(): Promise<UserSafe[]> {
		const users = await this.usersService.findAll();
		return users.map((user: User) => this.usersService.getSafeUser(user));
	}

	/**
	 * Fetches current user.
	 *
	 * @param {User} userReq - current user from Request.
	 * @returns {Promise<UserSafe>} An object containing a message and the user data without password.
	 */
	@ApiProperty({
		description: 'UUID of user',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		name: 'identifier',
	})
	@ApiOkResponse({
		type: UserSafe,
	})
	@ApiNotFoundResponse({
		type: UserExceptionNotFound,
	})
	@ApiNotFoundResponse({
		type: UserExceptionNotFound,
	})
	@ApiBearerAuth('Bearer')
	@Get('me')
	@SuccessMessage('success.users.found')
	async fetchMe(@UserDec() userReq: User): Promise<UserSafe> {
		return this.usersService.getSafeUser(await this.usersService.findOne(userReq.id));
	}

	/**
	 * Fetches a single user by identifier.
	 *
	 * @param {string} identifier - The identifier of the user (e.g., ID).
	 * @returns {Promise<UserSafe>} An object containing a message and the user data without password.
	 */
	@ApiProperty({
		description: 'UUID of user',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		name: 'identifier',
	})
	@ApiOkResponse({
		type: UserSafe,
	})
	@ApiNotFoundResponse({
		type: UserExceptionNotFound,
	})
	@ApiBearerAuth('Bearer')
	@Roles(Role.ADMIN)
	@SuccessMessage('success.users.found')
	@Get(':identifier')
	async findOne(@Param('identifier') identifier: string): Promise<UserSafe> {
		return this.usersService.getSafeUser(await this.usersService.findOne(identifier));
	}

	/**
	 * Endpoint for testing file upload.
	 *
	 * @param {MemoryStorageFile} file - The uploaded file.
	 */
	@UseInterceptors(FileInterceptor('file'))
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'File upload',
		required: true,
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
					description: 'File to upload (supports any file type)',
				},
			},
		},
	})
	@Post()
	async fileTesting(
		@UploadedFile()
		file: MemoryStorageFile,
	) {
		return await this.fileService.uploadFile(file);
	}
}
