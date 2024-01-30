import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {ChatService} from '../services/chat.service';
import {Server, Socket} from 'socket.io';
import {ChatEvents} from '../types/chatEvents.types';
import {UseFilters, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {WsJwtGuard} from '../../shared/guards/ws-jwt.guard';
import {SocketAuthMiddleware} from '../../shared/middlewares/ws.middleware';
import {WsExceptionFilter} from '../../shared/filters/ws-validation.filter';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
@UseGuards(WsJwtGuard)
@UsePipes(ValidationPipe)
@UseFilters(WsExceptionFilter)
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
