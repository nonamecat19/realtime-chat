import {Module} from '@nestjs/common';
import {ChatGateway} from './gateways/chat.gateway';
import {ChatService} from './services/chat.service';
import {WsJwtGuard} from '../../guards/ws-jwt/ws-jwt.guard';
import {JwtService} from '@nestjs/jwt';
import {AuthService} from '../auth/services/auth.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../../../db/entities/user.entity';
import {ChatMessage} from '../../../db/entities/chatMessage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChatMessage])],
  providers: [ChatGateway, ChatService, WsJwtGuard, JwtService, AuthService],
})
export class ChatModule {}
