import {Module} from '@nestjs/common';
import {AuthController} from './controllers/auth.controller';
import {AuthService} from './services/auth.service';
import {JwtStrategy} from '../shared/strategies/jwt.strategy';
import {UsersService} from '../users/services/users.service';
import {JwtService} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../../../db/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService, JwtService],
})
export class AuthModule {}
