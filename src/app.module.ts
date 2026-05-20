import { SuccessResponseFactory } from '@/common/factories';
import { RequestExceptionFilter } from '@/common/filters';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { SuccessInterceptor } from '@/common/interceptors';
import { LoggerModule, ThrottleModule } from '@/common/modules';
import { ValidatorPipe } from '@/common/pipes';
import { GI18nService } from '@/common/services';
import { validateEnv } from '@/common/utils';
import { DatabaseModule } from '@/database';
import { FileModule } from '@/features/file/file.module';
import { UsersModule } from '@/features/users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'node:path';
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
		GI18nService,
		SuccessResponseFactory,
		{
			provide: APP_INTERCEPTOR,
			useClass: SuccessInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: RequestExceptionFilter,
		},
		{
			provide: APP_PIPE,
			useClass: ValidatorPipe,
		},
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
				typesOutputPath: path.join(__dirname, '../src/generated/i18n.generated.ts'),
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
