import { Help, Scope } from '@mdreal/nestjs-tg-bot';
import { Injectable } from '@nestjs/common';
import type { Context } from 'grammy';

@Injectable()
@Scope('bot0')
export class BotHelpHandler {
	@Help({ description: 'Show help' })
	async onHelp(ctx: Context) {
		await ctx.reply('Available commands: /start, /help');
	}
}
