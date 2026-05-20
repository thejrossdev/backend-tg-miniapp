import { FileModule } from '@/features/file/file.module';
import { User } from '@/features/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([User]), FileModule],
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
