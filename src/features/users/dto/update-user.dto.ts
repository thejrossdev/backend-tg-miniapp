import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@/features/auth/dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
