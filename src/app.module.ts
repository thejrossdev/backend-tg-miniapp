import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { LoggerModule, ThrottleModule } from '@/common/modules';
import { validateEnv } from '@/common/utils';
import { DatabaseModule } from '@/database';
import { FileModule } from '@/features/file/file.module';
import { UsersModule } from '@/features/users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { AuthModule } from './features/auth/auth.module';
import { HealthModule } from './features/health/health.module';

/**
 * The root module of the application.
 *
 * Configures global guards, environment validation, and imports all feature modules.
 */
@Module({
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	imports: [
		JwtModule.register({
			global: true,
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			validate: validateEnv,
		}),
		CacheModule.register({
			isGlobal: true,
		}),
		I18nModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				fallbackLanguage: configService.get<string>('FALLBACK_LANGUAGE', 'en'),
				loaderOptions: {
					path: join(__dirname, '/i18n/'),
					watch: true,
				},
			}),
			resolvers: [
				{ use: QueryResolver, options: ['lang'] },
				AcceptLanguageResolver,
				new HeaderResolver(['x-lang']),
			],
			inject: [ConfigService],
		}),
		LoggerModule,
		ThrottleModule,
		DatabaseModule,
		UsersModule,
		AuthModule,
		HealthModule,
		FileModule,
	],
})
export class AppModule {}
