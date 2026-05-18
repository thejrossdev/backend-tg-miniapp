import {Module} from '@nestjs/common';
import {LoggerModule as PinoLoggerModule} from 'nestjs-pino';
import {ConfigService} from '@nestjs/config'

/**
 * Logger module for application-wide request and response logging using Pino.
 *
 * Configures the Pino logger with pretty-printing and daily log file rotation.
 * Logs are output to both the console and a dated log file under `./storage/logs/`.
 */
@Module({
	imports: [
		PinoLoggerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				forRoutes: ['*'],
				pinoHttp: {
					name: configService.get<string>('APP_NAME', 'anime-api'),
					autoLogging: true,
					transport: {
						targets: [
							{
								target: 'pino-pretty', // Console pretty-print
							},
							{
								target: 'pino-pretty', // File pretty-print
								options: {
									destination: `./storage/logs/${new Date().toISOString().split('T')[0]}.log`,
									mkdir: true,
								},
							},
						],
					},
				},
			}),
		}),
	],
})
export class LoggerModule {
}
