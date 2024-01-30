import {WebSocketGateway, SubscribeMessage, WebSocketServer} from '@nestjs/websockets';
import {ChatService} from '../services/chat.service';
import {Server, Socket} from 'socket.io';
import {ChatEvents} from '../types/chatEvents.types';
import {UseGuards} from '@nestjs/common';
import {WsJwtGuard} from '../../../guards/ws-jwt/ws-jwt.guard';
import {SocketAuthMiddleware} from '../../shared/auth/ws-jwt/ws.middleware';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server<any, ChatEvents> = null;

  afterInit(client: Socket) {
    //TODO type improvement
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('getMessages')
  getMessages() {
    return this.chatService.getMessages();
  }
}
