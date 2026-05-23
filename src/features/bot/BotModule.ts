import { BotHelpHandler, BotStartHandler } from '@/features/bot/handlers';
import { TelegramModule } from '@mdreal/nestjs-tg-bot';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		TelegramModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
				mode: 'auto', // "auto" | "polling" | "webhook"
				logging: true, // use NestJS logger
			}),
			name: 'bot0',
			inject: [ConfigService],
		}),
	],
	exports: [],
	providers: [ConfigService, BotStartHandler, BotHelpHandler],
})
export class BotModule {}
