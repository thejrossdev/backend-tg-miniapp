import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const configService = new ConfigService();
const isProduction = configService.get<string>('ENV') === 'production';
const excludeEntities = ['base'];

export const dataSourceOptions: DataSourceOptions = {
	// @ts-expect-error // TypeORM expects predefined strings for type
	type: configService.getOrThrow<string>('DB_TYPE'),
	host: configService.getOrThrow<string>('DB_HOST'),
	port: configService.getOrThrow<number>('DB_PORT'),
	username: configService.getOrThrow<string>('DB_USERNAME'),
	password: configService.getOrThrow<string>('DB_PASSWORD'),
	database: configService.getOrThrow<string>('DB_NAME'),
	entities: isProduction
		? ['dist/**/*.entity.js', ...excludeEntities.map((name) => `!dist/**/${name}.entity.js`)]
		: [join(__dirname, '..', '**', '*.entity.{ts,js}'), ...excludeEntities.map((name) => `!**/${name}.entity.ts`)],
	migrations: isProduction ? ['dist/database/migrations/*.js'] : ['src/database/migrations/*.ts'],
	migrationsTableName: 'migrations',
	migrationsRun: false,
	synchronize: !isProduction,
	logging: !isProduction,
	extra: {
		connectionLimit: 10, // Adjust based on your database connection pool requirements
	},
};

const datasource = new DataSource(dataSourceOptions);

// You might want to do
// dataSource.initialize()
// but I found mine working regardless of it

export default datasource;
