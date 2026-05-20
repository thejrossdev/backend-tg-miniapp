import { Role } from '@/common/constants';
import { Roles, User as UserDec } from '@/common/decorators';
import {
	BadRequestResponseWithError,
	NotFoundResponseWithError,
	UnauthorizedResponse,
	UnauthorizedResponseWithError,
} from '@/common/types';
import { FileService } from '@/features/file/file.service';
import { User } from '@/features/users/entities/user.entity';
import { UserResponseFindAll, UserResponseFindOne, UserResponseMe } from '@/features/users/response';
import { FileInterceptor, MemoryStorageFile, UploadedFile } from '@blazity/nest-file-fastify';
import { Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiProperty,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
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
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<UserResponseFindAll>} An object containing a message and an array of user data.
	 */
	@Get()
	@Roles(Role.ADMIN)
	async findAll(@I18n() i18n: I18nContext): Promise<UserResponseFindAll> {
		const users = await this.usersService.findAll();
		const data = users.map(({ telegramIdEncrypted, telegramIdHash, ...user }) => ({
			...user,
		}));
		return { message: await i18n.t('success.users.find-all'), data };
	}

	/**
	 * Fetches current user.
	 *
	 * @param {User} userReq - current user from Request.
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<UserResponseMe>} An object containing a message and the user data without password.
	 */
	@ApiProperty({
		description: 'UUID of user',
		type: 'string',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		name: 'identifier',
	})
	@ApiOkResponse({
		type: UserResponseMe,
	})
	@ApiNotFoundResponse({
		type: NotFoundResponseWithError,
		example: {
			message: 'User not found.',
			error: 'Not found',
			statusCode: 404,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Get('me')
	async fetchMe(@UserDec() userReq: User, @I18n() i18n: I18nContext): Promise<UserResponseMe> {
		const user = await this.usersService.findOne(userReq.id);
		const { telegramIdEncrypted, telegramIdHash, ...data } = user;
		return { message: await i18n.t('success.users.me'), data };
	}

	/**
	 * Fetches a single user by identifier.
	 *
	 * @param {string} identifier - The identifier of the user (e.g., ID).
	 * @param {I18nContext} i18n - Context for translate.
	 * @returns {Promise<UserResponseFindOne>} An object containing a message and the user data without password.
	 */
	@ApiProperty({
		description: 'UUID of user',
		type: 'string',
		example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		name: 'identifier',
	})
	@ApiOkResponse({
		type: UserResponseFindOne,
	})
	@ApiNotFoundResponse({
		type: NotFoundResponseWithError,
		example: {
			message: 'User not found.',
			error: 'Not found',
			statusCode: 404,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponse,
		example: {
			message: 'Unauthorized',
			statusCode: 401,
		},
	})
	@ApiBearerAuth('Bearer')
	@Roles(Role.ADMIN)
	@Get(':identifier')
	async findOne(@Param('identifier') identifier: string, @I18n() i18n: I18nContext): Promise<UserResponseFindOne> {
		const user = await this.usersService.findOne(identifier);
		const { telegramIdEncrypted, telegramIdHash, ...data } = user;
		return { message: await i18n.t('success.users.find'), data };
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
	@ApiBadRequestResponse({
		type: BadRequestResponseWithError,
		example: {
			message: 'Something went wrong!',
			error: 'Bad request',
			statusCode: 500,
		},
	})
	@ApiUnauthorizedResponse({
		type: UnauthorizedResponseWithError,
		example: {
			message: 'User are invalid!',
			error: 'Unauthorized',
			statusCode: 401,
		},
	})
	@Post()
	async fileTesting(
		@UploadedFile()
		file: MemoryStorageFile,
	) {
		const upFile = await this.fileService.uploadFile(file);
		return upFile;
	}
}
