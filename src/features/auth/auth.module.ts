import { CryptoService, GI18nService } from '@/common/services';
import { TransactionService } from '@/database';
import { Session } from '@/features/auth/entities';
import { User } from '@/features/users/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Session])],
	controllers: [AuthController],
	providers: [AuthService, CryptoService, TransactionService, GI18nService],
})
export class AuthModule {}
