import { Public } from '@/common/decorators';
import { FileService } from '@/features/file/file.service';
import { FileInterceptor, MemoryStorageFile, UploadedFile } from '@blazity/nest-file-fastify';
import { Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiResponse } from '@nestjs/swagger';
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
	 * @returns {Promise<{ message: string; data: any[] }>} An object containing a message and an array of user data.
	 */
	@Public()
	@Get()
	@ApiResponse({ status: 200, description: 'Successfully retrieved all users' })
	@ApiResponse({ status: 404, description: 'No users found' })
	async findAll(): Promise<{ message: string; data: any[] }> {
		const users = await this.usersService.findAll();
		const data = users.map(({ telegramIdEncrypted, telegramIdHash, ...user }) => ({
			...user,
		}));
		return { message: 'Users fetched successfully', data };
	}

	/**
	 * Fetches a single user by identifier.
	 *
	 * @param {string} identifier - The identifier of the user (e.g., ID).
	 * @returns {Promise<{ message: string; data: any }>} An object containing a message and the user data without password.
	 */
	@Public()
	@Get(':identifier')
	@ApiParam({ name: 'identifier', description: 'User ID' })
	@ApiResponse({ status: 200, description: 'Successfully retrieved the user' })
	@ApiResponse({ status: 404, description: 'User not found' })
	async findOne(@Param('identifier') identifier: string): Promise<{ message: string; data: any }> {
		const user = await this.usersService.findOne(identifier);
		const { telegramIdEncrypted, telegramIdHash, ...data } = user;
		return { message: 'User fetched successfully', data };
	}

	/**
	 * Endpoint for testing file upload.
	 *
	 * @param {MemoryStorageFile} file - The uploaded file.
	 */
	@Public()
	@Post()
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
	@ApiResponse({ status: 201, description: 'File uploaded successfully' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	async fileTesting(
		@UploadedFile()
		file: MemoryStorageFile,
	) {
		const upFile = await this.fileService.uploadFile(file);
		return upFile;
	}
}
