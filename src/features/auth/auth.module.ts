import { GI18nService, TelegramService } from '@/common/services';
import { CookieService } from '@/common/services/cookie.service';
import { TransactionService } from '@/database';
import { Session } from '@/features/auth/entities';
import { User } from '@/features/users/entities';
import { UsersService } from '@/features/users/users.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Session])],
	controllers: [AuthController],
	providers: [AuthService, TelegramService, TransactionService, UsersService, GI18nService, CookieService],
})
export class AuthModule {}
