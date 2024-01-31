import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../../../db/entities/user.entity';
import {UsersService} from './services/users.service';
import {UsersGateway} from './gateways/users.gateway';
import {AdminGateway} from './gateways/admin.gateway';
import {AdminService} from './services/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersGateway, AdminGateway, UsersService, AdminService],
})
export class UsersModule {}
