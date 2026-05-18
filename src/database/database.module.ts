/**
 * Database module for configuring TypeORM with PostgreSQL in a NestJS application.
 *
 * Uses asynchronous configuration to load database connection settings from environment variables via ConfigService.
 * Supports SSL, logging, and entity autoloading. Synchronization is disabled in production.
 */
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {dataSourceOptions} from './datasource';

/**
 * DatabaseModule class that imports TypeOrmModule with async configuration.
 */
@Module({
	imports: [TypeOrmModule.forRoot(dataSourceOptions)],
})
export class DatabaseModule {}
