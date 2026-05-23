import { GI18nService } from '@/common/services';
import { TransactionService } from '@/database';
import { FileModule } from '@/features/file/file.module';
import { User } from '@/features/users/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([User]), FileModule],
	controllers: [UsersController],
	providers: [UsersService, GI18nService, TransactionService],
})
export class UsersModule {}
