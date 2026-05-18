import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { LoggerModule, ThrottleModule } from '@/common/modules';
import { validateEnv } from '@/common/utils';
import { DatabaseModule } from '@/database';
import { FileModule } from '@/features/file/file.module';
import { UsersModule } from '@/features/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
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
