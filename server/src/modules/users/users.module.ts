import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../../../db/entities/user.entity';
import {UsersService} from './services/users.service';
import {UsersGateway} from './gateways/users.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersGateway, UsersService],
})
export class UsersModule {}
