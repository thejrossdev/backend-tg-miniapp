import { CryptoService } from '@/common/services';
import { TransactionService } from '@/database';
import { Session } from '@/features/auth/entities/session.entity';
import { User } from '@/features/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Session])],
	controllers: [AuthController],
	providers: [AuthService, CryptoService, TransactionService],
})
export class AuthModule {}
