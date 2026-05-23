import { PartialType } from '@nestjs/swagger';
import { UserDtoCreate } from './create-user.dto';

export class UserDtoUpdate extends PartialType(UserDtoCreate) {}
