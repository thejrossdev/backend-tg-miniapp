import { Help, Scope, Start } from '@mdreal/nestjs-tg-bot';
import { Injectable } from '@nestjs/common';
import type { Context } from 'grammy';

@Injectable()
@Scope('bot0')
export class BotStartHandler {
	@Start({ description: 'Start the bot' })
	async onStart(ctx: Context) {
		await ctx.reply('Welcome to the bot!');
	}

	@Help({ description: 'Show help' })
	async onHelp(ctx: Context) {
		await ctx.reply('Available commands: /start, /help');
	}
}
